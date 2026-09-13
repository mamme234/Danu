-- Demo seed. Safe to run multiple times. Replace with verified data in
-- production; the application clearly flags unverified records in the UI.

insert into services (category, name, description, duration_minutes, price_etb, status)
values
  ('Orthopaedic Consultation', 'Initial Orthopaedic Consultation', 'In-person assessment of orthopaedic concerns including history, examination and personalised care plan.', 30, null, 'DRAFT'),
  ('Fracture & Trauma Care', 'Fracture & Trauma Care', 'Evaluation and management of fractures and orthopaedic trauma; definitive surgical procedures coordinated as required.', 45, null, 'DRAFT'),
  ('Joint Conditions', 'Joint Condition Management', 'Evaluation of joint pain, stiffness and degenerative conditions, with imaging referrals and care planning.', 30, null, 'DRAFT'),
  ('Bone & Muscle Conditions', 'Bone & Muscle Condition Management', 'Assessment of musculoskeletal pain, sports injuries and overuse conditions.', 30, null, 'DRAFT'),
  ('Orthopaedic Diagnostics', 'Orthopaedic Diagnostics & Imaging', 'On-site evaluation with referrals for imaging and laboratory diagnostics as appropriate.', 30, null, 'DRAFT'),
  ('Surgical Consultation', 'Surgical Consultation', 'Specialist review for surgical planning; performed in collaboration with partner surgical centres.', 45, null, 'DRAFT'),
  ('Rehabilitation & Referral', 'Rehabilitation & Referral Coordination', 'Structured rehabilitation planning with referrals to physiotherapy and allied specialties.', 30, null, 'DRAFT')
on conflict do nothing;

insert into content_blocks (key, status, title, body)
values
  ('home.hero', 'PUBLISHED', 'Specialist orthopaedic care in Addis Ababa',
    'DANU Orthopaedic Center provides specialist orthopaedic consultation, fracture and trauma care, joint and bone condition management, diagnostics and surgical consultation in Addis Ababa, Ethiopia.'),
  ('contact.info', 'PUBLISHED', 'Contact DANU',
    'Address: To be confirmed by administration\nPhone: To be confirmed by administration\nEmail: info@danuorthopaedic.example\nHours: To be confirmed by administration')
on conflict (key) do nothing;

insert into facilities (name, description, "order", status)
values
  ('Reception & Waiting', 'Welcoming reception area with comfortable seating.', 1, 'DRAFT'),
  ('Consultation Rooms', 'Private consultation rooms equipped for orthopaedic assessment.', 2, 'DRAFT'),
  ('Imaging & Diagnostics', 'Imaging and diagnostics coordinated with partner providers.', 3, 'DRAFT'),
  ('Rehabilitation', 'Dedicated rehabilitation and physiotherapy space.', 4, 'DRAFT')
on conflict do nothing;

insert into faq_items (question, answer, category, status, "order")
values
  ('How do I book an appointment?', 'Use the appointment form or call reception during opening hours. Online requests are confirmed by staff before being scheduled.', 'Appointments', 'PUBLISHED', 1),
  ('Do you provide emergency services?', 'For medical emergencies please contact local emergency services (e.g. 907/911) or go to the nearest emergency department. DANU provides scheduled specialist orthopaedic care.', 'Emergencies', 'PUBLISHED', 2),
  ('Which insurance providers do you accept?', 'Please contact reception for the current list of accepted schemes; insurance coverage varies by service.', 'Insurance', 'PUBLISHED', 3)
on conflict do nothing;
