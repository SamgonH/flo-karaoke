import { supabase } from './client'
import type { Database } from './types/database'

export type FloReel = Database['public']['Tables']['flo_reels']['Row']
export type FloReelInsert = Database['public']['Tables']['flo_reels']['Insert']

// 릴스 피드 조회 (profiles와 karaoke_songs 조인)
export const getReelsFeed = async () => {
  const { data, error } = await supabase
    .from('flo_reels')
    .select(`
      *,
      profiles (*),
      karaoke_songs (*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// 릴스 업로드
export const uploadReel = async (insertData: FloReelInsert) => {
  const { data, error } = await supabase
    .from('flo_reels')
    .insert(insertData)
    .select()
    .single()
    
  if (error) throw error
  return data
}
