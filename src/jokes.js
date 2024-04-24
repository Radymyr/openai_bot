import { kickMembers } from './kickChatMember.js';

export function getJokes(ctx, text) {
  try {
    if (text?.includes('герман' || 'германио')) {
      const random = Math.random();
      const randomPrase =
        random < 0.5 ? 'Правильно говорить "Гермиона"!!' : 'Оо, Гермиона 😁';
      ctx.reply(randomPrase, {
        reply_to_message_id: ctx.message.message_id,
      });

      return;
    }

    if (text?.includes('хорошо' && 'гермиона')) {
      ctx.reply('Вот вот, запомни)', {
        reply_to_message_id: ctx.message.message_id,
      });

      return;
    }

    if (text?.includes('минет')) {
      ctx.reply(`I will destroy you for these words 👊`, {
        reply_to_message_id: ctx.message.message_id,
      });
      setTimeout(() => {
        kickMembers(ctx);
      }, 5000);

      return;
    }
  } catch (error) {
    console.error(error);
  }
}
