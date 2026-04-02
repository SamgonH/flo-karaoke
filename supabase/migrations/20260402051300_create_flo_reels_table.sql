-- Migration: create_flo_reels_table
CREATE TABLE IF NOT EXISTS public.flo_reels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id TEXT NOT NULL REFERENCES public.profiles(member_no) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.karaoke_songs(id) ON DELETE CASCADE,
  video_title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  video_url TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.flo_reels ENABLE ROW LEVEL SECURITY;

-- 누구나 릴스를 볼 수 있음
CREATE POLICY "Reels are viewable by everyone" ON public.flo_reels FOR SELECT USING (true);

-- (현재 클라이언트 브라우저 로컬스토리지 환경용) 누구나 릴스 등록 가능
CREATE POLICY "Users can upload reels" ON public.flo_reels FOR INSERT WITH CHECK (true);

-- 수정 정책
CREATE POLICY "Users can update reels" ON public.flo_reels FOR UPDATE USING (true);

-- 삭제 정책
CREATE POLICY "Users can delete reels" ON public.flo_reels FOR DELETE USING (true);
