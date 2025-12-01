// Quality evaluation service for AI responses

export interface EvaluationResult {
  length: { score: number; feedback: string };
  repetition: { score: number; feedback: string };
  structure: { score: number; feedback: string };
  overallScore: number;
}

/**
 * Evaluate the quality of an AI response
 */
export function evaluateResponse(content: string): EvaluationResult {
  const lengthEval = evaluateLength(content);
  const repetitionEval = evaluateRepetition(content);
  const structureEval = evaluateStructure(content);

  const overallScore = Math.round(
    (lengthEval.score + repetitionEval.score + structureEval.score) / 3
  );

  return {
    length: lengthEval,
    repetition: repetitionEval,
    structure: structureEval,
    overallScore,
  };
}

/**
 * Evaluate response length
 * Ideal: 100-500 words for most responses
 */
function evaluateLength(content: string): { score: number; feedback: string } {
  const words = content.trim().split(/\s+/).length;
  
  if (words < 20) {
    return { score: 30, feedback: 'الرد قصير جداً. يُفضّل إضافة المزيد من التفاصيل.' };
  } else if (words < 50) {
    return { score: 60, feedback: 'الرد قصير. قد يحتاج لمزيد من الشرح.' };
  } else if (words <= 200) {
    return { score: 100, feedback: 'طول الرد مثالي ومناسب.' };
  } else if (words <= 400) {
    return { score: 90, feedback: 'طول الرد جيد ومفصّل.' };
  } else if (words <= 600) {
    return { score: 75, feedback: 'الرد طويل نسبياً. قد يكون مفصّلاً أكثر من اللازم.' };
  } else {
    return { score: 50, feedback: 'الرد طويل جداً. يُفضّل اختصاره.' };
  }
}

/**
 * Detect repetition in the response
 */
function evaluateRepetition(content: string): { score: number; feedback: string } {
  const sentences = content.split(/[.!?؟،\n]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length < 2) {
    return { score: 100, feedback: 'لا يوجد تكرار ملحوظ.' };
  }

  // Check for repeated phrases (3+ words)
  const phrases: Map<string, number> = new Map();
  const words = content.toLowerCase().split(/\s+/);
  
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i+1]} ${words[i+2]}`;
    phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
  }

  const repeatedPhrases = Array.from(phrases.values()).filter(count => count > 2).length;
  
  // Check for repeated sentences
  const sentenceSet = new Set<string>();
  let repeatedSentences = 0;
  
  for (const sentence of sentences) {
    const normalized = sentence.trim().toLowerCase();
    if (sentenceSet.has(normalized)) {
      repeatedSentences++;
    }
    sentenceSet.add(normalized);
  }

  if (repeatedSentences > 2 || repeatedPhrases > 5) {
    return { score: 40, feedback: 'يوجد تكرار ملحوظ في المحتوى. يُنصح بإعادة الصياغة.' };
  } else if (repeatedSentences > 0 || repeatedPhrases > 2) {
    return { score: 70, feedback: 'يوجد بعض التكرار. يمكن تحسين التنوع في الصياغة.' };
  } else {
    return { score: 100, feedback: 'لا يوجد تكرار. المحتوى متنوع وجيد.' };
  }
}

/**
 * Evaluate response structure
 * Checks for: paragraphs, lists, headers, formatting
 */
function evaluateStructure(content: string): { score: number; feedback: string } {
  let score = 70; // Base score
  const feedback: string[] = [];

  // Check for paragraphs
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length >= 2) {
    score += 10;
    feedback.push('تقسيم جيد للفقرات');
  }

  // Check for lists (bullet points or numbered)
  const hasList = /[-•*]\s|^\d+\.\s/m.test(content);
  if (hasList) {
    score += 10;
    feedback.push('استخدام جيد للقوائم');
  }

  // Check for headers
  const hasHeaders = /^#{1,3}\s|^\*\*[^*]+\*\*$/m.test(content);
  if (hasHeaders) {
    score += 10;
    feedback.push('وجود عناوين تنظيمية');
  }

  // Check for code blocks (if technical)
  const hasCode = /```[\s\S]*?```|`[^`]+`/.test(content);
  if (hasCode) {
    score += 5;
    feedback.push('تنسيق جيد للأكواد');
  }

  // Cap at 100
  score = Math.min(score, 100);

  if (score >= 90) {
    return { score, feedback: 'بنية ممتازة: ' + feedback.join('، ') };
  } else if (score >= 70) {
    return { score, feedback: 'بنية جيدة. ' + (feedback.length > 0 ? feedback.join('، ') : 'يمكن إضافة تنظيم أفضل.') };
  } else {
    return { score, feedback: 'البنية تحتاج تحسين. يُنصح بتقسيم المحتوى وإضافة عناوين.' };
  }
}

/**
 * Check for contradictions (basic implementation)
 * Returns potential contradictory statements
 */
export function detectContradictions(content: string): string[] {
  const contradictions: string[] = [];
  const sentences = content.split(/[.!?؟]\s*/).filter(s => s.trim().length > 10);
  
  // Simple negation patterns to check
  const negationPairs = [
    ['دائماً', 'أبداً'],
    ['نعم', 'لا'],
    ['يجب', 'لا يجب'],
    ['ممكن', 'مستحيل'],
    ['صحيح', 'خاطئ'],
    ['always', 'never'],
    ['yes', 'no'],
    ['must', 'must not'],
  ];

  for (const [pos, neg] of negationPairs) {
    const hasPos = sentences.some(s => s.includes(pos));
    const hasNeg = sentences.some(s => s.includes(neg));
    
    if (hasPos && hasNeg) {
      contradictions.push(`تناقض محتمل بين "${pos}" و "${neg}"`);
    }
  }

  return contradictions;
}
