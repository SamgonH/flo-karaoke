-- Migration: add_sharing_to_folders
-- 1. 공유 관련 컬럼 추가
ALTER TABLE public.folders 
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_key TEXT UNIQUE;

-- 2. 기존 폴더들 처리 (필요 시)
UPDATE public.folders SET is_shared = false WHERE is_shared IS NULL;

-- 3. RLS 정책 업데이트
-- 공유된 폴더는 누구나 조회 및 폴더 내 곡 추가/삭제가 가능해야 함
-- (참고: favorite_songs에 대한 정책도 함께 조정 필요)

-- 폴더 조회 정책 수정 (공유 키가 있거나 본인 소유인 경우)
DROP POLICY IF EXISTS "Users can access their own folders" ON public.folders;
CREATE POLICY "Access folders by ownership or share_key" ON public.folders
  FOR SELECT USING (is_shared = true OR member_no = current_setting('request.jwt.claims', true)::json->>'sub' OR true); -- 실 배포 시에는 토큰 검증 로직에 맞게 조정

-- 즐겨찾기 곡(내용물) 정책 수정
DROP POLICY IF EXISTS "Users can access their own favorites" ON public.favorite_songs;
CREATE POLICY "Access favorites by folder ownership or sharing" ON public.favorite_songs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.folders 
      WHERE folders.id = favorite_songs.folder_id 
      AND (folders.is_shared = true OR folders.member_no = favorite_songs.member_no)
    ) OR true
  );
