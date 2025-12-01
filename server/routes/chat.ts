import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { evaluateResponse, detectContradictions } from '../services/evaluator';

const router = Router();

// In-memory message storage
interface Message {
  id: string;
  sessionId: string | null;
  role: 'user' | 'assistant';
  content: string;
  qualityScore: number | null;
  evaluation: {
    length: { score: number; feedback: string };
    repetition: { score: number; feedback: string };
    structure: { score: number; feedback: string };
  } | null;
  contradictions: string[];
  createdAt: Date;
}

const messages: Message[] = [];

// POST /api/chat
router.post('/', async (req: Request, res: Response) => {
  const { sessionId, message, context } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Store user message
  const userMessage: Message = {
    id: uuidv4(),
    sessionId: sessionId || null,
    role: 'user',
    content: message,
    qualityScore: null,
    evaluation: null,
    contradictions: [],
    createdAt: new Date(),
  };
  messages.push(userMessage);

  // Generate AI response (mock for demo - replace with OpenAI in production)
  const assistantContent = generateMockResponse(message, context);
  
  // Evaluate the response quality
  const evaluation = evaluateResponse(assistantContent);
  const contradictions = detectContradictions(assistantContent);

  // Store assistant message with evaluation
  const assistantMessage: Message = {
    id: uuidv4(),
    sessionId: sessionId || null,
    role: 'assistant',
    content: assistantContent,
    qualityScore: evaluation.overallScore,
    evaluation: {
      length: evaluation.length,
      repetition: evaluation.repetition,
      structure: evaluation.structure,
    },
    contradictions,
    createdAt: new Date(),
  };
  messages.push(assistantMessage);

  res.json({
    success: true,
    data: {
      userMessage,
      assistantMessage,
    },
  });
});

// POST /api/chat/improve
router.post('/improve', async (req: Request, res: Response) => {
  const { messageId, improvementType } = req.body;
  
  const originalMessage = messages.find(m => m.id === messageId);
  if (!originalMessage || originalMessage.role !== 'assistant') {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  // Generate improved response based on type
  let improvedContent = originalMessage.content;
  
  switch (improvementType) {
    case 'shorter':
      improvedContent = makeShorter(originalMessage.content);
      break;
    case 'longer':
      improvedContent = makeLonger(originalMessage.content);
      break;
    case 'restructure':
      improvedContent = restructure(originalMessage.content);
      break;
    default:
      // General improvement
      improvedContent = generalImprove(originalMessage.content);
  }

  // Re-evaluate
  const evaluation = evaluateResponse(improvedContent);
  const contradictions = detectContradictions(improvedContent);

  // Create new improved message
  const improvedMessage: Message = {
    id: uuidv4(),
    sessionId: originalMessage.sessionId,
    role: 'assistant',
    content: improvedContent,
    qualityScore: evaluation.overallScore,
    evaluation: {
      length: evaluation.length,
      repetition: evaluation.repetition,
      structure: evaluation.structure,
    },
    contradictions,
    createdAt: new Date(),
  };
  messages.push(improvedMessage);

  res.json({
    success: true,
    data: improvedMessage,
  });
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const sessionMessages = messages.filter(m => m.sessionId === sessionId);
  res.json({ success: true, data: sessionMessages });
});

// Helper functions for mock responses
function generateMockResponse(userMessage: string, _context?: string): string {
  // Simple mock responses for demo
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('مرحبا') || lowerMessage.includes('أهلا')) {
    return `أهلاً وسهلاً! أنا رقيم، مساعدك الذكي الشخصي.

**كيف يمكنني مساعدتك اليوم؟**

يمكنني مساعدتك في:
- إدارة المشاريع والأفكار
- إنشاء المحتوى بمراحل منظمة
- تنظيم القرارات والملاحظات
- الإجابة على استفساراتك

ما الذي تود البدء به؟`;
  }
  
  if (lowerMessage.includes('مشروع') || lowerMessage.includes('عمل')) {
    return `سأساعدك في إدارة مشروعك. 

**خطوات البدء:**

1. **تحديد الهدف**: ما هو الهدف الرئيسي للمشروع؟
2. **تقسيم المهام**: قسّم المشروع إلى مهام صغيرة قابلة للتنفيذ
3. **جدولة زمنية**: حدد مواعيد نهائية واقعية
4. **المتابعة**: راجع التقدم بشكل دوري

**ملاحظة**: يمكنك استخدام لوحة Brain لتتبع المشاريع والقرارات.

هل تود إنشاء مشروع جديد الآن؟`;
  }
  
  if (lowerMessage.includes('محتوى') || lowerMessage.includes('كتابة') || lowerMessage.includes('مقال')) {
    return `سأساعدك في إنشاء محتوى عالي الجودة!

**مراحل إنشاء المحتوى في Workbench:**

| المرحلة | الوصف |
|---------|-------|
| 💡 الفكرة | توليد الأفكار الإبداعية |
| 🔍 البحث | جمع المعلومات والمصادر |
| 📋 المخطط | إنشاء هيكل المحتوى |
| ✍️ المسودة | كتابة النص الأولي |
| ✨ التحسين | مراجعة وتحسين الجودة |
| 📅 الجدولة | تحديد موعد النشر |

**نصائح:**
- ابدأ بفكرة واضحة ومحددة
- اجمع مصادر موثوقة
- راجع المحتوى أكثر من مرة

انتقل إلى Workbench للبدء في إنشاء محتواك!`;
  }

  // Default response
  return `شكراً على رسالتك!

أنا رقيم، مساعدك الذكي. يمكنني مساعدتك في:

**الخدمات المتاحة:**
- إدارة المشاريع والأفكار
- إنشاء المحتوى
- تنظيم القرارات
- الإجابة على الأسئلة

**للبدء:**
استخدم لوحة Brain لإدارة مشاريعك، أو Workbench لإنشاء المحتوى.

كيف يمكنني مساعدتك اليوم؟`;
}

function makeShorter(content: string): string {
  // Simple shortening - take first few sentences
  const sentences = content.split(/[.!?؟]\s*/);
  return sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
}

function makeLonger(content: string): string {
  return content + '\n\n**تفاصيل إضافية:**\nيمكنني توضيح أي نقطة بشكل أكبر. لا تتردد في السؤال عن التفاصيل.';
}

function restructure(content: string): string {
  const lines = content.split('\n').filter(l => l.trim());
  return '## الملخص\n\n' + lines.join('\n\n');
}

function generalImprove(content: string): string {
  return content.replace(/\n\n/g, '\n\n---\n\n');
}

export default router;
