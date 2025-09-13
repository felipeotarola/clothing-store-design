# Supabase Setup Instructions

## Database Schema

To set up the database for shared looks functionality, you'll need to create a table in your Supabase project.

### Create the `shared_looks` table

Run this SQL in your Supabase SQL editor:

```sql
-- Create the shared_looks table
CREATE TABLE shared_looks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  prompt TEXT,
  product_names TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on created_at for better query performance
CREATE INDEX idx_shared_looks_created_at ON shared_looks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE shared_looks ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (since this is a fashion showcase)
CREATE POLICY "Allow public read access" ON shared_looks
  FOR SELECT USING (true);

-- Create a policy to allow public insert access (for sharing looks)
CREATE POLICY "Allow public insert access" ON shared_looks
  FOR INSERT WITH CHECK (true);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_shared_looks_updated_at BEFORE UPDATE ON shared_looks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

You can find these values in your Supabase project settings under "API".

## Features Enabled

After setting up Supabase, the following features will be available:

1. **Share Look Button**: Users can share their virtual try-on results
2. **Your Look Section**: A new category displaying all shared looks
3. **Persistent Storage**: Shared looks are stored in Supabase and persist across sessions
4. **Public Gallery**: All users can see shared looks in the "Your Look" section

## Security Notes

- The current setup allows public read/write access for the showcase nature of the app
- For production use, consider implementing user authentication and proper access controls
- The RLS policies can be modified to restrict access based on user authentication