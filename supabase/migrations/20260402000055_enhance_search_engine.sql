-- Migration: enhance_search_engine_with_trgm
-- 1. pg_trgm 확장 활성화 (유사도 검색 지원)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. 검색 성능 및 유사도 검색을 위한 GIST 인덱스 생성
-- 제목, 아티스트, 키워드에 대해 Trigram 인덱스를 걸어 오타 및 부분 일치 성능 극대화
CREATE INDEX IF NOT EXISTS idx_karaoke_songs_search_trgm ON public.karaoke_songs 
USING gist (title gist_trgm_ops, artist gist_trgm_ops, search_keywords gist_trgm_ops);

-- 3. 검색 쿼리에서 띄어쓰기를 무시하기 위한 헬퍼 함수 (필요 시)
CREATE OR REPLACE FUNCTION public.strip_spaces(text) RETURNS text AS $$
  SELECT replace($1, ' ', '');
$$ LANGUAGE sql IMMUTABLE;
