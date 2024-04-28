import { bot } from './bot';

export function sendToGroup(
  command = 'sendToGroup',
  groupId = '-1002004405293',
  message = 'hello, i am robot cyborg killer'
) {
  bot.command(
    command,
    async (ctx) => await bot.telegram.sendMessage(groupId, message)
  );
}
