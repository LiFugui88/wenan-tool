import { PromptConfig } from '@/types';

interface CallOpenRouterParams {
  prompt: PromptConfig;
  variables: Record<string, string>;
  apiKey: string;
  model: string;
}

export async function callOpenRouter({
  prompt,
  variables,
  apiKey,
  model
}: CallOpenRouterParams): Promise<string> {
  // 替换变量
  let systemPrompt = prompt.system;
  let userPrompt = prompt.user;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    systemPrompt = systemPrompt.replace(regex, value);
    userPrompt = userPrompt.replace(regex, value);
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      'X-Title': '文案仿写测试工具'
    },
    body: JSON.stringify({
      model: prompt.model || model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '请求失败');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export function parseJsonFromResponse(response: string): Record<string, unknown> | null {
  try {
    // 尝试直接解析
    return JSON.parse(response);
  } catch {
    // 尝试从 markdown 代码块中提取
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        return null;
      }
    }

    // 尝试找到 JSON 对象
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        return null;
      }
    }

    return null;
  }
}
