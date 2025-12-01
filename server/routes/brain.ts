import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage (replace with database in production)
interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  projectId: string | null;
  title: string;
  summary: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Decision {
  id: string;
  projectId: string | null;
  sessionId: string | null;
  title: string;
  description: string;
  reasoning: string;
  outcome: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sample data
const projects: Project[] = [
  {
    id: uuidv4(),
    name: 'مشروع التطبيق الذكي',
    description: 'تطوير تطبيق ذكي للمساعدة الشخصية',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'محتوى وسائل التواصل',
    description: 'إنشاء محتوى لمنصات التواصل الاجتماعي',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sessions: Session[] = [
  {
    id: uuidv4(),
    projectId: projects[0].id,
    title: 'جلسة التخطيط الأولى',
    summary: 'مناقشة متطلبات المشروع الأساسية',
    messageCount: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    projectId: projects[0].id,
    title: 'جلسة تصميم الواجهات',
    summary: 'تصميم واجهات المستخدم',
    messageCount: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const decisions: Decision[] = [
  {
    id: uuidv4(),
    projectId: projects[0].id,
    sessionId: sessions[0].id,
    title: 'اختيار React للواجهة الأمامية',
    description: 'تم اختيار React كإطار عمل للواجهة الأمامية',
    reasoning: 'سهولة التطوير ودعم المجتمع الكبير',
    outcome: 'تم التنفيذ بنجاح',
    status: 'implemented',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: uuidv4(),
    projectId: projects[0].id,
    sessionId: null,
    title: 'استخدام PostgreSQL لقاعدة البيانات',
    description: 'اعتماد PostgreSQL كقاعدة بيانات رئيسية',
    reasoning: 'أداء عالي ودعم JSON',
    outcome: '',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/brain/projects
router.get('/projects', (_req: Request, res: Response) => {
  res.json({ success: true, data: projects });
});

// POST /api/brain/projects
router.post('/projects', (req: Request, res: Response) => {
  const { name, description } = req.body;
  
  const newProject: Project = {
    id: uuidv4(),
    name,
    description: description || '',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  projects.push(newProject);
  res.json({ success: true, data: newProject });
});

// GET /api/brain/sessions
router.get('/sessions', (_req: Request, res: Response) => {
  res.json({ success: true, data: sessions });
});

// POST /api/brain/sessions
router.post('/sessions', (req: Request, res: Response) => {
  const { projectId, title, summary } = req.body;
  
  const newSession: Session = {
    id: uuidv4(),
    projectId: projectId || null,
    title,
    summary: summary || '',
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  sessions.push(newSession);
  res.json({ success: true, data: newSession });
});

// GET /api/brain/decisions
router.get('/decisions', (_req: Request, res: Response) => {
  res.json({ success: true, data: decisions });
});

// POST /api/brain/decisions
router.post('/decisions', (req: Request, res: Response) => {
  const { projectId, sessionId, title, description, reasoning, outcome, status } = req.body;
  
  const newDecision: Decision = {
    id: uuidv4(),
    projectId: projectId || null,
    sessionId: sessionId || null,
    title,
    description: description || '',
    reasoning: reasoning || '',
    outcome: outcome || '',
    status: status || 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  decisions.push(newDecision);
  res.json({ success: true, data: newDecision });
});

// GET /api/brain/stats
router.get('/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      projectsCount: projects.length,
      sessionsCount: sessions.length,
      decisionsCount: decisions.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      pendingDecisions: decisions.filter(d => d.status === 'pending').length,
      implementedDecisions: decisions.filter(d => d.status === 'implemented').length,
    },
  });
});

export default router;
