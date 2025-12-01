import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FolderKanban, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Plus,
  ChevronLeft,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Session {
  id: string;
  projectId: string | null;
  title: string;
  summary: string;
  messageCount: number;
  createdAt: string;
}

interface Decision {
  id: string;
  projectId: string | null;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

interface Stats {
  projectsCount: number;
  sessionsCount: number;
  decisionsCount: number;
  activeProjects: number;
  pendingDecisions: number;
  implementedDecisions: number;
}

function BrainPage() {
  const queryClient = useQueryClient();
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  // Fetch data
  const { data: statsData } = useQuery({
    queryKey: ['brain-stats'],
    queryFn: async () => {
      const res = await fetch('/api/brain/stats');
      const json = await res.json();
      return json.data as Stats;
    },
  });

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/brain/projects');
      const json = await res.json();
      return json.data as Project[];
    },
  });

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('/api/brain/sessions');
      const json = await res.json();
      return json.data as Session[];
    },
  });

  const { data: decisionsData } = useQuery({
    queryKey: ['decisions'],
    queryFn: async () => {
      const res = await fetch('/api/brain/decisions');
      const json = await res.json();
      return json.data as Decision[];
    },
  });

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/brain/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: '' }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['brain-stats'] });
      setNewProjectName('');
      setShowNewProject(false);
    },
  });

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject.mutate(newProjectName);
    }
  };

  const stats = statsData || {
    projectsCount: 0,
    sessionsCount: 0,
    decisionsCount: 0,
    activeProjects: 0,
    pendingDecisions: 0,
    implementedDecisions: 0,
  };

  const projects = projectsData || [];
  const sessions = sessionsData || [];
  const decisions = decisionsData || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم - Brain</h1>
        <p className="text-gray-600">نظام التفكير الشخصي لإدارة مشاريعك وقراراتك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FolderKanban className="w-6 h-6" />}
          label="المشاريع"
          value={stats.projectsCount}
          sublabel={`${stats.activeProjects} نشط`}
          color="blue"
        />
        <StatCard
          icon={<MessageCircle className="w-6 h-6" />}
          label="الجلسات"
          value={stats.sessionsCount}
          sublabel="محادثات"
          color="green"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          label="القرارات"
          value={stats.decisionsCount}
          sublabel={`${stats.implementedDecisions} منفذ`}
          color="purple"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="قيد الانتظار"
          value={stats.pendingDecisions}
          sublabel="قرار"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">المشاريع</h2>
            <button
              onClick={() => setShowNewProject(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {showNewProject && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg animate-fadeIn">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="اسم المشروع..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  إنشاء
                </button>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loadingProjects ? (
              <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد مشاريع بعد
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{project.name}</h3>
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.description || 'بدون وصف'}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status === 'active' ? 'نشط' : 'متوقف'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sessions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">الجلسات</h2>
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد جلسات بعد
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-green-200 hover:bg-green-50/30 transition-colors cursor-pointer"
                >
                  <h3 className="font-medium text-gray-800">{session.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {session.summary || 'بدون ملخص'}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <MessageCircle className="w-3 h-3" />
                    <span>{session.messageCount} رسالة</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Decisions */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">القرارات</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {decisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                لا توجد قرارات بعد
              </div>
            ) : (
              decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="p-4 border border-gray-100 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-colors cursor-pointer"
                >
                  <h3 className="font-medium text-gray-800">{decision.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {decision.description}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${
                    decision.status === 'implemented' 
                      ? 'bg-green-100 text-green-700'
                      : decision.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {decision.status === 'implemented' ? 'منفذ' : 
                     decision.status === 'pending' ? 'قيد الانتظار' : 'مرفوض'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ icon, label, value, sublabel, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}

export default BrainPage;
