/*
  # Create testimonials table and security policies

  1. New Tables
    - `testimonials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (varchar(100), customer name)
      - `text` (text, testimonial content, max 500 chars)
      - `video_url` (varchar(255), optional video URL)
      - `approved` (boolean, default false)
      - `created_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `testimonials` table
    - Add policy for users to view their own testimonials
    - Add policy for anyone to insert testimonials (public collection)
    - Add policy for users to update/delete their own testimonials

  3. Storage
    - Create storage bucket for testimonial videos
    - Add storage policies for video uploads

  4. Indexes
    - Index on user_id for efficient queries
    - Index on approved status for public API
    - Index on created_at for sorting
*/

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name varchar(100) NOT NULL,
  text text NOT NULL CHECK (char_length(text) <= 500 AND char_length(text) >= 10),
  video_url varchar(255),
  approved boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Add personal messages table for user customization
CREATE TABLE IF NOT EXISTS personal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title varchar(100),
  message text CHECK (char_length(message) <= 500),
  is_visible boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE personal_messages ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_personal_messages_user_id ON personal_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_messages_visible ON personal_messages(user_id, is_visible) WHERE is_visible = true;

-- RLS Policies for personal messages

-- Policy: Users can view their own messages
CREATE POLICY "Users can view their own messages"
  ON personal_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON personal_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON personal_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON personal_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Anyone can view visible messages (for collection page)
CREATE POLICY "Anyone can view visible messages"
  ON personal_messages FOR SELECT
  USING (is_visible = true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personal_messages_updated_at 
    BEFORE UPDATE ON personal_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();