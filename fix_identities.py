import re

with open('supabase/seed.sql', 'r') as f:
    sql = f.read()

identities_sql = """
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
"""

if "INSERT INTO auth.identities" not in sql:
    sql = re.sub(r'-- 3\. SEED PROFILES', identities_sql + '\n\n-- 3. SEED PROFILES', sql)
    with open('supabase/seed.sql', 'w') as f:
        f.write(sql)
    print("Added auth.identities to seed.sql")
else:
    print("auth.identities already exists in seed.sql")
