import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Brain, Wrench, MessageSquare, Home } from 'lucide-react';
import BrainPage from './pages/Brain';
import WorkbenchPage from './pages/Workbench';
import ChatPage from './pages/Chat';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/brain', icon: Brain, label: 'Brain' },
    { path: '/workbench', icon: Wrench, label: 'Workbench' },
    { path: '/chat', icon: MessageSquare, label: 'محادثة' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">رقيم AI</span>
        </div>
        
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          مرحباً بك في رقيم AI
        </h1>
        <p className="text-xl text-gray-600">
          مساعدك الذكي الشخصي لإدارة الأفكار والمشاريع والمحتوى
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="/brain"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 card-hover"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Brain className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Brain</h3>
          <p className="text-gray-600 text-sm">
            نظام التفكير الشخصي - إدارة المشاريع والجلسات والقرارات
          </p>
        </Link>

        <Link
          to="/workbench"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 card-hover"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Wrench className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Workbench</h3>
          <p className="text-gray-600 text-sm">
            ورشة العمل - إنشاء المحتوى عبر 6 مراحل منظمة
          </p>
        </Link>

        <Link
          to="/chat"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 card-hover"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <MessageSquare className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">محادثة</h3>
          <p className="text-gray-600 text-sm">
            تحدث مع المساعد الذكي واحصل على تقييم جودة الردود
          </p>
        </Link>
      </div>

      <div className="mt-12 bg-gradient-to-l from-blue-500 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4">ابدأ الآن</h2>
        <p className="mb-6 opacity-90">
          استخدم رقيم AI لتنظيم أفكارك، إدارة مشاريعك، وإنشاء محتوى عالي الجودة
        </p>
        <div className="flex gap-4">
          <Link
            to="/brain"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            افتح Brain
          </Link>
          <Link
            to="/chat"
            className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors"
          >
            ابدأ محادثة
          </Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/brain" element={<BrainPage />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
