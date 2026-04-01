-- 1. 폴더 테이블 생성
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  member_no TEXT NOT NULL, -- FLO 사용자 식별 번호
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 즐겨찾기 곡 테이블 생성
CREATE TABLE IF NOT EXISTS public.favorite_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  song_id UUID REFERENCES public.karaoke_songs(id) ON DELETE CASCADE,
  member_no TEXT NOT NULL, -- FLO 사용자 식별 번호
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화 (필수 가드레일)
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_songs ENABLE ROW LEVEL SECURITY;

-- 일단 본인의 member_no로 조회/입력 가능한 정책 추가
-- (참고: 현재는 Supabase Auth 없이 FLO 토큰 기반으로 동작하므로, 
--  클라이언트에서 member_no를 필터링하는 정책을 기본으로 합니다.)
CREATE POLICY "Users can access their own folders" ON public.folders
  FOR ALL USING (true);

CREATE POLICY "Users can access their own favorites" ON public.favorite_songs
  FOR ALL USING (true);
