# Actual Supabase Column Names

## events

id (uuid), user_id (uuid), child_id (uuid), title (text), start_time (timestamptz), end_time (timestamptz), location (text), source (text), action_items (jsonb), amount_due (jsonb), google_event_id (text), status (text), created_at (timestamptz), updated_at (timestamptz), reply_draft (text), confidence (numeric), raw_content (text), file_url (text), source_label (text)

## health_records

id (uuid), user_id (uuid), child_id (uuid), visit_date (date), type (text), file_url (text), extracted (jsonb), summary (text), created_at (timestamptz), updated_at (timestamptz), height_cm (numeric), weight_kg (numeric), provider (text)

## activities

id (uuid), user_id (uuid), child_id (uuid), source_url (text), title (text), materials (jsonb), duration_minutes (int), age_min (int), age_max (int), steps (jsonb), scheduled_for (timestamptz), created_at (timestamptz), updated_at (timestamptz), skills (text[]), safety_notes (text[]), messiness (int), indoor_outdoor (text), platform (text), description (text)

## children

id (uuid), user_id (uuid), name (text), dob (date), photo_url (text), allergies (text[]), notes (text), created_at (timestamptz), updated_at (timestamptz)
