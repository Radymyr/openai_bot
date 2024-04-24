import { client } from './bot.js';

const saveToRedis = async (key, data) => {
  try {
    await client.set(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to Redis:', error.message);
  }
};

const getFromRedis = async (key) => {
  try {
    const data = await client.get(key);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting from Redis:', error.message);
  }
};

const removingContext = (context) => {
  const CONTEXT_LENGTH = -3;
  const newContext = context.slice(CONTEXT_LENGTH);

  return newContext;
};

export const addToContext = async (message, userId, answer = {}) => {
  try {
    const stringUserId = userId.toString();

    const systemSettings = {
      role: 'system',
      content: 'твое имя Саня Зелень',
    };

    if (!message.content) {
      console.error('Error: Message content is empty');
      return;
    }

    const context = await getFromRedis(stringUserId);

    const filteredContext = context.filter((item) => item);

    const removedContext = removingContext(filteredContext);

    let newContext = [];

    if (Object.keys(answer).length > 0) {
      newContext = [systemSettings, ...removedContext, message, answer];
    } else {
      newContext = [systemSettings, ...removedContext, message];
    }

    console.log('ID_USER:', userId, 'newContext:', newContext);

    await saveToRedis(stringUserId, newContext);

    return newContext;
  } catch (error) {
    console.error('Error in addToContext:', error);
    throw error;
  }
};
