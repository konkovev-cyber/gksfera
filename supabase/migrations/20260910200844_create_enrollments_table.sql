/*
# Create enrollments table for «Сфера» enrollment form submissions

1. New Tables
- `enrollments`
  - `id` (uuid, primary key)
  - `parent_name` (text, name of the parent submitting the form)
  - `child_age` (text, age of the child, e.g. "7 лет")
  - `interest` (text, selected program/direction of interest)
  - `contact` (text, phone/messenger/VK contact info)
  - `comment` (text, optional additional message)
  - `status` (text, default 'new' — tracking: new, contacted, enrolled, archived)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `enrollments`.
- INSERT: allow anon + authenticated (form is public, no login required).
- SELECT/UPDATE/DELETE: authenticated only (studio staff to view/manage submissions).
  No anon SELECT — submissions contain personal data and must not be publicly readable.
*/

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  child_age text NOT NULL,
  interest text NOT NULL,
  contact text NOT NULL,
  comment text DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_enrollment" ON enrollments;
CREATE POLICY "anon_insert_enrollment"
ON enrollments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_enrollments" ON enrollments;
CREATE POLICY "auth_select_enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "auth_update_enrollments" ON enrollments;
CREATE POLICY "auth_update_enrollments"
ON enrollments FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_enrollments" ON enrollments;
CREATE POLICY "auth_delete_enrollments"
ON enrollments FOR DELETE
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS enrollments_created_at_idx ON enrollments (created_at DESC);
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON enrollments (status);
