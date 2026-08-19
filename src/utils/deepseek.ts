import OpenAI from 'openai';

const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '';

export const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey,
});

export const DEEPSEEK_CHAT_MODEL = 'deepseek-chat';
export const DEEPSEEK_REASONER_MODEL = 'deepseek-reasoner';

export interface DeepSeekChatParams {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function deepseekChat({
  systemPrompt,
  userPrompt,
  model = DEEPSEEK_CHAT_MODEL,
  temperature = 0.2,
  maxTokens = 2048,
}: DeepSeekChatParams): Promise<string> {
  if (!apiKey) {
    throw new Error('DeepSeek API key is not configured. Set DEEPSEEK_API_KEY in your environment.');
  }

  const completion = await deepseek.chat.completions.create({
    model,
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return completion.choices[0]?.message?.content ?? '';
}
