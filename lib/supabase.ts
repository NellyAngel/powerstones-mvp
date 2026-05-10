import { createClient } from '@supabase/supabase-js';

// ⚠️ Замените на свои значения из Supabase Dashboard → Settings → API
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для таблиц БД
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

// Типы для Supabase запросов
export type Tables = {
  profiles: Profile;
  daily_assessments: DailyAssessment;
  tasks: Task;
  achievements: Achievement;
  team: Team;
};
