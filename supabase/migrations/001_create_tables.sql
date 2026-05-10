-- Миграция для создания всех таблиц "Камни Силы"
-- Запустить в Supabase SQL Editor

-- 1. Таблица профилей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('boss', 'employee')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ежедневные оценки
CREATE TABLE IF NOT EXISTS daily_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  excitability_ms NUMERIC NOT NULL,
  lability_ms NUMERIC NOT NULL,
  stability_ms NUMERIC NOT NULL,
  energy_pct NUMERIC NOT NULL,
  flexibility_pct NUMERIC NOT NULL,
  stability_pct NUMERIC NOT NULL,
  integral_pct NUMERIC NOT NULL,
  stones_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. Задачи
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  complexity TEXT NOT NULL CHECK (complexity IN ('low', 'medium', 'high')),
  deadline DATE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  stone_cost INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Достижения
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Связь начальник-сотрудник
CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(boss_id, member_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_daily_assessments_user ON daily_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_assessments_date ON daily_assessments(date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_team_boss ON team(boss_id);
CREATE INDEX IF NOT EXISTS idx_team_member ON team(member_id);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Boss can view team profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team
      WHERE boss_id = auth.uid() AND member_id = profiles.id
    )
  );

-- Политики для daily_assessments
CREATE POLICY "Users can view own assessments"
  ON daily_assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON daily_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Boss can view team assessments"
  ON daily_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team
      WHERE boss_id = auth.uid() AND member_id = daily_assessments.user_id
    )
  );

-- Политики для tasks
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = assigned_to OR auth.uid() = created_by);

CREATE POLICY "Boss can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'boss'
    )
  );

CREATE POLICY "Users can update their assigned tasks status"
  ON tasks FOR UPDATE
  USING (auth.uid() = assigned_to)
  WITH CHECK (
    -- Can only change status, not other fields
    OLD.assigned_to = NEW.assigned_to
    AND OLD.title = NEW.title
    AND OLD.created_by = NEW.created_by
  );

CREATE POLICY "Boss can update any task"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'boss'
    )
  );

-- Политики для achievements
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политики для team
CREATE POLICY "Boss manages team"
  ON team FOR ALL
  USING (auth.uid() = boss_id);

CREATE POLICY "Members can view their team"
  ON team FOR SELECT
  USING (auth.uid() = member_id OR auth.uid() = boss_id);
