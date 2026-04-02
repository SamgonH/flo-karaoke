-- Migration: fix_orphan_members_and_relation
-- 1. profiles 테이블에 존재하지 않는 member_no를 위한 기본 프로필 생성
INSERT INTO public.profiles (member_no, nickname, avatar_url)
SELECT DISTINCT member_no, '비회원', 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ghost'
FROM public.folder_members
WHERE member_no NOT IN (SELECT member_no FROM public.profiles)
ON CONFLICT (member_no) DO NOTHING;

-- 2. 외래키 관계 추가
ALTER TABLE public.folder_members
DROP CONSTRAINT IF EXISTS folder_members_member_no_fkey,
ADD CONSTRAINT folder_members_member_no_fkey
FOREIGN KEY (member_no)
REFERENCES public.profiles(member_no)
ON DELETE CASCADE;
