const { OpenAI } = require('openai');
const { Telegraf } = require('telegraf');

const { OPENAI_API_KEY } = require('./pass.js');
const { BOT_TOKEN } = require('./pass.js');

const bot = new Telegraf(BOT_TOKEN);
const fs = require('fs/promises');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const getDate = (milliseconds) => {
  const date = new Date(milliseconds * 1000);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

async function getRequest(userId, groupId = 0, date, userContent = null) {
  const messages = [
    {
      role: 'user',
      content: userContent,
    },
  ];

  let combinedData = [];
  let systemRules = {
    role: 'system',
    content: 'твое имя "Саня Зелень"',
  };
  const MAX_LENGTH_CONTEXT = -3;

  try {
    combinedData = JSON.parse(
      await fs.readFile(generateFileName(groupId, userId, date), 'utf-8')
    );
  } catch {
    await fs.writeFile(
      generateFileName(groupId, userId, date),
      JSON.stringify([systemRules])
    );
    combinedData = [systemRules];
  }

  // console.log('Data sent to OpenAI server:', [
  //   combinedData[0],
  //   ...combinedData.slice(MAX_LENGTH_CONTEXT),
  //   ...messages,
  // ]);

  const completion = await openai.chat.completions.create({
    messages: [
      combinedData[0],
      ...combinedData.slice(MAX_LENGTH_CONTEXT),
      ...messages,
    ],
    model: 'gpt-3.5-turbo',
  });

  const answer = await completion.choices[0].message;

  combinedData = [...combinedData, ...messages, answer];
  await fs.writeFile(
    generateFileName(groupId, userId, date),
    JSON.stringify(combinedData)
  );

  function generateFileName(groupId, userId, date) {
    return `${groupId}-${userId}-${getDate(date)}.json`;
  }

  return answer.content;
}

bot.on('message', async (ctx) => {
  console.log(ctx.message);
  try {
    if (ctx.message.reply_to_message?.from.is_bot) {
      const originalMessage = ctx.message.reply_to_message;
      const response = await getRequest(
        ctx.chat.id,
        ctx.from.id,
        ctx.message.date,
        ctx.message.text
      );
      ctx.reply(response, {
        reply_to_message_id: originalMessage.message_id,
      });
    }

    if (ctx.message.text?.includes('@Cheese_GPT_bot')) {
      const response = await getRequest(
        ctx.chat.id,
        ctx.from.id,
        ctx.message.date,
        ctx.message.text
      );

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
    console.error(err);
  }
});

bot.launch();
