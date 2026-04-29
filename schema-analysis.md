# Schema Analysis for Soft-Delete

Tables that need `deleted_at` (user-facing CRUD data in the 4 quadrants):

| Table | Quadrant | Has deleted_at? |
|-------|----------|-----------------|
| events | Scheduler | No |
| activities | Play Lab | No |
| health_records | Development | No |
| measurements | Development | No |
| milestones | Development | No |
| tips_saved | Coach | No |
| coach_conversations | Coach | No |

Tables that do NOT need deleted_at (system/corpus/config):
- activities_corpus (read-only corpus)
- tips_corpus (read-only corpus)
- embeddings (system)
- daily_recommendations (system-generated)
- coach_messages (part of conversation, delete with conversation)
- sent_emails (audit log)
- user_settings (config)
- users (auth)
- children (profile — keep for now)
