import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Heart,
  Wallet,
  Zap,
  Target,
  Users,
  MessageSquare,
  Search,
  Plus,
  ArrowRight,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, kernelAPI, habitsAPI, goalsAPI, aiAPI } from './api';
import { AICopilot } from './components/AICopilot';
import { HealthModule } from './components/HealthModule';
import { WealthModule } from './components/WealthModule';
import { GoalsModule } from './components/GoalsModule';
import { SocialModule } from './components/SocialModule';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [habits, setHabits] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('lifeos_token'));

  // Auth Flow State
  const [email, setEmail] = useState('demo@lifeos.com');
  const [password, setPassword] = useState('password123');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authAPI.login({ email, password });
      const newToken = res.data.token;
      localStorage.setItem('lifeos_token', newToken);
      setToken(newToken);
    } catch (err) {
      alert('Login failed. Did you run "npm run seed" in the backend?');
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
      <div className="h-screen w-full bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass p-10 rounded-[2.5rem] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-2xl">
              <span className="font-display font-bold text-white text-3xl">L</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Initialize LifeOS</h1>
            <p className="text-slate-400 text-center mb-8">System standby. Authentication required.</p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="email"
                placeholder="Terminal Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-600"
              />
              <input
                type="password"
                placeholder="Access Key"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-600"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-[0.98]"
              >
                <span>Authorize Access</span>
                <ArrowRight size={20} />
              </button>
            </form>
            <p className="mt-8 text-xs text-slate-600 uppercase tracking-widest font-bold">Encrypted Connection Secure</p>
          </div>
        </motion.div>
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
    <div className="flex h-screen bg-background overflow-hidden text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="font-display font-bold text-white text-xl">L</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
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
                  : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
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

        <div className="p-4 mt-auto border-t border-slate-800/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors group">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Felix'}`} alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || 'Authorized'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'V1.0.0'}</p>
            </div>
            <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-500 hover:text-relationships">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 glass border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center bg-slate-900/80 rounded-2xl px-4 py-2.5 border border-slate-700/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all w-[32rem] group">
            <Search size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search life events, goals, or AI help..."
              className="bg-transparent border-none focus:ring-0 ml-3 text-sm w-full outline-none text-slate-200 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={syncScores}
              className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-primary"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
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
              {activeTab === 'dashboard' && <Dashboard user={user} habits={habits} goals={goals} insight={insight} fetchAppData={fetchAppData} />}
              {activeTab === 'health' && <HealthModule />}
              {activeTab === 'wealth' && <WealthModule />}
              {activeTab === 'goals' && <GoalsModule />}
              {activeTab === 'relationships' && <SocialModule />}
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
    </div>
  );
}

function Dashboard({ user, habits, goals, insight, fetchAppData }: any) {
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
            <h3 className="text-slate-400 font-medium flex items-center">
              Global Life Score
              <Zap size={16} className="ml-2 text-wealth" />
            </h3>
            <div className="mt-4 flex items-end space-x-4">
              <span className="text-7xl font-display font-bold text-white tracking-tighter">
                {user?.lifeScore || 0} <span className="text-2xl text-slate-500">/ 100</span>
              </span>
              <div className="mb-2 flex items-center text-health text-sm font-semibold bg-health/10 px-2 py-1 rounded-lg">
                +5.2% <Plus size={12} className="ml-1" />
              </div>
            </div>
            <p className="mt-4 text-slate-400 max-w-xs leading-relaxed">
              System Health: <span className="text-health">Optimal</span>. Performance index is rising.
            </p>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:border-health/50 transition-colors">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-health/10 flex items-center justify-center mb-4 transition-transform group-hover:rotate-12">
              <Heart className="text-health" />
            </div>
            <h3 className="text-slate-400 font-medium">Health Score</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{user?.healthScore || 0}%</span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
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
            <h3 className="text-slate-400 font-medium">Wealth Score</h3>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold">{user?.wealthScore || 0}%</span>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
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
              <button className="text-primary text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map((habit: any) => (
                <div
                  key={habit._id}
                  onClick={() => completeHabit(habit._id)}
                  className="glass p-5 rounded-2xl flex items-center space-x-4 card-hover cursor-pointer group"
                >
                  <div className={`bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary/20`}>
                    <Zap className="text-primary" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{habit.name}</h4>
                    <p className="text-xs text-slate-500">{habit.streak} day streak</p>
                  </div>
                  <div className="flex -space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-2 h-2 rounded-full ${i <= (habit.streak % 5 || 5) ? 'bg-primary' : 'bg-slate-800'}`}></div>
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
            <h2 className="text-xl font-bold mb-6 italic tracking-tight uppercase text-slate-500 text-xs">Mission Alignment</h2>
            <div className="space-y-6">
              {goals.length > 0 ? goals.map((goal: any) => (
                <div key={goal._id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{goal.title}</span>
                    <span className="font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-sm italic">No active missions detected.</p>
              )}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors text-sm font-semibold">
              Refine Life Purpose
            </button>
          </section>

          <section className="bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/20 rounded-3xl p-8 relative overflow-hidden group min-h-[160px]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/20 blur-2xl group-hover:bg-accent/40 transition-all rounded-full"></div>
            <h3 className="font-display font-bold text-lg mb-2 flex items-center">
              AI Insight
              <MessageSquare size={16} className="ml-2 text-accent" />
            </h3>
            <p className="text-slate-300 text-sm italic leading-relaxed">
              "{insight || "Initializing system analysis..."}"
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;
