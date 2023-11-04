const { OpenAI } = require('openai');
const { Telegraf } = require('telegraf');

const { OPENAI_API_KEY } = require('./pass.js');
const { BOT_TOKEN } = require('./pass.js');

const bot = new Telegraf(BOT_TOKEN);
const fs = require('fs');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

let messages = [
  {
    role: 'user',
    content: 'на русском',
  },
];

async function main(messages) {
  let data = null;
  let combinedData = JSON.parse(fs.readFileSync('message.json', 'utf-8'));

  const completion = await openai.chat.completions.create({
    messages: [...combinedData, ...messages],
    model: 'gpt-3.5-turbo',
  });

  const answer = await completion.choices[0].message;

  try {
    data = JSON.parse(fs.readFileSync('message.json', 'utf-8'));
  } catch (err) {
    console.error(err);
  }

  combinedData = [...data, ...messages, answer];
  fs.writeFileSync('message.json', JSON.stringify(combinedData));
}

// main(messages);

bot.on('message', async (ctx) => {
  console.log(ctx.message);

  try {
    if (ctx.message.video_note) {
      ctx.reply(`${ctx.from.first_name}, позже гляну`, {
        chat_id: ctx.chat.id,
      });
      return;
    }

    if (ctx.message.voice) {
      ctx.reply(
        `Прости бро ${ctx.from.first_name}, мне мамка запрещает слушать голосовые`,
        { chat_id: ctx.chat.id }
      );
      return;
    }

    if (ctx.message.reply_to_message?.from.is_bot) {
      const originalMessage = ctx.message.reply_to_message;

      ctx.reply('это ответ на сообщение', {
        reply_to_message_id: originalMessage.message_id,
      });
    }

    if (ctx.message.text.includes('@Cheese_GPT_bot')) {
      ctx.reply(`Hello @${ctx.from.username}, ты обратился к боту через @`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

bot.launch();
