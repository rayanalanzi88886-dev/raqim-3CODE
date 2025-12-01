import OpenAI from 'openai';

// DeepSeek API متوافق مع OpenAI SDK
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function generateChatResponse(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: `أنت "رقيم" - مساعد ذكي شخصي عربي متخصص في:
- إدارة المشاريع والأفكار
- إنشاء المحتوى بجودة عالية
- تنظيم القرارات والملاحظات
- تقديم إجابات واضحة ومفيدة

قدم ردوداً احترافية ومنظمة باللغة العربية الفصحى.`,
      },
      ...conversationHistory.slice(-10), // آخر 10 رسائل فقط
      {
        role: 'user' as const,
        content: message,
      },
    ];

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من توليد رد.';
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    throw new Error('فشل في الاتصال بـ DeepSeek API');
  }
}
