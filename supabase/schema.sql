-- Custom Enum Types
CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'PARENT', 'PRINCIPAL', 'MD');
CREATE TYPE program_type AS ENUM ('CERTIFICATE', 'DIPLOMA');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE');
CREATE TYPE invoice_status AS ENUM ('PAID', 'PARTIAL', 'UNPAID');
CREATE TYPE lesson_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'SUBMITTED', 'SKIPPED', 'CANCELLED');
CREATE TYPE topic_coverage_status AS ENUM ('STARTED', 'CONTINUED', 'COMPLETED');

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  role user_role NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  enrollment_no TEXT UNIQUE NOT NULL,
  program_type program_type NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  enrollment_date DATE DEFAULT CURRENT_DATE
);

-- Teachers
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specialization TEXT,
  hire_date DATE DEFAULT CURRENT_DATE
);

-- Parent Student Mapping
CREATE TABLE parent_student (
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_id, student_id)
);

-- Academic: Courses & Subjects
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  duration TEXT,
  study_times TEXT,
  icon TEXT
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  credits INT
);

-- Classes / Cohorts
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  year INT NOT NULL,
  semester INT NOT NULL
);

-- Class Enrollments
CREATE TABLE class_enrollments (
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (student_id, class_id)
);

-- Topics (Syllabus)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INT NOT NULL DEFAULT 0
);

-- Timetable Sessions
CREATE TABLE timetable_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  day_of_week INT NOT NULL, -- 0=Sun, 1=Mon, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT
);

-- Daily Operations: Academic Truth Engine
CREATE TABLE lesson_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_session_id UUID REFERENCES timetable_sessions(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  actual_teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  status lesson_status DEFAULT 'SCHEDULED',
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  issues_interruptions TEXT,
  summary TEXT,
  homework_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (timetable_session_id, date)
);

CREATE TABLE lesson_topics_covered (
  lesson_session_id UUID REFERENCES lesson_sessions(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  coverage_status topic_coverage_status NOT NULL,
  PRIMARY KEY (lesson_session_id, topic_id)
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  lesson_session_id UUID REFERENCES lesson_sessions(id) ON DELETE CASCADE NOT NULL,
  status attendance_status NOT NULL,
  teacher_comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, lesson_session_id)
);

CREATE TABLE lesson_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_session_id UUID REFERENCES lesson_sessions(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  timetable_session_id UUID REFERENCES timetable_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Finance: Fee Invoices
CREATE TABLE fee_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  due_date DATE NOT NULL,
  status invoice_status DEFAULT 'UNPAID',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments & Results
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- EXAM, QUIZ, ASSIGNMENT
  total_marks DECIMAL(5,2) NOT NULL,
  date DATE
);

CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  grade TEXT,
  UNIQUE (assessment_id, student_id)
);

-- Function to handle new user signups and create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We assume role is passed in raw_user_meta_data, default to STUDENT if not present
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    NEW.email,
    CAST(COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') AS public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_topics_covered ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Disable RLS checks for testing initially or write policies
-- We will write policies as we go. For now, let's allow public read access to get the dashboard working
CREATE POLICY "Allow read access" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON students FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON courses FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON subjects FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON topics FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON timetable_sessions FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON lesson_sessions FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON lesson_topics_covered FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON attendance FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON lesson_audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON fee_invoices FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON assessments FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON results FOR SELECT USING (true);

-- Allow full access for now for simplicity of development. We will restrict this later.
CREATE POLICY "Allow full access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON teachers FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access" ON class_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow full access" ON class_enrollments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON topics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON timetable_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON lesson_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON lesson_topics_covered FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON lesson_audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON fee_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON results FOR ALL USING (true) WITH CHECK (true);
