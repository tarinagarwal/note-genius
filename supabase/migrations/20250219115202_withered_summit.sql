/*
  # Add notebook functionality

  1. New Tables
    - `notebooks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes to existing tables
    - Add `notebook_id` and `order_index` to `whiteboards` table

  3. Security
    - Enable RLS on `notebooks` table
    - Add policies for authenticated users
*/

-- Create notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add notebook_id and order_index to whiteboards
ALTER TABLE whiteboards 
ADD COLUMN notebook_id uuid REFERENCES notebooks(id) ON DELETE SET NULL,
ADD COLUMN order_index integer DEFAULT 0;

-- Enable RLS
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;

-- Notebooks policies
CREATE POLICY "Users can view their own notebooks"
  ON notebooks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own notebooks"
  ON notebooks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notebooks"
  ON notebooks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notebooks"
  ON notebooks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());