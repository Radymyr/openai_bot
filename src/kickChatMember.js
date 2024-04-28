import Telegraf from 'telegraf';
const bot = new Telegraf(process.env.BOT_TOKEN);

export async function kickMembers(ctx) {
  try {
    await bot.telegram.kickChatMember(ctx.chat.id, ctx.message.from.id);

    await ctx.reply(`user: ${ctx.message.from.id} is kicked`);

    console.log(
      'userID:',
      ctx.message.from.id,
      'user name:',
      ctx.from.first_name
    );
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
