
ALTER TABLE public.courses ADD COLUMN language text NOT NULL DEFAULT 'english';

-- Update existing courses to be marked as English
UPDATE public.courses SET language = 'english';
