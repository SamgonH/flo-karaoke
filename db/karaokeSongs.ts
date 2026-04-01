import { supabase } from './client'
import type { Database } from './types/database'

export type KaraokeSongRow = Database['public']['Tables']['karaoke_songs']['Row']

/**
 * 곡명, 아티스트명, 키워드를 기준으로 곡을 검색합니다.
 * @param query 검색어 (예: "요루시카" 또는 "yorushika")
 */
export const searchKaraokeSongs = async (query: string): Promise<KaraokeSongRow[]> => {
  if (!query.trim()) return []

  const safeQuery = query.trim()

  const { data, error } = await supabase
    .from('karaoke_songs')
    .select('*')
    // 제목, 아티스트, 또는 검색용 키워드 칼럼에서 부분 일치 검색
    .or(`title.ilike.%${safeQuery}%,artist.ilike.%${safeQuery}%,search_keywords.ilike.%${safeQuery}%`)
    // 최근에 추가된 것부터, 혹은 인기 있는 순으로 가져올 수 있지만 일단 등록순으로 정렬
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('검색 중 오류 발생:', error)
    throw error
  }

  return data || []
}
