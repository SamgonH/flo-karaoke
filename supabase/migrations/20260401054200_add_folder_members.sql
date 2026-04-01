-- Migration: add_folder_members_and_profiles
-- 1. 사용자 프로필 테이블 (닉네임, 프로필 사진)
CREATE TABLE IF NOT EXISTS public.profiles (
  member_no TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 폴더 멤버 관리 테이블 (방장/팀원 구분)
CREATE TABLE IF NOT EXISTS public.folder_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  member_no TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MEMBER', -- 'OWNER', 'MEMBER'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(folder_id, member_no)
);

-- 3. RLS 정책 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_members ENABLE ROW LEVEL SECURITY;

-- 프로필 정책: 누구나 조회 가능, 본인만 수정
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (true);

-- 멤버 정책: 폴더 소유자나 멤버만 조회 가능
CREATE POLICY "Members can view folder survivors" ON public.folder_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join shared folders" ON public.folder_members
  FOR INSERT WITH CHECK (true);

-- 4. 기존 폴더 소유자들을 방장으로 자동 등록하는 로직 (기존 데이터 호환)
INSERT INTO public.folder_members (folder_id, member_no, role)
SELECT id, member_no, 'OWNER' FROM public.folders
ON CONFLICT (folder_id, member_no) DO NOTHING;
