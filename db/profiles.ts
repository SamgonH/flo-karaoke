import { supabase } from './client'

export interface Profile {
  member_no: string
  nickname: string
  avatar_url: string | null
}

export const getProfile = async (memberNo: string): Promise<Profile | null> => {
  const { data, error } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('member_no', memberNo)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const updateProfile = async (memberNo: string, nickname: string, avatarUrl?: string): Promise<Profile> => {
  const { data, error } = await (supabase.from('profiles') as any)
    .upsert({ member_no: memberNo, nickname, avatar_url: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${memberNo}` })
    .select()
    .single()

  if (error) throw error
  return data
}
