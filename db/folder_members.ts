import { supabase } from './client'
import { type Profile } from './profiles'

export type FolderRole = 'OWNER' | 'MEMBER'

export interface FolderMemberRow {
  id: string
  folder_id: string
  member_no: string
  role: FolderRole
  joined_at: string
}

export interface FolderMemberDetail extends FolderMemberRow {
  profiles: Profile
}

/**
 * 폴더의 모든 멤버 목록을 가져옵니다 (프로필 포함)
 */
export const getFolderMembers = async (folderId: string): Promise<FolderMemberDetail[]> => {
  const { data, error } = await supabase
    .from('folder_members')
    .select(`
      *,
      profiles (
        member_no,
        nickname,
        avatar_url
      )
    `)
    .eq('folder_id', folderId)
    .order('joined_at', { ascending: true })

  if (error) throw error
  return (data || []) as any
}

/**
 * 폴더에 새 멤버를 추가합니다 (초대 수락)
 */
export const joinFolder = async (folderId: string, memberNo: string): Promise<void> => {
  // 1. 이미 멤버인지, 그리고 권한이 무엇인지 확인
  const { data: existingMember } = await supabase
    .from('folder_members')
    .select('role')
    .eq('folder_id', folderId)
    .eq('member_no', memberNo)
    .maybeSingle()

  // 2. 방장(OWNER)인 경우 절대로 강등시키지 않음
  if (existingMember?.role === 'OWNER') {
    console.log('[joinFolder] Already owner, skipping role overwrite.')
    return
  }

  // 3. 멤버가 아니거나 회원인 경우 MEMBER로 가입/갱신
  const { error } = await supabase
    .from('folder_members')
    .upsert({ 
      folder_id: folderId, 
      member_no: memberNo,
      role: 'MEMBER' 
    }, { onConflict: 'folder_id,member_no' })

  if (error) throw error
}

/**
 * 특정 사용자가 방장인지 확인합니다
 */
export const checkIsOwner = async (folderId: string, memberNo: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('folder_members')
    .select('role')
    .eq('folder_id', folderId)
    .eq('member_no', memberNo)
    .single()

  if (error) return false
  return data.role === 'OWNER'
}
