const { OpenAI } = require('openai');
const OPENAI_API_KEY = require('./pass.js');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

let messages = [
  {
    role: 'user',
    content: 'на русском',
  },
];

async function main(messages) {
  let data = null;
  let combinedData = JSON.parse(fs.readFileSync('message.json', 'utf-8'));

  const completion = await openai.chat.completions.create({
    messages: [...combinedData, ...messages],
    model: 'gpt-3.5-turbo',
  });

  const answer = await completion.choices[0].message;

  try {
    data = JSON.parse(fs.readFileSync('message.json', 'utf-8'));
  } catch (err) {
    console.log(err);
  }

  combinedData = [...data, ...messages, answer];
  fs.writeFileSync('message.json', JSON.stringify(combinedData));
}

main(messages);
