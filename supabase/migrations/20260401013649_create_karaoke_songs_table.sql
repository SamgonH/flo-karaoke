-- Migration: create_karaoke_songs_table
CREATE TABLE IF NOT EXISTS public.karaoke_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  tj_number TEXT,
  ky_number TEXT,
  search_keywords TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS는 신규 테이블 생성 즉시 활성화
ALTER TABLE public.karaoke_songs ENABLE ROW LEVEL SECURITY;

-- 누구나 곡 정보를 읽을 수 있도록 허용
CREATE POLICY "Allow public read access" ON public.karaoke_songs FOR SELECT USING (true);
