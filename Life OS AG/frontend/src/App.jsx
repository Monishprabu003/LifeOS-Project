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
  Sun,
  Moon,
  Bell
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (t) => {
      root.classList.remove('light', 'dark');
      root.classList.add(t);
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  // Auth Flow State
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('demo@lifeos.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-[#1e293b]">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-[#10b981] flex items-center justify-center shadow-lg shadow-green-200">
            <Activity className="text-white" size={28} />
          </div>
          <span className="text-3xl font-display font-bold tracking-tight text-[#0f172a]">LifeOS</span>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] bg-white rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-[#0f172a] mb-3">Welcome</h1>
            <p className="text-slate-500 text-sm">Sign in to your account or create a new one to get started</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-8">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${authMode === 'signin' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${authMode === 'signup' ? 'bg-white text-[#0f172a] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1e293b] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#10b981]/20 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1e293b] ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#10b981]/20 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1e293b] ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 pl-12 text-sm focus:ring-2 focus:ring-[#10b981]/20 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#0da271] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.99]"
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
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#0f111a] overflow-hidden text-main transition-colors duration-300">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 96 : 288 }}
        className="glass border-r border-slate-100 dark:border-[#222436] flex flex-col shadow-sm z-50 overflow-hidden transition-colors duration-300"
      >
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 min-w-[40px] rounded-xl bg-[#3b82f6] flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none">
              <span className="font-display font-bold text-white text-xl">L</span>
            </div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <h1 className="font-display text-xl font-bold tracking-tight text-[#0f172a] dark:text-white leading-none">
                  LifeOS
                </h1>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Life Management</p>
              </motion.div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
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
                  <motion.button
                    key={module.id}
                    whileHover={{ x: isSidebarCollapsed ? 0 : 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(module.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative group ${isActive
                      ? 'nav-active shadow-lg shadow-indigo-100 dark:shadow-none'
                      : 'nav-hover text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                      }`}
                  >
                    <Icon size={22} className={`${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'} relative z-10`} />
                    {!isSidebarCollapsed && (
                      <span className="font-bold text-sm tracking-tight relative z-10">{module.name}</span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-white dark:bg-[#1a1c2e] rounded-[1.5rem] -z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
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
                  <motion.button
                    key={item.id}
                    whileHover={{ x: isSidebarCollapsed ? 0 : 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative group ${isActive
                      ? 'nav-active shadow-lg shadow-indigo-100 dark:shadow-none'
                      : 'nav-hover text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
                      }`}
                  >
                    <Icon size={22} className={`${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform duration-300'} relative z-10`} />
                    {!isSidebarCollapsed && (
                      <span className="font-bold text-sm tracking-tight relative z-10">{item.name}</span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeAccountNav"
                        className="absolute inset-0 bg-white dark:bg-[#1a1c2e] rounded-[1.5rem] -z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={`p-6 mt-auto border-t border-slate-100 dark:border-slate-800 transition-all ${isSidebarCollapsed ? 'px-4' : 'px-6'}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-4'}`}>
            <div className={`w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center text-white font-bold shadow-md shadow-green-100 dark:shadow-none transition-all ${isSidebarCollapsed ? 'scale-110' : ''}`}>
              {user?.name?.charAt(0) || 'M'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden transition-all duration-300">
                <p className="text-sm font-bold text-[#0f172a] dark:text-white truncate">{user?.name || 'Monish Prabu'}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{user?.email || 'moni@lifeos.com'}</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar">
        {/* Background Decorative Elements - Visible in Light Mode */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.35] dark:opacity-20 z-0 bg-[#f8fafc] dark:bg-transparent">
          <div className="blob w-[45rem] h-[45rem] bg-indigo-200/50 -top-20 -right-20 animate-blob" />
          <div className="blob w-[40rem] h-[40rem] bg-sky-200/50 -bottom-20 -left-20 animate-blob animation-delay-2000" />
          <div className="blob w-[35rem] h-[35rem] bg-rose-100/50 top-[20%] left-[15%] animate-blob animation-delay-4000" />
          <div className="blob w-[30rem] h-[30rem] bg-emerald-100/50 bottom-[20%] right-[10%] animate-blob animation-delay-2000" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 glass px-10 py-6 flex items-center justify-between transition-colors duration-300 rounded-b-3xl mx-4 mt-2">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Welcome back,</p>
            <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">{user?.name || 'John Doe'}</h2>
          </div>

          <div className="flex items-center space-x-6 relative z-10">
            <div className="flex items-center bg-white dark:bg-[#1a1c2e]/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-[#222436]/50 shadow-sm backdrop-blur-sm">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' }
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-2.5 rounded-xl transition-all duration-300 group relative ${theme === t.id
                      ? 'bg-slate-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    title={t.label}
                  >
                    <Icon size={18} className={theme === t.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                    {theme === t.id && (
                      <motion.div
                        layoutId="activeTheme"
                        className="absolute inset-0 bg-slate-50 dark:bg-slate-700 rounded-xl -z-10 shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </button>
                )
              })
              }
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="interactive-hover flex items-center space-x-2 bg-[#10b981] hover:bg-[#0da271] text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-100 dark:shadow-none"
              >
                <Plus size={18} />
                <span>Log Event</span>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />

            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <Bell size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0f111a] rounded-full" />
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
              {activeTab === 'dashboard' && <DashboardModule user={user} habits={habits} goals={goals} onUpdate={fetchAppData} setActiveTab={setActiveTab} />}
              {activeTab === 'health' && <HealthModule onUpdate={fetchAppData} user={user} />}
              {activeTab === 'wealth' && <WealthModule onUpdate={fetchAppData} user={user} />}
              {activeTab === 'habits' && <HabitsModule onUpdate={fetchAppData} user={user} />}
              {activeTab === 'goals' && <GoalsModule onUpdate={fetchAppData} user={user} />}
              {activeTab === 'relationships' && <SocialModule onUpdate={fetchAppData} user={user} />}
              {activeTab === 'profile' && <ProfileModule user={user} totalEvents={totalEvents} habits={habits} goals={goals} onUpdate={fetchAppData} />}
              {activeTab === 'settings' && <SettingsModule />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Unified Log Modal */}
      <UnifiedLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={fetchAppData}
      />

      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />
    </div >
  );
}



export default App;
