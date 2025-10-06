-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist(created_at DESC);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for waitlist sign-ups)
CREATE POLICY "Allow public waitlist inserts" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated admins can view waitlist
CREATE POLICY "Allow admins to view waitlist" ON waitlist
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can delete from waitlist
CREATE POLICY "Allow admins to delete from waitlist" ON waitlist
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE waitlist IS 'Stores email addresses for the peakbook waitlist';
