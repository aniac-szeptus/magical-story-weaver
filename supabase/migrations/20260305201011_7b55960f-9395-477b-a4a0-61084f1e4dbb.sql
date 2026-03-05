
CREATE TABLE public.favorite_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  topic_category TEXT,
  moral TEXT,
  moral_category TEXT,
  duration TEXT,
  gender TEXT,
  age TEXT,
  story_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.favorite_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.favorite_stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorite_stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorite_stories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
