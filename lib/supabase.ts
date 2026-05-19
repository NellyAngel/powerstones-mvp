import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Определяем, используем ли прокси (веб-версия на localhost)
const isWebDev = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// URL для клиента Supabase:
// - В веб-разработке → локальный прокси (обходит CORS)
// - На устройстве / в продакшене → напрямую в Supabase
const apiUrl = isWebDev
  ? `http://localhost:${process.env.EXPO_PUBLIC_PROXY_PORT || '3001'}`
  : supabaseUrl;

console.log(`🔮 Supabase client: ${isWebDev ? '🔄 через прокси' : '➡️ напрямую'} (${apiUrl})`);

export const supabase = createClient(apiUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: 'boss' | 'employee';
  level: number;
  xp: number;
  created_at: string;
};

export type DailyAssessment = {
  id: string;
  user_id: string;
  date: string;
  excitability_ms: number;
  lability_ms: number;
  stability_ms: number;
  energy_pct: number;
  flexibility_pct: number;
  stability_pct: number;
  integral_pct: number;
  stones_awarded: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  created_by: string;
  complexity: 'low' | 'medium' | 'high';
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  stone_cost: number;
  status: 'planned' | 'in_progress' | 'done';
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: string;
  unlocked_at: string;
};

export type Team = {
  id: string;
  boss_id: string;
  member_id: string;
};

export type Tables = {
  profiles: Profile;
  daily_assessments: DailyAssessment;
  tasks: Task;
  achievements: Achievement;
  team: Team;
};
