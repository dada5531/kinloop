-- KINLOOP Demo Seed Data
-- Parent: Jenn | Child: Mia (age 4y 2mo)
-- Run after migration: supabase db reset

-- Demo user (Clerk ID will be replaced on first login)
insert into public.users (id, clerk_id, email, name)
values (
  '11111111-1111-1111-1111-111111111111',
  'demo_clerk_id',
  'jenn@example.com',
  'Jenn'
);

-- Demo child: Mia, born Feb 15, 2022
insert into public.children (id, user_id, name, dob, allergies, notes)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Mia',
  '2022-02-15',
  array['peanuts'],
  'Attends Bright Horizons Academy. Loves dinosaurs and painting.'
);

-- Sample events (Quadrant 1: Scheduler)
insert into public.events (user_id, child_id, title, start_time, end_time, location, source, action_items, amount_due, status)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Spring Field Trip to City Zoo',
    '2026-05-15 08:30:00+00',
    '2026-05-15 14:30:00+00',
    'City Zoo, 1234 Zoo Drive',
    'School email from Ms. Rodriguez',
    '[{"task": "Sign and return permission slip", "due_date": "2026-05-10"}, {"task": "Pack sunscreen and hat", "due_date": "2026-05-15"}, {"task": "Send $15 field trip fee", "due_date": "2026-05-10"}]',
    15.00,
    'approved'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Picture Day',
    '2026-05-20 09:00:00+00',
    '2026-05-20 12:00:00+00',
    'Bright Horizons Academy',
    'School newsletter',
    '[{"task": "Choose outfit for Mia", "due_date": "2026-05-19"}]',
    null,
    'approved'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Summer Camp Registration Deadline',
    '2026-06-01 00:00:00+00',
    null,
    null,
    'School email',
    '[{"task": "Complete online registration form", "due_date": "2026-06-01"}, {"task": "Submit medical clearance form", "due_date": "2026-06-01"}]',
    250.00,
    'pending'
  );

-- Sample health record (Quadrant 2: Development Hub)
insert into public.health_records (user_id, child_id, visit_date, type, extracted, summary)
values (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '2026-03-10',
  'well_visit',
  '{
    "visit_type": "well_visit",
    "visit_date": "2026-03-10",
    "height_cm": 103.6,
    "weight_kg": 17.5,
    "vaccinations": [{"name": "DTaP booster", "date": "2026-03-10"}],
    "concerns_flagged": [],
    "next_steps": ["Schedule dental checkup", "Continue daily vitamin D"],
    "summary": "Mia is developing well. Height and weight are tracking at the 65th and 75th percentiles respectively. All milestones on track for age 4."
  }',
  'Mia is developing well. Height and weight are tracking at the 65th and 75th percentiles respectively. All milestones on track for age 4.'
);

-- Sample activities (Quadrant 3: Play Lab)
insert into public.activities (user_id, child_id, source_url, title, materials, duration_minutes, age_min, age_max, steps)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'https://www.youtube.com/watch?v=example1',
    'Rainbow Volcano Experiment',
    '[{"name": "Baking soda", "qty": "1/2 cup", "where_to_buy": "grocery store"}, {"name": "White vinegar", "qty": "1 cup", "where_to_buy": "grocery store"}, {"name": "Food coloring", "qty": "4 colors", "where_to_buy": "grocery store"}, {"name": "Plastic tray", "qty": "1", "where_to_buy": "dollar store"}]',
    30,
    3,
    6,
    '["Mound baking soda into a volcano shape on the tray", "Add drops of different food coloring around the volcano", "Slowly pour vinegar over the top", "Watch the rainbow lava flow!", "Discuss: what makes the bubbles? (acid + base reaction)"]'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    null,
    'Dinosaur Fossil Dig',
    '[{"name": "Plaster of Paris", "qty": "2 cups", "where_to_buy": "craft store"}, {"name": "Small dinosaur toys", "qty": "5-6", "where_to_buy": "dollar store"}, {"name": "Paintbrush", "qty": "1", "where_to_buy": "craft store"}, {"name": "Plastic container", "qty": "1", "where_to_buy": "dollar store"}]',
    45,
    3,
    7,
    '["Mix plaster of Paris and pour half into container", "Place dinosaur toys on top", "Pour remaining plaster to cover", "Let dry overnight (24 hours)", "Give child a paintbrush to carefully excavate the fossils", "Name each dinosaur as they are discovered"]'
  );

-- Sample coach conversation (Quadrant 4: Coach)
insert into public.coach_conversations (id, user_id, child_id)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

insert into public.coach_messages (conversation_id, role, content, sources)
values
  (
    '33333333-3333-3333-3333-333333333333',
    'user',
    'Mia has been having tantrums at bedtime. She screams when we say it is time to brush teeth. What should we try?',
    null
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'assistant',
    'Bedtime resistance is very common at age 4, and the teeth-brushing trigger suggests Mia may be asserting her need for autonomy rather than being defiant. Here are some evidence-based strategies:\n\n**1. Offer controlled choices.** Instead of "time to brush teeth," try "Do you want to use the strawberry toothpaste or the mint one tonight?" This gives Mia a sense of control within your boundary.\n\n**2. Use a visual routine chart.** Create a simple bedtime sequence (bath → teeth → story → lights out) with pictures. When Mia can see what comes next, transitions feel less abrupt.\n\n**3. Connect before you redirect.** When the tantrum starts, get down to her eye level and acknowledge the feeling: "You are really upset about stopping playtime. That is hard." This activates the upstairs brain and helps her regulate.\n\n**4. Make it playful.** Let a stuffed dinosaur "brush its teeth first" or set a 2-minute sand timer as a game. Playfulness bypasses the power struggle entirely.\n\nSources: *The Whole-Brain Child* by Daniel Siegel, *How to Talk So Kids Will Listen* by Adele Faber',
    '[{"book_title": "The Whole-Brain Child", "book_author": "Daniel Siegel"}, {"book_title": "How to Talk So Kids Will Listen", "book_author": "Adele Faber"}]'
  );
