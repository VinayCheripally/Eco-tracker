/*
  # Add authentication fields to users table

  1. Changes
    - Add password_hash field to users table
    - Add email verification fields
    - Add last_sign_in_at field
  
  2. Security
    - Update RLS policies for better security
*/

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash text NOT NULL,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_token text,
ADD COLUMN IF NOT EXISTS last_sign_in_at timestamptz;

-- Update existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);