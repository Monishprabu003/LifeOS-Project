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
    Search,
    Settings,
    Bell,
    Compass,
    ArrowRight
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
import { DashboardModule } from './components/DashboardModule';
