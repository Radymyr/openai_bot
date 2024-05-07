import Telegraf from 'telegraf';
import { createClient } from 'redis';
import OpenAI from 'openai';
export const bot = new Telegraf(process.env.BOT_TOKEN);
export const groupId = '-1002004405293';
export const emptyMessage = 'Message content is empty';

const apiKey = process.env.OPENAI_API_KEY;

export const openAi = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.deepseek.com',
});

export const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.PUBLIC_ENDPOINT,
    port: process.env.REDIS_PORT,
  },
});

client.connect((err) => {
  if (err) {
    console.error('Error connecting to Redis:', err);
  } else {
    console.log('Connected to Redis');
  }
});
