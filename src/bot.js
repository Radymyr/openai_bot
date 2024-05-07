import 'dotenv/config';
import express from 'express';
const app = express();

import { openAi } from './initializers.js';
import { addToContext } from './addNewContext.js';
import { dictionary } from './dictionary.js';
import { getJokes } from './jokes.js';
import { bot } from './initializers.js';
import { USERS_ID } from './dictionary.js';
import { groupId } from './initializers.js';
import { emptyMessage } from './initializers.js';

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  res.send('hello, i am start page');
});

async function getDataFromOpenAi(userId, message = emptyMessage) {
  try {
    if (!message.content) {
      console.error('Error: Message content is empty');
      return;
    }

    const userMessage = { role: 'user', content: message.content };

    const messages = await addToContext(userMessage, userId);

    const completion = await openAi.chat.completions.create({
      messages,
      model: 'deepseek-chat',
    });

    const answer = completion.choices[0].message;

    await addToContext(answer, userId);

    return answer.content;
  } catch (error) {
    console.error('Error sending message to openai', error);
  }
}

bot.on('message', async (ctx, next) => {
  console.log('information message:', ctx.message);
  if (ctx.message?.from.id === USERS_ID[0].id) {
    ctx.reply('🖕');
    return;
  }

  if (
    ctx.message?.from.id === 275210708 &&
    ctx.chat.id === 275210708 &&
    !ctx.message?.reply_to_message?.from.is_bot
  ) {
    bot.telegram.sendMessage(
      groupId,
      ctx.message?.text || 'non-textual content'
    );
  } else {
    !ctx.message?.reply_to_message?.from.is_bot &&
      bot.telegram.sendMessage(
        '275210708',
        `${ctx.from?.first_name}: ${ctx.message?.text || 'non-textual content'}`
      );
  }

  next();
});

bot.on('message', async (ctx) => {
  console.log(ctx?.message);
  try {
    if (ctx.message?.voice && ctx.message?.reply_to_message?.from.is_bot) {
      ctx.reply(`Слышите, вроде как собака скулит 🦮`, {
        reply_to_message_id: ctx.message.message_id,
      });
      return;
    }

    if (ctx.message?.video_note && ctx.message?.reply_to_message?.from.is_bot) {
      ctx.reply(`Ух какая милая мордашка, подрочу на нее позже 😏`, {
        reply_to_message_id: ctx.message.message_id,
      });
      return;
    }

    if (!ctx.message.text && ctx.message?.reply_to_message?.from.is_bot) {
      ctx.reply(
        `Ха, ха ${ctx.from.first_name}, смешно, но больше так не делай, а то найду и выебу 🍆🍆🍆`,
        { reply_to_message_id: ctx.message.message_id }
      );
      return;
    }

    if (!ctx.message.text) {
      return;
    }

    const loweredText = ctx.message.text?.toLowerCase();

    getJokes(ctx, loweredText);

    if (ctx.message.reply_to_message?.from.is_bot) {
      console.log('bot replay to message');
      const originalMessage = ctx.message.message_id;

      const response = await getDataFromOpenAi(ctx.message.from.id, {
        role: 'user',
        content: ctx.message?.text || '',
      });
      ctx.reply(response, {
        reply_to_message_id: originalMessage,
      });
    }

    for (const name of dictionary) {
      if (loweredText?.includes(name)) {
        console.log('calling bot by name...');
        const response = await getDataFromOpenAi(ctx.message.from.id, {
          role: 'user',
          content: ctx.message?.text || '',
        });

        ctx.reply(response, {
          reply_to_message_id: ctx.message.message_id,
        });

        return;
      }
    }
  } catch (err) {
    ctx.reply(
      `Прости бро ${ctx.from.first_name}, я не знаю как это понимать, напиши текстом ;)`,
      { reply_to_message_id: ctx.message.message_id }
    );
    console.error(err);
  }
});

bot.launch();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
