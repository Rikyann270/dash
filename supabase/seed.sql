-- Seed Data for School Management System
-- Paste this script into your Supabase SQL Editor and execute it.

-- Ensure standard extensions are active
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CLEANUP EXISTING SEED DATA (Optional, runs safely with cascading deletes)
DELETE FROM courses;
DELETE FROM auth.users WHERE email IN (
  'md@school.com', 
  'principal@school.com', 
  'teacher1@school.com', 
  'teacher2@school.com', 
  'student1@school.com', 
  'student2@school.com', 
  'student3@school.com',
  'student4@school.com',
  'student5@school.com',
  'student6@school.com',
  'student7@school.com',
  'student8@school.com',
  'student9@school.com',
  'student10@school.com',
  'parent1@school.com'
);

-- 2. INSERT USERS INTO AUTH.USERS
-- Password for all accounts is: password123
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES 
-- MD
('11111111-1111-1111-1111-111111111111', 'md@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Robert", "last_name": "Kavuma", "role": "MD"}', 'authenticated', 'authenticated'),
-- Principal
('22222222-2222-2222-2222-222222222222', 'principal@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Sarah", "last_name": "Nansubuga", "role": "PRINCIPAL"}', 'authenticated', 'authenticated'),
-- Teacher 1
('33333333-3333-3333-3333-333333333333', 'teacher1@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "John", "last_name": "Mugisha", "role": "TEACHER"}', 'authenticated', 'authenticated'),
-- Teacher 2
('44444444-4444-4444-4444-444444444444', 'teacher2@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Jane", "last_name": "Nakato", "role": "TEACHER"}', 'authenticated', 'authenticated'),
-- Student 1 (Alex)
('55555555-5555-5555-5555-555555555555', 'student1@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Alex", "last_name": "Smith", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 2 (Brenda)
('66666666-6666-6666-6666-666666666666', 'student2@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Brenda", "last_name": "Nalwanga", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 3 (Chris)
('77777777-7777-7777-7777-777777777777', 'student3@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Chris", "last_name": "Mugabe", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 4 (Deborah)
('55555555-5555-5555-5555-555555550004', 'student4@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Deborah", "last_name": "Namuganza", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 5 (David)
('55555555-5555-5555-5555-555555550005', 'student5@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "David", "last_name": "Semakula", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 6 (Grace)
('55555555-5555-5555-5555-555555550006', 'student6@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Grace", "last_name": "Atim", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 7 (Michael)
('55555555-5555-5555-5555-555555550007', 'student7@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Michael", "last_name": "Okello", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 8 (Sandra)
('55555555-5555-5555-5555-555555550008', 'student8@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Sandra", "last_name": "Achieng", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 9 (Joseph)
('55555555-5555-5555-5555-555555550009', 'student9@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Joseph", "last_name": "Mukasa", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Student 10 (Stella)
('55555555-5555-5555-5555-555555550010', 'student10@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Stella", "last_name": "Nsubuga", "role": "STUDENT"}', 'authenticated', 'authenticated'),
-- Parent 1 (Grace)
('88888888-8888-8888-8888-888888888888', 'parent1@school.com', crypt('password123', gen_salt('bf', 10)), now(), '{"provider": "email", "providers": ["email"]}', '{"first_name": "Grace", "last_name": "Namaganda", "role": "PARENT"}', 'authenticated', 'authenticated');

-- 2.5 INSERT IDENTITIES (Required for Supabase Auth to allow login)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  id, 
  format('{"sub":"%s","email":"%s"}', id, email)::jsonb, 
  'email', 
  id::text, 
  now(), 
  now(), 
  now()
FROM auth.users;

-- 3. UPDATE PROFILES FOR PHONE NUMBERS
UPDATE profiles SET phone = '+256 701 111111' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE profiles SET phone = '+256 702 222222' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET phone = '+256 703 333333' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE profiles SET phone = '+256 704 444444' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE profiles SET phone = '+256 705 555555' WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE profiles SET phone = '+256 706 666666' WHERE id = '66666666-6666-6666-6666-666666666666';
UPDATE profiles SET phone = '+256 707 777777' WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE profiles SET phone = '+256 708 888888' WHERE id = '88888888-8888-8888-8888-888888888888';

-- 4. SEED STUDENTS AND TEACHERS TABLES
INSERT INTO students (id, profile_id, enrollment_no, program_type, status, enrollment_date) VALUES
('55555555-5555-5555-5555-55555555555a', '55555555-5555-5555-5555-555555555555', 'STU/2026/001', 'DIPLOMA', 'ACTIVE', '2026-01-10'),
('66666666-6666-6666-6666-66666666666a', '66666666-6666-6666-6666-666666666666', 'STU/2026/002', 'CERTIFICATE', 'ACTIVE', '2026-01-12'),
('77777777-7777-7777-7777-77777777777a', '77777777-7777-7777-7777-777777777777', 'STU/2026/003', 'DIPLOMA', 'ACTIVE', '2026-01-15'),
('55555555-5555-5555-5555-55555555004a', '55555555-5555-5555-5555-555555550004', 'STU/2026/004', 'CERTIFICATE', 'ACTIVE', '2026-01-18'),
('55555555-5555-5555-5555-55555555005a', '55555555-5555-5555-5555-555555550005', 'STU/2026/005', 'DIPLOMA', 'ACTIVE', '2026-01-19'),
('55555555-5555-5555-5555-55555555006a', '55555555-5555-5555-5555-555555550006', 'STU/2026/006', 'DIPLOMA', 'ACTIVE', '2026-01-20'),
('55555555-5555-5555-5555-55555555007a', '55555555-5555-5555-5555-555555550007', 'STU/2026/007', 'DIPLOMA', 'ACTIVE', '2026-01-20'),
('55555555-5555-5555-5555-55555555008a', '55555555-5555-5555-5555-555555550008', 'STU/2026/008', 'DIPLOMA', 'ACTIVE', '2026-01-21'),
('55555555-5555-5555-5555-55555555009a', '55555555-5555-5555-5555-555555550009', 'STU/2026/009', 'CERTIFICATE', 'ACTIVE', '2026-01-21'),
('55555555-5555-5555-5555-55555555010a', '55555555-5555-5555-5555-555555550010', 'STU/2026/010', 'DIPLOMA', 'ACTIVE', '2026-01-22');

-- Make sure parent student links are set
INSERT INTO parent_student(parent_id, student_id) VALUES
('88888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-55555555555a'),
('88888888-8888-8888-8888-888888888888', '66666666-6666-6666-6666-66666666666a');

INSERT INTO teachers (id, profile_id, specialization, hire_date) VALUES
('33333333-3333-3333-3333-33333333333a', '33333333-3333-3333-3333-333333333333', 'Plumbing & Building Technology', '2024-05-15'),
('44444444-4444-4444-4444-44444444444a', '44444444-4444-4444-4444-444444444444', 'Information Technology & Data Science', '2024-08-01');


-- 5. SEED COURSES
INSERT INTO courses (id, name, code, description, category, duration, study_times, icon) VALUES
('c3333333-3333-3333-3333-333333333333', 'Business Administration and Management', 'BAM', 'Foundational skills in managing businesses and organizations.', 'Business', '2 years', 'Morning, Afternoon, Weekend', 'Briefcase'),
('c0000000-0000-0000-0000-000000000001', 'Accountancy', 'A', 'Learn accounting principles and financial management.', 'Business', '2 years', 'Morning, Afternoon', 'Briefcase'),
('c0000000-0000-0000-0000-000000000002', 'Human Resource Management', 'HRM', 'Skills in personnel management and organizational development.', 'Business', '2 years', 'Afternoon, Evening', 'Briefcase'),
('c0000000-0000-0000-0000-000000000003', 'Secretarial Studies / Office Management', 'SSOM', 'Training in office administration and secretarial duties.', 'Business', '2 years', 'Morning, Weekend', 'Briefcase'),
('c0000000-0000-0000-0000-000000000004', 'Procurement and Logistics', 'PL', 'Expertise in supply chain and procurement processes.', 'Business', '2 years', 'Afternoon, Weekend', 'Briefcase'),
('c0000000-0000-0000-0000-000000000005', 'Journalism and Media Studies', 'JMS', 'Training in reporting, media production, and communication.', 'Business', '2 years', 'Afternoon, Evening', 'Code'),
('c0000000-0000-0000-0000-000000000006', 'Fashion and Garment Design', 'FGD', 'Hands-on training in designing and creating garments.', 'Vocational', '2 years', 'Morning, Afternoon', 'Scissors'),
('c0000000-0000-0000-0000-000000000007', 'Cosmetology and Beauty Therapy', 'CBT', 'Skills in beauty care, hairdressing, and cosmetics.', 'Vocational', '2 years', 'Morning, Weekend', 'Scissors'),
('c0000000-0000-0000-0000-000000000008', 'Hotel and Institutional Catering', 'HIC', 'Culinary and hospitality skills for institutional settings.', 'Vocational', '2 years', 'Afternoon, Weekend', 'ChefHat'),
('c0000000-0000-0000-0000-000000000009', 'Tourism & Hospitality Management', 'THM', 'Comprehensive skills for the tourism and hospitality industry.', 'Vocational', '2 years', 'Morning, Evening', 'ChefHat'),
('c0000000-0000-0000-0000-000000000010', 'Events Management & Planning', 'EMP', 'Training in organizing and managing events.', 'Vocational', '2 years', 'Morning, Afternoon', 'Briefcase'),
('c1111111-1111-1111-1111-111111111111', 'Information and Communication Technology', 'ICT', 'Essential skills in computing and IT systems.', 'Technical', '2 years', 'Morning, Afternoon', 'Laptop'),
('c0000000-0000-0000-0000-000000000011', 'Electrical Installation & Engineering', 'EIE', 'Practical training in electrical systems and safety.', 'Technical', '2 years', 'Afternoon, Evening', 'Wrench'),
('c0000000-0000-0000-0000-000000000012', 'Welding & Metal Fabrication', 'WMF', 'Master welding techniques and metalwork for industry.', 'Technical', '2 years', 'Morning, Weekend', 'Wrench'),
('c0000000-0000-0000-0000-000000000013', 'Building and Construction', 'BC', 'Technical expertise in construction and project management.', 'Technical', '2 years', 'Afternoon, Evening', 'Wrench'),
('c0000000-0000-0000-0000-000000000014', 'Automotive Mechanical Engineering', 'AME', 'Skills in vehicle repair and mechanical systems.', 'Technical', '2 years', 'Morning, Weekend', 'Wrench'),
('c2222222-2222-2222-2222-222222222222', 'Plumbing', 'P', 'Training in plumbing systems and installation.', 'Technical', '2 years', 'Afternoon, Weekend', 'Wrench'),
('c0000000-0000-0000-0000-000000000015', 'Early Childhood Development', 'ECD', 'Skills in nurturing and educating young children.', 'Social Education', '2 years', 'Morning, Afternoon', 'BookOpen'),
('c0000000-0000-0000-0000-000000000016', 'Child Care', 'CC', 'Training in child welfare and caregiving.', 'Social Education', '2 years', 'Afternoon, Weekend', 'BookOpen'),
('c0000000-0000-0000-0000-000000000017', 'Counseling and Guidance', 'CG', 'Techniques in providing emotional and psychological support.', 'Social Education', '2 years', 'Morning, Evening', 'BookOpen'),
('c0000000-0000-0000-0000-000000000018', 'Home Health Care', 'HHC', 'Skills in providing care for individuals at home.', 'Social Education', '2 years', 'Afternoon, Weekend', 'BookOpen'),
('c0000000-0000-0000-0000-000000000019', 'English Language (The Four Communication Skills)', 'EL(F', 'Improve listening, speaking, reading, and writing in English.', 'Adult Learning', '3 Months', 'Morning, Afternoon', 'BookOpen'),
('c0000000-0000-0000-0000-000000000020', 'Primary Leaving Examination (P.L.E)', 'PLE(', 'Preparation for the Primary Leaving Examination.', 'Adult Learning', '2 years', 'Afternoon, Weekend', 'BookOpen'),
('c0000000-0000-0000-0000-000000000021', 'Uganda Certificate of Education (U.C.E)', 'UCOE', 'Preparation for the Uganda Certificate of Education.', 'Adult Learning', '24 Months', 'Morning, Evening', 'BookOpen');


-- 6. SEED SUBJECTS
INSERT INTO subjects (id, course_id, name, code, credits) VALUES
('11111111-2222-2222-2222-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Introduction to Software Development', 'DCS-101', 4),
('11111111-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Web Systems & Technologies', 'DCS-102', 3),
('11111111-2222-2222-2222-333333333333', 'c2222222-2222-2222-2222-222222222222', 'Sanitary Systems Installation', 'CPC-101', 5),
('11111111-2222-2222-2222-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Technical Blueprint Drafting', 'CPC-102', 3),
('11111111-2222-2222-2222-555555555555', 'c3333333-3333-3333-3333-333333333333', 'Financial & Cost Accounting', 'DBA-101', 4);


-- 7. SEED COHORTS / CLASSES
INSERT INTO classes (id, name, course_id, year, semester) VALUES
('22222222-3333-3333-3333-111111111111', 'IT Year 1 Sem 1 - 2026', 'c1111111-1111-1111-1111-111111111111', 1, 1),
('22222222-3333-3333-3333-222222222222', 'Plumbing Year 1 Sem 1 - 2026', 'c2222222-2222-2222-2222-222222222222', 1, 1),
('22222222-3333-3333-3333-333333333333', 'Business Year 1 Sem 1 - 2026', 'c3333333-3333-3333-3333-333333333333', 1, 1);


-- 8. SEED CLASS ENROLLMENTS
INSERT INTO class_enrollments (student_id, class_id) VALUES
('55555555-5555-5555-5555-55555555555a', '22222222-3333-3333-3333-111111111111'),
('66666666-6666-6666-6666-66666666666a', '22222222-3333-3333-3333-222222222222'),
('77777777-7777-7777-7777-77777777777a', '22222222-3333-3333-3333-333333333333'),
('55555555-5555-5555-5555-55555555004a', '22222222-3333-3333-3333-222222222222'),
('55555555-5555-5555-5555-55555555005a', '22222222-3333-3333-3333-111111111111'),
('55555555-5555-5555-5555-55555555006a', '22222222-3333-3333-3333-333333333333'),
('55555555-5555-5555-5555-55555555007a', '22222222-3333-3333-3333-111111111111'),
('55555555-5555-5555-5555-55555555008a', '22222222-3333-3333-3333-111111111111'),
('55555555-5555-5555-5555-55555555009a', '22222222-3333-3333-3333-222222222222'),
('55555555-5555-5555-5555-55555555010a', '22222222-3333-3333-3333-333333333333');


-- 9. SEED SYLLABUS TOPICS
INSERT INTO topics (id, subject_id, title, description, order_index) VALUES
('33333333-4444-4444-4444-111111111111', '11111111-2222-2222-2222-111111111111', 'Variables & Basic Data Types', 'Exploring core data representations, integer limits, boolean flags, and string structures.', 1),
('33333333-4444-4444-4444-222222222222', '11111111-2222-2222-2222-111111111111', 'Control Flow Statements', 'Understanding IF/ELSE logic, SWITCH selectors, FOR loops, and WHILE loops.', 2),
('33333333-4444-4444-4444-333333333333', '11111111-2222-2222-2222-222222222222', 'Semantic HTML5', 'Writing clean layouts using header, nav, main, article, footer, and section blocks.', 1),
('33333333-4444-4444-4444-444444444444', '11111111-2222-2222-2222-222222222222', 'CSS Flexbox & Responsive Layouts', 'Designing adaptive layouts using flex rows, alignment parameters, and media queries.', 2),
('33333333-4444-4444-4444-555555555555', '11111111-2222-2222-2222-333333333333', 'Pipe Threading & Joint Connections', 'Hands-on practice applying Teflon tape and pipe dope to galvanized and PVC pipe threads.', 1);


-- 10. SEED TIMETABLE SESSIONS
INSERT INTO timetable_sessions (id, class_id, subject_id, teacher_id, day_of_week, start_time, end_time, room) VALUES
-- Monday 9:00 - 11:30 -> IT Class, Web systems (Nakato Jane)
('44444444-5555-5555-5555-111111111111', '22222222-3333-3333-3333-111111111111', '11111111-2222-2222-2222-222222222222', '44444444-4444-4444-4444-44444444444a', 1, '09:00:00', '11:30:00', 'Lab 2'),
-- Tuesday 10:00 - 12:30 -> IT Class, Software Dev (Nakato Jane)
('44444444-5555-5555-5555-222222222222', '22222222-3333-3333-3333-111111111111', '11111111-2222-2222-2222-111111111111', '44444444-4444-4444-4444-44444444444a', 2, '10:00:00', '12:30:00', 'Lab 2'),
-- Wednesday 08:30 - 11:00 -> Plumbing, Sanitary (Mugisha John)
('44444444-5555-5555-5555-333333333333', '22222222-3333-3333-3333-222222222222', '11111111-2222-2222-2222-333333333333', '33333333-3333-3333-3333-33333333333a', 3, '08:30:00', '11:00:00', 'Plumbing Workshop'),
-- Thursday 14:00 - 16:30 -> Business, Accounting (Jane Nakato)
('44444444-5555-5555-5555-444444444444', '22222222-3333-3333-3333-333333333333', '11111111-2222-2222-2222-555555555555', '44444444-4444-4444-4444-44444444444a', 4, '14:00:00', '16:30:00', 'Room 105');


-- 11. SEED OPERATIONS: ACADEMIC TRUTH ENGINE (Lesson Sessions)
INSERT INTO lesson_sessions (id, timetable_session_id, date, actual_teacher_id, status, started_at, submitted_at, summary) VALUES
('b1111111-1111-1111-1111-111111111111', '44444444-5555-5555-5555-111111111111', '2026-06-15', '44444444-4444-4444-4444-44444444444a', 'SUBMITTED', '2026-06-15 09:00:00+03', '2026-06-15 11:35:00+03', 'Introduced HTML structure. All students successfully wrote a skeleton index.html file.'),
('b2222222-2222-2222-2222-222222222222', '44444444-5555-5555-5555-333333333333', '2026-06-10', '33333333-3333-3333-3333-33333333333a', 'SUBMITTED', '2026-06-10 08:30:00+03', '2026-06-10 11:05:00+03', 'Practiced applying Teflon on galvanized elbow fittings. Brenda Nalwanga performed exceptionally.'),
('b3333333-3333-3333-3333-333333333333', '44444444-5555-5555-5555-111111111111', '2026-06-08', '44444444-4444-4444-4444-44444444444a', 'SUBMITTED', '2026-06-08 09:00:00+03', '2026-06-08 11:30:00+03', 'Initial introduction.'),
('b4444444-4444-4444-4444-444444444444', '44444444-5555-5555-5555-222222222222', '2026-06-09', '44444444-4444-4444-4444-44444444444a', 'SUBMITTED', '2026-06-09 10:00:00+03', '2026-06-09 12:30:00+03', 'Basic variables.'),
('b5555555-5555-5555-5555-555555555555', '44444444-5555-5555-5555-222222222222', '2026-06-16', '44444444-4444-4444-4444-44444444444a', 'SUBMITTED', '2026-06-16 10:00:00+03', '2026-06-16 12:30:00+03', 'Control flow statements.'),
('b6666666-6666-6666-6666-666666666666', '44444444-5555-5555-5555-333333333333', '2026-06-17', '33333333-3333-3333-3333-33333333333a', 'SUBMITTED', '2026-06-17 08:30:00+03', '2026-06-17 11:00:00+03', 'More threading.');

INSERT INTO lesson_topics_covered (lesson_session_id, topic_id, coverage_status) VALUES
('b1111111-1111-1111-1111-111111111111', '33333333-4444-4444-4444-333333333333', 'STARTED'),
('b2222222-2222-2222-2222-222222222222', '33333333-4444-4444-4444-555555555555', 'COMPLETED'),
('b4444444-4444-4444-4444-444444444444', '33333333-4444-4444-4444-111111111111', 'STARTED'),
('b5555555-5555-5555-5555-555555555555', '33333333-4444-4444-4444-222222222222', 'COMPLETED');

-- 12. SEED OPERATIONS: ATTENDANCE HISTORY
INSERT INTO attendance (student_id, lesson_session_id, status) VALUES
('55555555-5555-5555-5555-55555555555a', 'b3333333-3333-3333-3333-333333333333', 'PRESENT'),
('55555555-5555-5555-5555-55555555555a', 'b1111111-1111-1111-1111-111111111111', 'PRESENT'),
('55555555-5555-5555-5555-55555555555a', 'b4444444-4444-4444-4444-444444444444', 'LATE'),
('55555555-5555-5555-5555-55555555555a', 'b5555555-5555-5555-5555-555555555555', 'PRESENT'),
('66666666-6666-6666-6666-66666666666a', 'b2222222-2222-2222-2222-222222222222', 'PRESENT'),
('66666666-6666-6666-6666-66666666666a', 'b6666666-6666-6666-6666-666666666666', 'ABSENT');


-- 13. SEED FINANCE: FEE INVOICES (For ledger)
INSERT INTO fee_invoices (student_id, amount_due, amount_paid, due_date, status, created_at) VALUES
('55555555-5555-5555-5555-55555555555a', 1500.00, 1500.00, '2026-02-15', 'PAID', '2026-01-15 09:00:00+03'),
('55555555-5555-5555-5555-55555555555a', 1800.00, 500.00, '2026-07-01', 'PARTIAL', '2026-05-10 10:00:00+03'),
('66666666-6666-6666-6666-66666666666a', 1200.00, 0.00, '2026-03-01', 'UNPAID', '2026-01-20 11:00:00+03'),
('77777777-7777-7777-7777-77777777777a', 1600.00, 1600.00, '2026-02-28', 'PAID', '2026-01-25 14:00:00+03'),
('77777777-7777-7777-7777-77777777777a', 1800.00, 1200.00, '2026-08-15', 'PARTIAL', '2026-06-01 09:30:00+03');


-- 14. SEED ASSESSMENTS
INSERT INTO assessments (id, subject_id, title, type, total_marks, date) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-2222-2222-2222-111111111111', 'Midterm Programming Quiz', 'QUIZ', 30.00, '2026-03-10'),
('a2222222-2222-2222-2222-222222222222', '11111111-2222-2222-2222-111111111111', 'Final Coding Examination', 'EXAM', 100.00, '2026-06-05'),
('a3333333-3333-3333-3333-333333333333', '11111111-2222-2222-2222-333333333333', 'Welding Practice Assessment', 'ASSIGNMENT', 50.00, '2026-05-18');


-- 15. SEED RESULTS
INSERT INTO results (assessment_id, student_id, marks_obtained, grade) VALUES
-- Alex midterm
('a1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-55555555555a', 27.50, 'A'),
-- Alex final exam
('a2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-55555555555a', 88.00, 'A-'),
-- Brenda practical welding
('a3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-66666666666a', 45.00, 'A');


-- 16. SEED NOTIFICATIONS
INSERT INTO notifications (student_id, teacher_id, timetable_session_id, title, message, is_read, created_at) VALUES
('55555555-5555-5555-5555-55555555555a', '44444444-4444-4444-4444-44444444444a', '44444444-5555-5555-5555-111111111111', 'Attendance Update: Web Systems & Technologies', 'You have been marked PRESENT for Web Systems & Technologies by Jane Nakato on 2026-06-15.', false, NOW() - INTERVAL '10 minutes'),
('55555555-5555-5555-5555-55555555555a', '44444444-4444-4444-4444-44444444444a', '44444444-5555-5555-5555-222222222222', 'Attendance Update: Introduction to Software Development', 'You have been marked LATE for Introduction to Software Development by Jane Nakato on 2026-06-16.', true, NOW() - INTERVAL '1 day'),
('66666666-6666-6666-6666-66666666666a', '33333333-3333-3333-3333-33333333333a', '44444444-5555-5555-5555-333333333333', 'Attendance Update: Sanitary Systems Installation', 'You have been marked ABSENT for Sanitary Systems Installation by John Mugisha on 2026-06-17.', false, NOW() - INTERVAL '5 hours');
