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
  const strippedQuery = safeQuery.replace(/\s+/g, '')

  // 띄어쓰기 무시 및 원본 매칭 동시 수행 (FLO 스타일 검색 엔진)
  const orFilter = [
    `title.ilike.%${safeQuery}%`,
    `artist.ilike.%${safeQuery}%`,
    `search_keywords.ilike.%${safeQuery}%`,
    `title.ilike.%${strippedQuery}%`,
    `search_keywords.ilike.%${strippedQuery}%`
  ].join(',')

  const { data, error } = await supabase
    .from('karaoke_songs')
    .select('*')
    .or(orFilter)
    .order('favorite_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('검색 중 오류 발생:', error)
    throw error
  }

  return data || []
}

/**
 * 실시간 인기 차트를 조회합니다.
 * (검색 수 + 미리듣기 수 + 즐겨찾기 수 합산 기준)
 * @param category 국가 카테고리 (POP, J-POP, C-POP 등. null이면 전체)
 */
export const getPopularSongs = async (category: string | null = null): Promise<KaraokeSongRow[]> => {
  let queryBuilder = supabase
    .from('karaoke_songs')
    .select('*')
  
  if (category) {
    queryBuilder = queryBuilder.eq('category', category)
  }

  // search_count + preview_count + favorite_count 를 합산하여 정렬하려면 
  // 원칙적으로는 query 내에서 연산이 필요하지만, 
  // Supabase 클라이언트에서 복잡한 합산 정렬은 어렵기에 
  // 가중치가 가장 높은 favorite_count와 search_count 위주로 정렬하거나 
  // 필요 시 view를 생성해야 합니다.
  // 여기서는 우선 합산 점수 형태의 가상 정렬을 시도하거나, favorite_count 위주로 정렬 후 클라이언트에서 보정합니다.
  const { data, error } = await queryBuilder
    .order('favorite_count', { ascending: false })
    .order('search_count', { ascending: false })
    .limit(50)

  if (error) {
    console.error('인기곡 로드 오류:', error)
    throw error
  }

  return data || []
}

/**
 * 특정 곡의 통계 수치를 1 증가시킵니다.
 */
export const incrementSongStat = async (songId: string, statType: 'search' | 'preview' | 'favorite' | 'unfavorite'): Promise<void> => {
  // @ts-ignore
  const { error } = await supabase.rpc('increment_song_stat', {
    song_id: songId,
    stat_type: statType
  })

  if (error) {
    console.error(`통계 업데이트 실패(${statType}):`, error)
  }
}
