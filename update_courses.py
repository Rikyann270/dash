import json
import uuid
import re

with open("supabase/courses.json", "r") as f:
    data = json.load(f)

# Hardcoded UUIDs to match existing seed data so we don't break relationships
SPECIAL_IDS = {
    "Information and Communication Technology": "11111111-1111-1111-1111-111111111111",
    "Plumbing": "22222222-2222-2222-2222-222222222222",
    "Business Administration and Management": "33333333-3333-3333-3333-333333333333"
}

courses = []
counter = 1

for category, items in data.items():
    for item in items:
        name = item["name"]
        
        # Generate code from name (e.g. "Information and Communication Technology" -> "ICT")
        code_words = [w for w in name.replace("and ", "").replace("& ", "").replace("/ ", "").split(" ") if w]
        code = "".join([w[0].upper() for w in code_words])[:4]
        
        # Special IDs for the ones already having classes/subjects in the seed
        if name in SPECIAL_IDS:
            c_id = SPECIAL_IDS[name]
        else:
            c_id = f"c0000000-0000-0000-0000-{counter:012d}"
            counter += 1
            
        desc = item["description"].replace("'", "''")
        
        courses.append(f"('{c_id}', '{name}', '{code}', '{desc}', '{category}', '{item['duration']}', '{item['studyTimes']}', '{item['icon']}')")

values = ",\n".join(courses)

sql = f"""-- 5. SEED COURSES
INSERT INTO courses (id, name, code, description, category, duration, study_times, icon) VALUES
{values};"""

with open("supabase/seed.sql", "r") as f:
    seed = f.read()

# Find the courses insert block and replace it
new_seed = re.sub(r"-- 5\. SEED COURSES.*?;\n", sql + "\n", seed, flags=re.DOTALL)

with open("supabase/seed.sql", "w") as f:
    f.write(new_seed)

print("Updated seed.sql with 24 courses from courses.json")
