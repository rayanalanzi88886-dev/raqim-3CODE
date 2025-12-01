import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage
interface Workflow {
  id: string;
  projectId: string | null;
  name: string;
  description: string;
  type: 'content' | 'research' | 'project';
  currentStage: StageType;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

type StageType = 'idea' | 'research' | 'outline' | 'draft' | 'improve' | 'schedule';

interface WorkflowState {
  id: string;
  workflowId: string;
  stage: StageType;
  content: string;
  metadata: {
    notes?: string;
    sources?: string[];
    keywords?: string[];
    targetAudience?: string;
    tone?: string;
    wordCount?: number;
    scheduledDate?: string;
    platform?: string;
  };
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// Stage definitions in Arabic
const stageDefinitions = [
  { stage: 'idea' as StageType, name: 'الفكرة', description: 'توليد الأفكار والإلهام', order: 1 },
  { stage: 'research' as StageType, name: 'البحث', description: 'جمع المعلومات والمصادر', order: 2 },
  { stage: 'outline' as StageType, name: 'المخطط', description: 'إنشاء هيكل المحتوى', order: 3 },
  { stage: 'draft' as StageType, name: 'المسودة', description: 'كتابة المحتوى الأولي', order: 4 },
  { stage: 'improve' as StageType, name: 'التحسين', description: 'مراجعة وتحسين المحتوى', order: 5 },
  { stage: 'schedule' as StageType, name: 'الجدولة', description: 'جدولة النشر', order: 6 },
];

// Sample workflow
const workflows: Workflow[] = [
  {
    id: uuidv4(),
    projectId: null,
    name: 'مقال عن الذكاء الاصطناعي',
    description: 'إنشاء مقال شامل عن تطور الذكاء الاصطناعي',
    type: 'content',
    currentStage: 'research',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample states
const workflowStates: WorkflowState[] = [
  {
    id: uuidv4(),
    workflowId: workflows[0].id,
    stage: 'idea',
    content: 'فكرة: كتابة مقال عن تأثير الذكاء الاصطناعي على المجتمع العربي',
    metadata: {
      keywords: ['ذكاء اصطناعي', 'تكنولوجيا', 'مجتمع'],
      targetAudience: 'المهتمين بالتكنولوجيا',
    },
    status: 'completed',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    workflowId: workflows[0].id,
    stage: 'research',
    content: 'جمع مصادر عن تطور AI في 2024...',
    metadata: {
      sources: ['OpenAI Blog', 'MIT Technology Review'],
      notes: 'التركيز على التطبيقات العملية',
    },
    status: 'in_progress',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/workbench/workflows
router.get('/workflows', (_req: Request, res: Response) => {
  res.json({ success: true, data: workflows });
});

// GET /api/workbench/workflows/:id
router.get('/workflows/:id', (req: Request, res: Response) => {
  const workflow = workflows.find(w => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }
  
  const states = workflowStates.filter(s => s.workflowId === workflow.id);
  res.json({ success: true, data: { workflow, states } });
});

// POST /api/workbench/workflows
router.post('/workflows', (req: Request, res: Response) => {
  const { projectId, name, description, type } = req.body;
  
  const newWorkflow: Workflow = {
    id: uuidv4(),
    projectId: projectId || null,
    name,
    description: description || '',
    type: type || 'content',
    currentStage: 'idea',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  workflows.push(newWorkflow);
  
  // Initialize states for each stage
  stageDefinitions.forEach(stageDef => {
    workflowStates.push({
      id: uuidv4(),
      workflowId: newWorkflow.id,
      stage: stageDef.stage,
      content: '',
      metadata: {},
      status: 'not_started',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
  
  res.json({ success: true, data: newWorkflow });
});

// POST /api/workbench/state
router.post('/state', (req: Request, res: Response) => {
  const { workflowId, stage, content, metadata, status } = req.body;
  
  const stateIndex = workflowStates.findIndex(
    s => s.workflowId === workflowId && s.stage === stage
  );
  
  if (stateIndex === -1) {
    // Create new state
    const newState: WorkflowState = {
      id: uuidv4(),
      workflowId,
      stage,
      content: content || '',
      metadata: metadata || {},
      status: status || 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    workflowStates.push(newState);
    return res.json({ success: true, data: newState });
  }
  
  // Update existing state
  workflowStates[stateIndex] = {
    ...workflowStates[stateIndex],
    content: content !== undefined ? content : workflowStates[stateIndex].content,
    metadata: metadata !== undefined ? { ...workflowStates[stateIndex].metadata, ...metadata } : workflowStates[stateIndex].metadata,
    status: status || workflowStates[stateIndex].status,
    updatedAt: new Date(),
  };
  
  // Update workflow's current stage
  const workflow = workflows.find(w => w.id === workflowId);
  if (workflow) {
    workflow.currentStage = stage;
    workflow.updatedAt = new Date();
  }
  
  res.json({ success: true, data: workflowStates[stateIndex] });
});

// GET /api/workbench/stages
router.get('/stages', (_req: Request, res: Response) => {
  res.json({ success: true, data: stageDefinitions });
});

// GET /api/workbench/state/:workflowId/:stage
router.get('/state/:workflowId/:stage', (req: Request, res: Response) => {
  const { workflowId, stage } = req.params;
  const state = workflowStates.find(
    s => s.workflowId === workflowId && s.stage === stage
  );
  
  if (!state) {
    return res.json({ 
      success: true, 
      data: {
        workflowId,
        stage,
        content: '',
        metadata: {},
        status: 'not_started',
      } 
    });
  }
  
  res.json({ success: true, data: state });
});

export default router;
