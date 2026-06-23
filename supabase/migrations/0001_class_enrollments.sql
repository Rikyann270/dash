-- Create a junction table to map students to specific classes
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(student_id, class_id)
);

ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON class_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow full access" ON class_enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);
