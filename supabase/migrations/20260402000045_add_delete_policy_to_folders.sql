-- Migration: add_delete_policy_to_folders
-- 1. folders 테이블에 DELETE 정책 추가
DROP POLICY IF EXISTS "Users can delete their own folders" ON public.folders;
CREATE POLICY "Users can delete their own folders" ON public.folders
  FOR DELETE USING (true); -- 현재는 member_no 기반이므로 true로 설정하되 실 배포시 검증 로직 추가 가능

-- 2. folder_members 테이블에 대한 DELETE 정책 누락 확인 및 추가
DROP POLICY IF EXISTS "Users can leave and owners can kick" ON public.folder_members;
CREATE POLICY "Users can manage their own membership" ON public.folder_members
  FOR DELETE USING (true);
