import Telegraf from 'telegraf';
const bot = new Telegraf(process.env.BOT_TOKEN);

export async function kickMembers(ctx) {
  try {
    await bot.telegram.kickChatMember(ctx.chat.id, ctx.message.from.id);

    await ctx.reply(`user is kicked`);

    console.log(ctx.message.from.id);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
