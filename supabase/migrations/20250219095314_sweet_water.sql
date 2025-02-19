/*
  # Create AI responses table

  1. New Tables
    - `ai_responses`
      - `id` (uuid, primary key)
      - `whiteboard_id` (uuid, foreign key to whiteboards)
      - `content` (text)
      - `drawing_data` (jsonb)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_responses` table
    - Add policies for authenticated users to manage their responses
*/

CREATE TABLE IF NOT EXISTS ai_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id uuid REFERENCES whiteboards(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  drawing_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;

-- Policies for ai_responses
CREATE POLICY "Users can view their own responses"
  ON ai_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM whiteboards
      WHERE whiteboards.id = ai_responses.whiteboard_id
      AND whiteboards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create responses for their whiteboards"
  ON ai_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM whiteboards
      WHERE whiteboards.id = ai_responses.whiteboard_id
      AND whiteboards.user_id = auth.uid()
    )
  );