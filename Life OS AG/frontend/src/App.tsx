import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Heart,
  Wallet,
  Zap,
  Target,
  Users,
  MessageSquare,
  Plus,
  RefreshCw,
  Sun,
  Moon,
  Activity,
  User,
  Mail,
  Lock,
  LogOut,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, kernelAPI, habitsAPI, goalsAPI, aiAPI } from './api';
import { AICopilot } from './components/AICopilot';
import { HealthModule } from './components/HealthModule';
import { WealthModule } from './components/WealthModule';
import { GoalsModule } from './components/GoalsModule';
import { SocialModule } from './components/SocialModule';
import { HabitsModule } from './components/HabitsModule';
import { UnifiedLogModal } from './components/UnifiedLogModal';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lifeos_token'));
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Auth Flow State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('demo@lifeos.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');

  useEffect(() => {
    if (token) {
      fetchAppData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchAppData = async () => {
    try {
      setLoading(true);
      const [userRes, habitsRes, goalsRes, aiRes] = await Promise.all([
        authAPI.getMe(),
        habitsAPI.getHabits(),
        goalsAPI.getGoals(),
        aiAPI.getInsight()
      ]);
      setUser(userRes.data);
      setHabits(habitsRes.data);
      setGoals(goalsRes.data);
      setInsight(aiRes.data.insight);
    } catch (err) {
      console.error('Failed to fetch data', err);
      if ((err as any).response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      alert(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lifeos_token');
    setToken(null);
    setUser(null);
  };

  const syncScores = async () => {
    await kernelAPI.getStatus();
    const userRes = await authAPI.getMe();
    setUser(userRes.data);
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
        <p className="mt-12 text-center text-slate-500 text-sm max-w-[400px] leading-relaxed">
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
    { id: 'habits', name: 'Habits', icon: Zap, color: 'text-habits' },
    { id: 'goals', name: 'Goals', icon: Target, color: 'text-goals' },
    { id: 'relationships', name: 'Social', icon: Users, color: 'text-relationships' },
    { id: 'ai', name: 'AI Copilot', icon: MessageSquare, color: 'text-accent' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden text-main">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border/50 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="font-display font-bold text-white text-xl">L</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LifeOS
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setActiveTab(module.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === module.id
                  ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  : 'hover:bg-surface/50 text-muted hover:text-main'
                  }`}
              >
                <Icon size={20} className={activeTab === module.id ? module.color : 'group-hover:' + module.color} />
                <span className="font-medium">{module.name}</span>
                {activeTab === module.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface/50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-surface border border-border/50 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Authorized'}</p>
              <p className="text-xs text-muted truncate">{user?.email || 'V1.0.0'}</p>
            </div>
            <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted hover:text-relationships">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-border/50 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center bg-surface/50 rounded-2xl px-4 py-2.5 border border-border/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-[32rem] group">
            <Search size={18} className="text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search life events, goals, or AI help..."
              className="bg-transparent border-none focus:ring-0 ml-3 text-sm w-full outline-none text-main placeholder:text-muted/50"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-surface/50 border border-border/50 hover:bg-surface transition-all text-muted hover:text-primary shadow-sm active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={syncScores}
              className="p-2.5 rounded-xl bg-surface/50 border border-border/50 hover:bg-surface transition-all text-muted hover:text-primary shadow-sm active:scale-95"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
            >
              <Plus size={18} />
              <span>Log Event</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard user={user} habits={habits} goals={goals} insight={insight} fetchAppData={fetchAppData} setActiveTab={setActiveTab} />}
              {activeTab === 'health' && <HealthModule onUpdate={fetchAppData} />}
              {activeTab === 'wealth' && <WealthModule onUpdate={fetchAppData} />}
              {activeTab === 'habits' && <HabitsModule onUpdate={fetchAppData} />}
              {activeTab === 'goals' && <GoalsModule onUpdate={fetchAppData} />}
              {activeTab === 'relationships' && <SocialModule onUpdate={fetchAppData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* AI Floating Assistant */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-2xl z-50 group hover:shadow-accent/40 transition-all"
      >
        <MessageSquare className="text-white group-hover:rotate-12 transition-transform" />
      </motion.button>

      {/* AI Chat Modal */}
      <AICopilot isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />

      {/* Unified Log Modal */}
      <UnifiedLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={fetchAppData}
      />
    </div>
  );
}

function Dashboard({ user, habits, goals, insight, fetchAppData, setActiveTab }: any) {
  const completeHabit = async (id: string) => {
    try {
      await habitsAPI.completeHabit(id);
      fetchAppData();
    } catch (err) {
      console.error('Failed to complete habit', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 glass rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/20 transition-all"></div>
          <div className="relative z-10">
            <h3 className="text-muted font-medium flex items-center">
              Global Life Score
              <Zap size={16} className="ml-2 text-wealth" />
            </h3>
            <div className="mt-4 flex items-end space-x-4">
              <span className="text-7xl font-display font-bold text-main tracking-tighter">
                {user?.lifeScore || 0} <span className="text-2xl text-muted">/ 100</span>
              </span>
              <div className="mb-2 flex items-center text-health text-sm font-semibold bg-health/10 px-2 py-1 rounded-lg">
                +5.2% <Plus size={12} className="ml-1" />
              </div>
            </div>
            <p className="mt-4 text-muted max-w-xs leading-relaxed">
              System Health: <span className="text-health">Optimal</span>. Performance index is rising.
            </p>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-health/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-health/10 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12">
              <Heart className="text-health" />
            </div>
            <h3 className="text-muted font-medium">Health Score</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{user?.healthScore || 0}%</span>
            <div className="w-full h-1.5 bg-border/20 rounded-full mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user?.healthScore || 0}%` }}
                className="h-full bg-health shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-wealth/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-wealth/10 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12">
              <Wallet className="text-wealth" />
            </div>
            <h3 className="text-muted font-medium">Wealth Score</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{user?.wealthScore || 0}%</span>
            <div className="w-full h-1.5 bg-border/20 rounded-full mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${user?.wealthScore || 0}%` }}
                className="h-full bg-wealth shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Active Habits</h2>
              <button onClick={() => setActiveTab('habits')} className="text-primary text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit: any) => (
                <div
                  key={habit._id}
                  onClick={() => completeHabit(habit._id)}
                  className="glass p-5 rounded-2xl flex items-center space-x-4 card-hover cursor-pointer group"
                >
                  <div className={`bg-surface w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary/20 border border-border/50`}>
                    <Zap className="text-primary" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-main">{habit.name}</h4>
                    <p className="text-xs text-muted">{habit.streak} day streak</p>
                  </div>
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i <= (habit.streak % 5 || 5) ? 'bg-primary' : 'bg-border/20'}`}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-3xl p-8 h-80 flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <LayoutDashboard size={32} className="text-slate-600" />
              </div>
              <p className="text-slate-500 font-medium">Life Timeline initializing...</p>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="glass rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 italic tracking-tight uppercase text-muted text-xs">Mission Alignment</h2>
            <div className="space-y-6">
              {goals.length > 0 ? goals.map((goal: any) => (
                <div key={goal._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">{goal.title}</span>
                    <span className="font-semibold text-main">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )) : (
                <p className="text-muted text-sm italic">No active missions detected.</p>
              )}
            </div>
            <button onClick={() => setActiveTab('goals')} className="w-full mt-8 py-3 rounded-xl border border-border/50 hover:bg-surface transition-colors text-sm font-semibold text-main">
              Refine Life Purpose
            </button>
          </section>

          <section className="bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/20 rounded-3xl p-8 relative overflow-hidden group min-h-[160px]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/20 blur-2xl group-hover:bg-accent/40 transition-all rounded-full"></div>
            <h3 className="font-display font-bold text-lg mb-2 flex items-center">
              AI Insight
              <MessageSquare size={16} className="ml-2 text-accent" />
            </h3>
            <p className="text-main/80 text-sm italic leading-relaxed">
              "{insight || "Initializing system analysis..."}"
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
