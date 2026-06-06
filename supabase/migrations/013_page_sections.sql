-- Page Sections — admin-managed homepage / key-page layout.
--
-- Layouts are stored as a jsonb array in the existing `site_settings` table,
-- one row per page under the key `page_sections_<page>`. Each array element is
-- a section: { "id", "type", "enabled", "props" }.
--
-- The application falls back to a sensible default layout when a row is missing,
-- so this seed is optional — it simply makes the homepage layout explicit and
-- editable from the very first load of the new "/admin/sections" manager.
--
-- ON CONFLICT DO NOTHING so re-running never clobbers an admin's saved layout.

INSERT INTO site_settings (key, value) VALUES
  (
    'page_sections_home',
    '[
      {"id": "builtin-hero",              "type": "hero",              "enabled": true, "props": {}},
      {"id": "builtin-trust_strip",       "type": "trust_strip",       "enabled": true, "props": {}},
      {"id": "builtin-featured_products", "type": "featured_products", "enabled": true, "props": {}},
      {"id": "builtin-how_it_works",      "type": "how_it_works",      "enabled": true, "props": {}},
      {"id": "builtin-cta_banner",        "type": "cta_banner",        "enabled": true, "props": {}}
    ]'::jsonb
  ),
  ('page_sections_shop',    '[]'::jsonb),
  ('page_sections_contact', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
