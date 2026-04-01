-- Migration: add_stats_to_karaoke_songs
-- 1. 통계 컬럼 추가
ALTER TABLE public.karaoke_songs 
ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS preview_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_count INTEGER DEFAULT 0;

-- 2. 이미 존재하는 데이터의 NULL 값 방지 (기존 데이터가 있을 경우)
UPDATE public.karaoke_songs SET search_count = 0 WHERE search_count IS NULL;
UPDATE public.karaoke_songs SET preview_count = 0 WHERE preview_count IS NULL;
UPDATE public.karaoke_songs SET favorite_count = 0 WHERE favorite_count IS NULL;

-- 3. 실시간 카운트 증가를 위한 RPC 함수 생성
-- 이를 통해 클라이언트에서 RLS를 우회하지 않고 안전하게 특정 컬럼만 1씩 증가시킬 수 있습니다.
CREATE OR REPLACE FUNCTION increment_song_stat(song_id UUID, stat_type TEXT)
RETURNS void AS $$
BEGIN
  IF stat_type = 'search' THEN
    UPDATE public.karaoke_songs SET search_count = search_count + 1 WHERE id = song_id;
  ELSIF stat_type = 'preview' THEN
    UPDATE public.karaoke_songs SET preview_count = preview_count + 1 WHERE id = song_id;
  ELSIF stat_type = 'favorite' THEN
    UPDATE public.karaoke_songs SET favorite_count = favorite_count + 1 WHERE id = song_id;
  ELSIF stat_type = 'unfavorite' THEN
    UPDATE public.karaoke_songs SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = song_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
