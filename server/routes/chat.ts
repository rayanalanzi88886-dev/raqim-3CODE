import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { evaluateResponse, detectContradictions } from '../services/evaluator';
import { generateChatResponse } from '../services/deepseek';

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
  createdAt: string;
}

const messages: Message[] = [];

// POST /api/chat
router.post('/', async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  try {
    // Store user message
    const userMessage: Message = {
      id: uuidv4(),
      sessionId: sessionId || null,
      role: 'user',
      content: message,
      qualityScore: null,
      evaluation: null,
      contradictions: [],
      createdAt: new Date().toISOString(),
    };
    messages.push(userMessage);

    // Get conversation history for context
    const conversationHistory = messages
      .filter(m => m.sessionId === sessionId)
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    // Generate AI response using DeepSeek
    const assistantContent = await generateChatResponse(message, conversationHistory);
    
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
      createdAt: new Date().toISOString(),
    };
    messages.push(assistantMessage);

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'حدث خطأ في المحادثة' 
    });
  }
});

// POST /api/chat/improve
router.post('/improve', async (req: Request, res: Response) => {
  const { messageId, improvementType } = req.body;
  
  const originalMessage = messages.find(m => m.id === messageId);
  if (!originalMessage || originalMessage.role !== 'assistant') {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  try {
    // Generate improvement prompt based on type
    let improvementPrompt = '';
    
    switch (improvementType) {
      case 'shorter':
        improvementPrompt = `اختصر هذا النص مع الحفاظ على المعنى الأساسي:\n\n${originalMessage.content}`;
        break;
      case 'longer':
        improvementPrompt = `قم بتوسيع هذا النص وإضافة المزيد من التفاصيل:\n\n${originalMessage.content}`;
        break;
      case 'restructure':
        improvementPrompt = `أعد هيكلة هذا النص بطريقة أفضل وأكثر وضوحاً:\n\n${originalMessage.content}`;
        break;
      default:
        improvementPrompt = `حسّن هذا النص وجعله أكثر احترافية:\n\n${originalMessage.content}`;
    }

    // Generate improved response using DeepSeek
    const improvedContent = await generateChatResponse(improvementPrompt, []);

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
      createdAt: new Date().toISOString(),
    };
    messages.push(improvedMessage);

    res.json({
      success: true,
      data: improvedMessage,
    });
  } catch (error) {
    console.error('Improve error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'فشل في تحسين الرسالة' 
    });
  }
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const sessionMessages = messages.filter(m => m.sessionId === sessionId);
  res.json({ success: true, data: sessionMessages });
});

export default router;
