import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Lightbulb, 
  Search, 
  List, 
  FileText, 
  Sparkles, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Plus
} from 'lucide-react';

type StageType = 'idea' | 'research' | 'outline' | 'draft' | 'improve' | 'schedule';

interface Stage {
  stage: StageType;
  name: string;
  description: string;
  order: number;
}

interface WorkflowState {
  workflowId: string;
  stage: StageType;
  content: string;
  metadata: Record<string, unknown>;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  type: string;
  currentStage: StageType;
  status: string;
}

const stageIcons: Record<StageType, React.ReactNode> = {
  idea: <Lightbulb className="w-5 h-5" />,
  research: <Search className="w-5 h-5" />,
  outline: <List className="w-5 h-5" />,
  draft: <FileText className="w-5 h-5" />,
  improve: <Sparkles className="w-5 h-5" />,
  schedule: <Calendar className="w-5 h-5" />,
};

const stages: Stage[] = [
  { stage: 'idea', name: 'الفكرة', description: 'توليد الأفكار والإلهام', order: 1 },
  { stage: 'research', name: 'البحث', description: 'جمع المعلومات والمصادر', order: 2 },
  { stage: 'outline', name: 'المخطط', description: 'إنشاء هيكل المحتوى', order: 3 },
  { stage: 'draft', name: 'المسودة', description: 'كتابة المحتوى الأولي', order: 4 },
  { stage: 'improve', name: 'التحسين', description: 'مراجعة وتحسين المحتوى', order: 5 },
  { stage: 'schedule', name: 'الجدولة', description: 'جدولة النشر', order: 6 },
];

