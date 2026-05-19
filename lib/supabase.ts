import { createClient } from '@supabase/supabase-js';

// ============================================================
// PowerStones — клиент Supabase
//
// В режиме разработки использует локальный прокси,
// который решает проблему CORS (веб-версия на localhost)
//
// Прокси: http://localhost:3001
// Supabase: https://gjirslmhrlaqlsgbxsjo.supabase.co
// ============================================================

// Оригинальный URL Supabase (используется в продакшене / на устройстве)
const ORIGINAL_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gjirslmhrlaqlsgbxsjo.supabase.co';

// Анонимный ключ Supabase
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqaXJzbG1ocmxhcWxzZ2J4c2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzY3NTgsImV4cCI6MjA2Mjk1Mjc1OH0.drL5k1k4TLd9C-V0NK3l3SvVdkFnGEKm44DD9lQYhAc';

// Определяем, используем ли прокси (веб-версия на localhost)
const isWebDev = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// URL для клиента Supabase:
// - В веб-разработке → локальный прокси (обходит CORS)
// - На устройстве / в продакшене → напрямую в Supabase
const supabaseUrl = isWebDev
  ? `http://localhost:${process.env.EXPO_PUBLIC_PROXY_PORT || '3001'}`
  : ORIGINAL_SUPABASE_URL;

console.log(`🔮 Supabase client: ${isWebDev ? '🔄 через прокси' : '➡️ напрямую'} (${supabaseUrl})`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
