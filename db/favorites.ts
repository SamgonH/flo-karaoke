import { supabase } from './client'
import type { Database } from './types/database'

export type FavoriteSongRow = Database['public']['Tables']['favorite_songs']['Row']
export type FavoriteSongInsert = Database['public']['Tables']['favorite_songs']['Insert']

/**
 * 특정 폴더에 저장된 즐겨찾기 곡 목록을 가져옵니다.
 * @param folderId 폴더 ID
 */
export const getFavoriteSongsByFolder = async (folderId: string): Promise<FavoriteSongRow[]> => {
  const { data, error } = await supabase
    .from('favorite_songs')
    .select('*, karaoke_songs(*)') // 곡 상세 정보 동시 조회
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('즐겨찾기 목록 로드 실패:', error)
    throw error
  }
  return data || []
}

/**
 * 특정 사용자의 모든 즐겨찾기 곡 목록을 가져옵니다.
 * @param memberNo FLO 사용자 번호
 */
export const getFavoriteSongsByUser = async (memberNo: string): Promise<FavoriteSongRow[]> => {
  const { data, error } = await supabase
    .from('favorite_songs')
    .select('*, karaoke_songs(*)')
    .eq('member_no', memberNo)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('전체 즐겨찾기 로드 실패:', error)
    throw error
  }
  return data || []
}

/**
 * 곡을 즐겨찾기에 추가합니다.
 * @param folderId 저장할 폴더 ID
 * @param songId 곡 ID
 * @param memberNo FLO 사용자 번호
 */
export const addFavoriteSong = async (folderId: string, songId: string, memberNo: string): Promise<FavoriteSongRow> => {
  const { data, error } = await supabase
    .from('favorite_songs')
    .insert({ folder_id: folderId, song_id: songId, member_no: memberNo } as FavoriteSongInsert)
    .select()
    .single()

  if (error) {
    console.error('즐겨찾기 추가 실패:', error)
    throw error
  }
  return data
}

/**
 * 즐겨찾기에서 곡을 삭제합니다.
 * @param favoriteId 즐겨찾기 ID
 */
export const removeFavoriteSong = async (favoriteId: string): Promise<void> => {
  const { error } = await supabase
    .from('favorite_songs')
    .delete()
    .eq('id', favoriteId)

  if (error) {
    console.error('즐겨찾기 삭제 실패:', error)
    throw error
  }
}

/**
 * 어떤 폴더에 해당 곡이 이미 들어있는지 확인합니다.
 * @param songId 곡 ID
 * @param memberNo FLO 사용자 번호
 */
export const checkIsFavorite = async (songId: string, memberNo: string): Promise<FavoriteSongRow | null> => {
  const { data, error } = await supabase
    .from('favorite_songs')
    .select('*')
    .eq('song_id', songId)
    .eq('member_no', memberNo)
    .maybeSingle()

  if (error) {
    console.error('즐겨찾기 확인 실패:', error)
    return null
  }
  return data
}
