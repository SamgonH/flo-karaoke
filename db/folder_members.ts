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
  const { data, error } = await (supabase.from('folder_members') as any)
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
  const { error } = await (supabase.from('folder_members') as any)
    .upsert({ 
      folder_id: folderId, 
      member_no: memberNo,
      role: 'MEMBER' // 초대로 들어오는 사람은 항상 팀원
    }, { onConflict: 'folder_id,member_no' })

  if (error) throw error
}

/**
 * 특정 사용자가 방장인지 확인합니다
 */
export const checkIsOwner = async (folderId: string, memberNo: string): Promise<boolean> => {
  const { data, error } = await (supabase.from('folder_members') as any)
    .select('role')
    .eq('folder_id', folderId)
    .eq('member_no', memberNo)
    .single()

  if (error) return false
  return data.role === 'OWNER'
}
