import { AlertTriangle, Check, X } from 'lucide-react';

interface Evaluation {
  length: { score: number; feedback: string };
  repetition: { score: number; feedback: string };
  structure: { score: number; feedback: string };
}

interface MessageInspectorProps {
  evaluation: Evaluation;
  contradictions: string[];
  overallScore: number;
}

function MessageInspector({ evaluation, contradictions, overallScore }: MessageInspectorProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      {/* Overall Score */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">التقييم الكلي</span>
        <div className="flex items-center gap-2">
          <ScoreBar score={overallScore} />
          <span className={`text-lg font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </span>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="space-y-3">
        <ScoreItem
          label="الطول"
          score={evaluation.length.score}
          feedback={evaluation.length.feedback}
        />
        <ScoreItem
          label="التكرار"
          score={evaluation.repetition.score}
          feedback={evaluation.repetition.feedback}
        />
        <ScoreItem
          label="البنية"
          score={evaluation.structure.score}
          feedback={evaluation.structure.feedback}
        />
      </div>

      {/* Contradictions Warning */}
      {contradictions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-700 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">تناقضات محتملة</span>
          </div>
          <ul className="space-y-1">
            {contradictions.map((c, i) => (
              <li key={i} className="text-sm text-yellow-600 flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
  feedback: string;
}

function ScoreItem({ label, score, feedback }: ScoreItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-20 flex-shrink-0">
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <ScoreBar score={score} size="sm" />
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>
            {score}%
          </span>
        </div>
        <p className="text-xs text-gray-500">{feedback}</p>
      </div>
    </div>
  );
}

interface ScoreBarProps {
  score: number;
  size?: 'sm' | 'md';
}

function ScoreBar({ score, size = 'md' }: ScoreBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const width = size === 'sm' ? 'w-20' : 'w-32';
  
  return (
    <div className={`${width} ${height} bg-gray-200 rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${getScoreBgColor(score)}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-green-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

export default MessageInspector;
