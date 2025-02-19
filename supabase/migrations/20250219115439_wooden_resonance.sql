/*
  # Fix RLS policies for whiteboard reordering

  1. Changes
    - Update RLS policy for whiteboards to allow batch updates
    - Add policy specifically for order_index updates
    - Ensure users can only update their own whiteboards

  2. Security
    - Maintain user data isolation
    - Allow batch updates while preserving security
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update their own whiteboards" ON whiteboards;

-- Create new update policies
CREATE POLICY "Users can update their own whiteboards"
  ON whiteboards FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add specific policy for order_index updates
CREATE POLICY "Users can reorder their own whiteboards"
  ON whiteboards FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM whiteboards w2
      WHERE w2.id = whiteboards.id
      AND w2.user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM whiteboards w2
      WHERE w2.id = whiteboards.id
      AND w2.user_id = auth.uid()
    )
  );