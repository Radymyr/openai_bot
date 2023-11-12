const { OpenAI } = require('openai');
const { Telegraf } = require('telegraf');

const { OPENAI_API_KEY } = require('./pass.js');
const { BOT_TOKEN } = require('./pass.js');

const bot = new Telegraf(BOT_TOKEN);
const fs = require('fs');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function getRequest(id, userContent = null) {
  const messages = [
    {
      role: 'user',
      content: userContent,
    },
  ];

  let roles = [];
  let combinedData = [];
  let systemRules = {
    role: 'system',
    content: 'твое имя "Саня Зелень"',
  };

  try {
    combinedData = JSON.parse(fs.readFileSync(`${id}.json`, 'utf-8'));
  } catch {
    fs.writeFileSync(`${id}.json`, JSON.stringify([systemRules]));
  }

  try {
    roles = JSON.parse(fs.readFileSync(`${id}.json`, 'utf-8'));
    console.log('data:', roles);
  } catch (err) {
    console.error(err);
  }

  console.log('Data sent to OpenAI server:', [
    roles[0],
    ...combinedData.slice(-4),
    ...messages,
  ]);

  const completion = await openai.chat.completions.create({
    messages: [roles[0], ...combinedData.slice(-2), ...messages],
    model: 'gpt-3.5-turbo',
  });

  const answer = await completion.choices[0].message;

  combinedData = [...roles, ...messages, answer];
  fs.writeFileSync(`${id}.json`, JSON.stringify(combinedData));

  return answer.content;
}

bot.on('message', async (ctx) => {
  console.log(ctx.message);
  try {
    if (ctx.message.reply_to_message?.from.is_bot) {
      const originalMessage = ctx.message.reply_to_message;
      const response = await getRequest(ctx.from.id, ctx.message.text);
      ctx.reply(response, {
        reply_to_message_id: originalMessage.message_id,
      });
    }

    if (ctx.message.text?.includes('@Cheese_GPT_bot')) {
      const response = await getRequest(ctx.from.id, ctx.message.text);

      ctx.reply(response, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (err) {
    if (!ctx.message.text) {
      ctx.reply(
        `Прости бро ${ctx.from.first_name}, я не знаю как это понимать, напиши текстом ;)`,
        { reply_to_message_id: ctx.message.message_id }
      );
    }
    console.log(err);
  }
});

bot.launch();