function WorkbenchPage() {
  const queryClient = useQueryClient();
  const [activeStage, setActiveStage] = useState<StageType>('idea');
  const [content, setContent] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch workflows
  const { data: workflowsData } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const res = await fetch('/api/workbench/workflows');
      const json = await res.json();
      return json.data as Workflow[];
    },
  });

  const workflows = workflowsData || [];

  // Auto-select first workflow
  useEffect(() => {
    if (workflows.length > 0 && !selectedWorkflow) {
      setSelectedWorkflow(workflows[0].id);
    }
  }, [workflows, selectedWorkflow]);

  // Fetch stage state
  const { data: stageState, isLoading: loadingState } = useQuery({
    queryKey: ['workflow-state', selectedWorkflow, activeStage],
    queryFn: async () => {
      if (!selectedWorkflow) return null;
      const res = await fetch(`/api/workbench/state/${selectedWorkflow}/${activeStage}`);
      const json = await res.json();
      return json.data as WorkflowState;
    },
    enabled: !!selectedWorkflow,
  });

  // Update content when state loads
  useEffect(() => {
    if (stageState) {
      setContent(stageState.content || '');
    } else {
      setContent('');
    }
  }, [stageState, activeStage]);

  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/workbench/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: '', type: 'content' }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      setSelectedWorkflow(data.data.id);
      setNewWorkflowName('');
      setShowNewWorkflow(false);
    },
  });

  // Save state mutation
  const saveState = useMutation({
    mutationFn: async ({ content, status }: { content: string; status: string }) => {
      const res = await fetch('/api/workbench/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: selectedWorkflow,
          stage: activeStage,
          content,
          status,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-state', selectedWorkflow, activeStage] });
      setIsSaving(false);
    },
  });

  const handleSave = (status = 'in_progress') => {
    if (!selectedWorkflow) return;
    setIsSaving(true);
    saveState.mutate({ content, status });
  };

  const handleComplete = () => {
    handleSave('completed');
    // Move to next stage
    const currentIndex = stages.findIndex(s => s.stage === activeStage);
    if (currentIndex < stages.length - 1) {
      setActiveStage(stages[currentIndex + 1].stage);
    }
  };

  const handleCreateWorkflow = () => {
    if (newWorkflowName.trim()) {
      createWorkflow.mutate(newWorkflowName);
    }
  };

  const currentStageIndex = stages.findIndex(s => s.stage === activeStage);
  const canGoBack = currentStageIndex > 0;
  const canGoForward = currentStageIndex < stages.length - 1;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ورشة العمل - Workbench</h1>
          <p className="text-gray-600">إنشاء المحتوى عبر مراحل منظمة</p>
        </div>
        
        {/* Workflow selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedWorkflow || ''}
            onChange={(e) => setSelectedWorkflow(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {workflows.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNewWorkflow(true)}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* New workflow modal */}
      {showNewWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4">إنشاء سير عمل جديد</h3>
            <input
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="اسم سير العمل..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleCreateWorkflow}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                إنشاء
              </button>
              <button
                onClick={() => setShowNewWorkflow(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {stages.map((stage, index) => {
            const isActive = activeStage === stage.stage;
            const isCompleted = stageState?.status === 'completed' && activeStage !== stage.stage;
            
            return (
              <button
                key={stage.stage}
                onClick={() => setActiveStage(stage.stage)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className={`${isActive ? 'text-green-500' : 'text-gray-400'}`}>
                  {stageIcons[stage.stage]}
                </span>
                <span className="font-medium">{stage.name}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Stage Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {stages.find(s => s.stage === activeStage)?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {stages.find(s => s.stage === activeStage)?.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs rounded-full ${
                stageState?.status === 'completed' 
                  ? 'bg-green-100 text-green-700'
                  : stageState?.status === 'in_progress'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {stageState?.status === 'completed' ? 'مكتمل' : 
                 stageState?.status === 'in_progress' ? 'قيد العمل' : 'لم يبدأ'}
              </span>
            </div>
          </div>

          {/* Content textarea */}
          <div className="mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder(activeStage)}
              className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loadingState}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => canGoBack && setActiveStage(stages[currentStageIndex - 1].stage)}
                disabled={!canGoBack}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  canGoBack
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
              <button
                onClick={() => canGoForward && setActiveStage(stages[currentStageIndex + 1].stage)}
                disabled={!canGoForward}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  canGoForward
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSave('in_progress')}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'جاري الحفظ...' : 'حفظ'}</span>
              </button>
              <button
                onClick={handleComplete}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>إكمال والتالي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Guide */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">دليل المرحلة</h3>
        <StageGuide stage={activeStage} />
      </div>
    </div>
  );
}

function getPlaceholder(stage: StageType): string {
  const placeholders: Record<StageType, string> = {
    idea: 'اكتب فكرتك هنا... ما الموضوع الذي تريد الكتابة عنه؟',
    research: 'اجمع المصادر والمعلومات... ما الذي اكتشفته؟',
    outline: 'أنشئ هيكل المحتوى... كيف سيكون ترتيب الأفكار؟',
    draft: 'اكتب المسودة الأولى... لا تهتم بالكمال، فقط اكتب',
    improve: 'راجع وحسّن المحتوى... ما الذي يمكن تحسينه؟',
    schedule: 'حدد موعد النشر والمنصة... متى وأين ستنشر؟',
  };
  return placeholders[stage];
}

function StageGuide({ stage }: { stage: StageType }) {
  const guides: Record<StageType, { tips: string[]; questions: string[] }> = {
    idea: {
      tips: [
        'ابدأ بعصف ذهني للأفكار',
        'حدد الجمهور المستهدف',
        'فكر في القيمة التي ستقدمها',
      ],
      questions: [
        'ما المشكلة التي يحلها هذا المحتوى؟',
        'من سيستفيد من هذا المحتوى؟',
        'ما الزاوية الفريدة التي ستتناولها؟',
      ],
    },
    research: {
      tips: [
        'اجمع مصادر موثوقة',
        'دوّن الاقتباسات المهمة',
        'حدد الفجوات في المعلومات',
      ],
      questions: [
        'ما المصادر التي ستستخدمها؟',
        'ما الإحصائيات المهمة؟',
        'ما رأي الخبراء في الموضوع؟',
      ],
    },
    outline: {
      tips: [
        'قسّم المحتوى إلى أقسام واضحة',
        'رتّب الأفكار بشكل منطقي',
        'حدد النقاط الرئيسية لكل قسم',
      ],
      questions: [
        'كيف ستبدأ المحتوى؟',
        'ما النقاط الرئيسية؟',
        'كيف ستنهي المحتوى؟',
      ],
    },
    draft: {
      tips: [
        'اكتب بحرية دون تحرير',
        'اتبع المخطط الذي أنشأته',
        'لا تتوقف للتصحيح',
      ],
      questions: [
        'هل غطيت جميع النقاط؟',
        'هل المحتوى متسلسل؟',
        'هل الأسلوب مناسب للجمهور؟',
      ],
    },
    improve: {
      tips: [
        'راجع الأخطاء الإملائية والنحوية',
        'تأكد من وضوح الأفكار',
        'حسّن العناوين والفقرات',
      ],
      questions: [
        'هل المحتوى واضح ومفهوم؟',
        'هل هناك تكرار يمكن حذفه؟',
        'هل الدعوة للعمل واضحة؟',
      ],
    },
    schedule: {
      tips: [
        'اختر الوقت المناسب للنشر',
        'حدد المنصة المناسبة',
        'جهّز الصور والوسائط',
      ],
      questions: [
        'ما أفضل وقت للنشر؟',
        'أي منصة ستستخدم؟',
        'ما الهاشتاغات المناسبة؟',
      ],
    },
  };

  const guide = guides[stage];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          نصائح
        </h4>
        <ul className="space-y-2">
          {guide.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-blue-500" />
          أسئلة للتفكير
        </h4>
        <ul className="space-y-2">
          {guide.questions.map((q, i) => (
            <li key={i} className="text-sm text-gray-600 before:content-['•'] before:text-blue-500 before:ml-2">
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WorkbenchPage;
