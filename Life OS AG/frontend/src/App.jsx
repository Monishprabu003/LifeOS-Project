import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Heart,
  Wallet,
  Zap,
  Users,
  Plus,
  RefreshCw,
  Activity,
  User,
  Mail,
  Lock,
  LogOut,
  Settings,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, habitsAPI, goalsAPI, kernelAPI } from './api';
import { HealthModule } from './components/HealthModule';
import { WealthModule } from './components/WealthModule';
import { GoalsModule } from './components/GoalsModule';
import { SocialModule } from './components/SocialModule';
import { HabitsModule } from './components/HabitsModule';
import { UnifiedLogModal } from './components/UnifiedLogModal';
import { DashboardModule } from './components/DashboardModule';
import { ProfileModule } from './components/ProfileModule';
import { SettingsModule } from './components/SettingsModule';
import { NotificationPanel } from './components/NotificationPanel';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('lifeos_token'));
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('lifeos_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  // Auth Flow State
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('demo@lifeos.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('lifeos_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const fetchAppData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, habitsRes, goalsRes, eventsRes] = await Promise.all([
        authAPI.getMe(),
        habitsAPI.getHabits(),
        goalsAPI.getGoals(),
        kernelAPI.getEvents()
      ]);
      setUser(userRes.data);
      setHabits(habitsRes.data);
      setGoals(goalsRes.data);
      setNotifications(eventsRes.data.slice(0, 10)); // Top 10 recent events as notifications
      setTotalEvents(eventsRes.data.length);
    } catch (err) {
      console.error('Failed to fetch data', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchAppData();
    } else {
      setLoading(false);
    }
  }, [token, fetchAppData]);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'signin') {
        const res = await authAPI.login({ email, password });
        const newToken = res.data.token;
        localStorage.setItem('lifeos_token', newToken);
        setToken(newToken);
      } else {
        const res = await authAPI.register({ name, email, password });
        const newToken = res.data.token;
        localStorage.setItem('lifeos_token', newToken);
        setToken(newToken);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lifeos_token');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return (
      <div className={`h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0b14] text-white' : 'bg-[#f8fafc] text-[#1e293b]'}`}>
        {/* Dark Mode Toggle for Login Page */}
        <div className="absolute top-10 right-10">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-white/10 text-amber-400' : 'bg-slate-100 text-slate-600'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center shadow-lg shadow-green-200 dark:shadow-none">
            <Activity className="text-white" size={28} />
          </div>
          <span className={`text-3xl font-display font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>LifeOS</span>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-[440px] rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border transition-all ${isDarkMode ? 'bg-[#11121d] border-white/5' : 'bg-white border-slate-100'}`}
        >
          <div className="text-center mb-10">
            <h1 className={`text-3xl font-display font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-[#0f172a]'}`}>Welcome</h1>
            <p className="text-slate-500 text-sm">Sign in to your account or create a new one to get started</p>
          </div>

          {/* Tab Switcher */}
          <div className={`flex p-1.5 rounded-2xl mb-8 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100/80'}`}>
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${authMode === 'signin' ? (isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-[#0f172a] shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${authMode === 'signup' ? (isDarkMode ? 'bg-white/10 text-white shadow-sm' : 'bg-white text-[#0f172a] shadow-sm') : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className={`text-xs font-bold ml-1 ${isDarkMode ? 'text-slate-400' : 'text-[#1e293b]'}`}>Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className={`w-full border-none rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#10b981]/20 outline-none transition-all placeholder:text-slate-400 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-50'}`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-xs font-bold ml-1 ${isDarkMode ? 'text-slate-400' : 'text-[#1e293b]'}`}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`w-full border-none rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#10b981]/20 outline-none transition-all placeholder:text-slate-400 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-50'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold ml-1 ${isDarkMode ? 'text-slate-400' : 'text-[#1e293b]'}`}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`w-full border-none rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#10b981]/20 outline-none transition-all placeholder:text-slate-400 ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-50'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#0da271] text-white font-bold py-4 rounded-2xl shadow-lg transition-all hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.99] shadow-green-100 dark:shadow-none"
            >
              {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </motion.div>

        {/* Footer Text */}
        <p className="mt-12 text-center text-slate-500 text-sm max-w-[400px] lifestyle-relaxed">
          Your personal Life Operating System for tracking health, wealth, relationships, and more.
        </p>
      </div>
    )
  }

  if (loading && !user) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <RefreshCw className="text-primary animate-spin" size={40} />
      </div>
    )
  }

  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-primary' },
    { id: 'health', name: 'Health', icon: Heart, color: 'text-health' },
    { id: 'wealth', name: 'Wealth', icon: Wallet, color: 'text-wealth' },
    { id: 'relationships', name: 'Relationships', icon: Users, color: 'text-relationships' },
    { id: 'habits', name: 'Habits', icon: Zap, color: 'text-habits' },
    { id: 'goals', name: 'Purpose', icon: Compass, color: 'text-goals' }
  ];

  const accountItems = [
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-main transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 96 : 288 }}
        className="bg-white dark:bg-slate-900 border-r border-slate-50 dark:border-white/5 flex flex-col z-50 overflow-hidden transition-colors duration-300"
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 min-w-[40px] rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <span className="font-display font-bold text-white text-xl">L</span>
            </div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <h1 className="font-bold text-xl tracking-tight leading-none text-[#0f172a] dark:text-white">
                  LifeOS
                </h1>
                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none opacity-60">Life Management</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
          {/* Modules Section */}
          <div className="mb-8">
            {!isSidebarCollapsed && (
              <p className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Modules</p>
            )}
            <div className="space-y-1">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeTab === module.id;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveTab(module.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all duration-200 relative group truncate ${isActive
                      ? 'bg-[#dcfce7] text-[#059669]'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#059669] rounded-r-full" />
                    )}
                    <Icon size={20} className={`${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    {!isSidebarCollapsed && (
                      <span className="font-bold text-[13px] tracking-tight">{module.name}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Account Section */}
          <div>
            {!isSidebarCollapsed && (
              <p className="px-4 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Account</p>
            )}
            <div className="space-y-1">
              {accountItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-3.5 rounded-xl transition-all duration-200 group truncate ${isActive
                      ? 'bg-[#dcfce7] text-[#059669]'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                  >
                    <Icon size={20} className={`${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    {!isSidebarCollapsed && (
                      <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-6 mt-auto px-6 border-t border-slate-50 dark:border-white/5">
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-4'}`}>
            <div className="w-10 h-10 min-w-[40px] rounded-full bg-[#14b8a6] flex items-center justify-center text-white font-black text-sm shadow-md">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NI'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-[13px] font-bold text-[#0f172a] dark:text-white truncate leading-none mb-1">{user?.name || 'nitin'}</p>
                <p className="text-[11px] font-medium text-slate-400 truncate opacity-70 leading-none">{user?.email || 'monishprabu39200...'}</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 transition-all"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-[#fcfdfe] dark:bg-slate-950">

        {/* Header */}
        <header className="z-40 px-10 py-8 flex items-center justify-between mx-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1 opacity-80">Welcome back,</p>
            <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight">{user?.name || 'John Doe'}</h2>
          </div>

          <div className="flex items-center space-x-6 relative z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2.5 text-slate-400 hover:text-slate-600 transition-colors bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-white/10 shadow-sm"
            >
              <Bell size={22} className="stroke-[2.5px]" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full" />
              )}
            </motion.button>
          </div>
        </header>


        {/* Dashboard Content */}
        <div className="p-10 max-w-[1600px] mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardModule user={user} habits={habits} goals={goals} onUpdate={fetchAppData} setActiveTab={setActiveTab} isDarkMode={isDarkMode} />}
              {activeTab === 'health' && <HealthModule onUpdate={fetchAppData} user={user} isDarkMode={isDarkMode} />}
              {activeTab === 'wealth' && <WealthModule onUpdate={fetchAppData} user={user} isDarkMode={isDarkMode} />}
              {activeTab === 'habits' && <HabitsModule onUpdate={fetchAppData} user={user} isDarkMode={isDarkMode} />}
              {activeTab === 'goals' && <GoalsModule onUpdate={fetchAppData} user={user} isDarkMode={isDarkMode} />}
              {activeTab === 'relationships' && <SocialModule onUpdate={fetchAppData} user={user} isDarkMode={isDarkMode} />}
              {activeTab === 'profile' && <ProfileModule user={user} totalEvents={totalEvents} habits={habits} goals={goals} onUpdate={fetchAppData} isDarkMode={isDarkMode} />}
              {activeTab === 'settings' && <SettingsModule isDarkMode={isDarkMode} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Unified Log Modal */}
      <UnifiedLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={fetchAppData}
        isDarkMode={isDarkMode}
      />

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;
