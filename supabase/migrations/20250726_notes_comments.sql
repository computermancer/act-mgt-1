-- Create emoticon table
CREATE TABLE IF NOT EXISTS emoticons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all operations for all users' AND tablename = 'comments') THEN
        DROP POLICY "Enable all operations for all users" ON public.comments;
    END IF;
END
$$;

-- Allow all operations for comments (since there's only one user)
CREATE POLICY "Enable all operations for all users" 
ON public.comments 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create or replace function to prevent nested replies
CREATE OR REPLACE FUNCTION public.prevent_nested_replies()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NOT NULL THEN
        -- Check if the parent comment has a parent
        IF EXISTS (
            SELECT 1 FROM public.comments WHERE id = NEW.parent_id AND parent_id IS NOT NULL
        ) THEN
            RAISE EXCEPTION 'Cannot reply to a reply';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid duplicates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_nested_replies_trigger') THEN
        DROP TRIGGER prevent_nested_replies_trigger ON public.comments;
    END IF;
END
$$;

-- Create the trigger
CREATE TRIGGER prevent_nested_replies_trigger
    BEFORE INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_nested_replies();

-- Create note_emoticon table
CREATE TABLE IF NOT EXISTS public.note_emoticons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    emoticon_id UUID NOT NULL REFERENCES public.emoticons(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(note_id)  -- One emoji per note (since there's only one user)
);

-- Enable Row Level Security
ALTER TABLE public.note_emoticons ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all operations for all users' AND tablename = 'note_emoticons') THEN
        DROP POLICY "Enable all operations for all users" ON public.note_emoticons;
    END IF;
END
$$;

-- Allow all operations for note_emoticons
CREATE POLICY "Enable all operations for all users" 
ON public.note_emoticons 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists to avoid duplicates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
        DROP TRIGGER update_comments_updated_at ON public.comments;
    END IF;
END
$$;

-- Create the trigger
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default emoticons
INSERT INTO public.emoticons (name, emoji) VALUES
('Heart', '❤️'),
('Thumbs Up', '👍'),
('Thumbs Down', '👎'),
('Eye Roll', '🙄'),
('Happy', '😊'),
('Sad', '😔'),
('Thinking', '🤔'),
('Excited', '🤩'),
('Question', '❓'),
('Important', '❗'),
('Check', '✅');
