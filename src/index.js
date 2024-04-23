import OpenAI from 'openai';
import Telegraf from 'telegraf';
import { createClient } from 'redis';
import 'dotenv/config';

import { kickMembers } from './kickChatMember.js';
import { addToContext } from './addNewContext.js';

const bot = new Telegraf(process.env.BOT_TOKEN);
const apiKey = process.env.OPENAI_API_KEY;

const openAi = new OpenAI({
  apiKey: apiKey,
});

export const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.PUBLIC_ENDPOINT,
    port: process.env.PORT,
  },
});

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect();

// bot.on('message', kickMembers);

async function getDataFromOpenAi(userId, message) {
  const userMessage = { role: 'user', content: message.content };

  const messages = await addToContext(userMessage, userId);

  const completion = await openAi.chat.completions.create({
    messages,
    model: 'gpt-3.5-turbo',
  });

  const answer = await completion.choices[0].message;

  // Просто добавляем ответ в контекст
  await addToContext(answer, userId);

  return answer.content;
}

bot.on('message', async (ctx) => {
  const dictionary = [];
  console.log(ctx.message);
  try {
    if (ctx.message.from.is_bot) {
      return;
    }

    if (ctx.message.reply_to_message?.from.is_bot) {
      console.log('bot replay to message');
      const originalMessage = ctx.message.reply_to_message;
      const response = await getDataFromOpenAi(ctx.message.from.id, {
        role: 'user',
        content: ctx.message.text,
      });
      ctx.reply(response, {
        reply_to_message_id: originalMessage.message_id,
      });
    }

    if (ctx.message.text?.includes('Бро')) {
      console.log('calling bot by name...');
      const response = await getDataFromOpenAi(ctx.message.from.id, {
        role: 'user',
        content: ctx.message.text,
      });

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
