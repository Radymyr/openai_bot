import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'sk-proj-UCehSnvn8IKY5L2oIUKYT3BlbkFJ3hsNzglGJCbHCVpETp8Z',
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: 'You are a helpful assistant.' }],
    model: 'gpt-3.5-turbo',
  });

  console.log(completion.choices[0]);
}

main();
