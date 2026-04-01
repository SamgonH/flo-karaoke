import { supabase } from './client'
import type { Database } from './types/database'

export type FolderRow = Database['public']['Tables']['folders']['Row']
export type FolderInsert = Database['public']['Tables']['folders']['Insert']

/**
 * 특정 사용자의 폴더 목록을 가져옵니다.
 * @param memberNo FLO 사용자 번호
 */
export const getFolders = async (memberNo: string): Promise<FolderRow[]> => {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('member_no', memberNo)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('폴더 목록 로드 실패:', error)
    throw error
  }
  return data || []
}

/**
 * 새 폴더를 생성합니다.
 * @param name 폴더 이름
 * @param memberNo FLO 사용자 번호
 * @param isShared 공동 편집 여부 (F6)
 */
export const createFolder = async (name: string, memberNo: string, isShared: boolean = false): Promise<FolderRow> => {
  // 공유용 고유 키 생성 (9자리 랜덤 문자열)
  const shareKey = isShared ? Math.random().toString(36).substring(2, 11) : null

  const { data, error } = await (supabase.from('folders') as any)
    .insert({ 
      name, 
      member_no: memberNo,
      is_shared: isShared,
      share_key: shareKey
    })
    .select()
    .single()

  if (error) {
    console.error('폴더 생성 실패:', error)
    throw error
  }
  
  // 방장으로 등록
  await (supabase.from('folder_members') as any).insert({
    folder_id: (data as any).id,
    member_no: memberNo,
    role: 'OWNER'
  })

  return data as FolderRow
}

/**
 * 폴더 내용을 업데이트합니다 (예: 북마크 담기 등 - 실제로는 favorite_songs 테이블 이용)
 * 여기서는 폴더 자체의 정보(이름 등) 수정 시 사용
 */
export const updateFolder = async (folderId: string, updates: Partial<FolderRow>): Promise<void> => {
  const { error } = await (supabase.from('folders') as any)
    .update(updates)
    .eq('id', folderId)

  if (error) throw error
}

/**
 * 폴더의 커버 이미지를 업데이트합니다
 */
export const updateFolderCover = async (folderId: string, coverUrl: string): Promise<void> => {
  const { error } = await (supabase.from('folders') as any)
    .update({ cover_url: coverUrl })
    .eq('id', folderId)

  if (error) throw error
}

export const updateInvitationMessage = async (folderId: string, message: string): Promise<void> => {
  const { error } = await (supabase.from('folders') as any)
    .update({ invitation_message: message })
    .eq('id', folderId)

  if (error) throw error
}

/**
 * 폴더 이름을 변경합니다
 */
export const renameFolder = async (folderId: string, newName: string): Promise<void> => {
  const { error } = await (supabase.from('folders') as any)
    .update({ name: newName })
    .eq('id', folderId)

  if (error) throw error
}

/**
 * 공유 키를 사용하여 폴더 정보를 가져옵니다. (F6)
 * @param shareKey 폴더 공유 키
 */
export const getFolderByShareKey = async (shareKey: string): Promise<FolderRow | null> => {
  const { data, error } = await (supabase.from('folders') as any)
    .select('*')
    .eq('share_key', shareKey)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // 결과 없음
    console.error('공유 폴더 조회 실패:', error)
    throw error
  }
  return data
}

/**
 * 폴더의 공유 상태를 변경합니다.
 */
export const updateFolderSharing = async (folderId: string, isShared: boolean): Promise<string | null> => {
  const shareKey = isShared ? Math.random().toString(36).substring(2, 11) : null
  
  const { error } = await supabase
    .from('folders')
    .update({ is_shared: isShared, share_key: shareKey })
    .eq('id', folderId)

  if (error) {
    console.error('공유 상태 변경 실패:', error)
    throw error
  }
  return shareKey
}

/**
 * 폴더를 삭제합니다. (하위 즐겨찾기 곡은 Cascade Delete로 자동 삭제)
 * @param folderId 폴더 ID
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)

  if (error) {
    console.error('폴더 삭제 실패:', error)
    throw error
  }
}
