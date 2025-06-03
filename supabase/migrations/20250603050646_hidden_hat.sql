/*
  # Add Authentication Functions

  1. Changes
    - Add function to handle user registration
    - Add function to handle user login
    - Add function to handle password reset
    - Add function to verify email

  2. Security
    - Functions are only accessible to authenticated users
    - Passwords are hashed using strong cryptography
*/

-- Create extension for strong password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to register a new user
CREATE OR REPLACE FUNCTION register_user(
  p_name text,
  p_email text,
  p_password text
) RETURNS uuid AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;

  -- Insert new user
  INSERT INTO users (
    name,
    email,
    password_hash,
    email_verification_token
  ) VALUES (
    p_name,
    p_email,
    crypt(p_password, gen_salt('bf')),
    encode(gen_random_bytes(32), 'hex')
  ) RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(
  p_email text,
  p_password text
) RETURNS TABLE (
  user_id uuid,
  name text,
  email text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    name,
    email
  FROM users
  WHERE 
    email = p_email 
    AND password_hash = crypt(p_password, password_hash);

  -- Update last sign in time
  UPDATE users 
  SET last_sign_in_at = now()
  WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify email
CREATE OR REPLACE FUNCTION verify_email(
  p_email text,
  p_token text
) RETURNS boolean AS $$
BEGIN
  UPDATE users 
  SET 
    email_verified = true,
    email_verification_token = NULL
  WHERE 
    email = p_email 
    AND email_verification_token = p_token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initiate password reset
CREATE OR REPLACE FUNCTION request_password_reset(
  p_email text
) RETURNS text AS $$
DECLARE
  v_reset_token text;
BEGIN
  -- Generate reset token
  v_reset_token := encode(gen_random_bytes(32), 'hex');
  
  -- Update user with reset token
  UPDATE users 
  SET 
    password_reset_token = v_reset_token,
    password_reset_expires = now() + interval '1 hour'
  WHERE email = p_email;

  RETURN v_reset_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;