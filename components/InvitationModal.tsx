'use client'

import { useState, useEffect, useRef } from 'react'
import { Heading, BodyText, DetailText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { updateProfile } from '@/db/profiles'
import { joinFolder } from '@/db/folder_members'

interface InvitationModalProps {
  memberNo: string
  folderName: string
  folderId: string
  invitationMessage?: string // 초대한 사람의 메시지 추가
  isOpen: boolean
  onClose: () => void
  onJoined: () => void
}

const ANIMAL_CHARACTER_PRESETS = [
  { url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Panda&backgroundColor=f1f5f9', name: '팬더' },
  { url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat&backgroundColor=fef2f2', name: '야옹이' },
  { url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dog&backgroundColor=ecfdf5', name: '댕댕이' },
  { url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fox&backgroundColor=fff7ed', name: '여우' },
  { url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rabbit&backgroundColor=f5f3ff', name: '토끼' },
  { url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Owl&backgroundColor=f0f9ff', name: '부엉이' }
]

export function InvitationModal({
  memberNo,
  folderName,
  folderId,
  invitationMessage,
  isOpen,
  onClose,
  onJoined
}: InvitationModalProps) {
  const [nickname, setNickname] = useState('')
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(ANIMAL_CHARACTER_PRESETS[0].url)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 초기 아바타 설정
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarUrl(ANIMAL_CHARACTER_PRESETS[0].url)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAvatarSelect = (url: string) => {
    setSelectedAvatarUrl(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleJoin = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요!')
      return
    }

    setIsLoading(true)
    try {
      const currentMemberNo = memberNo || localStorage.getItem('KARAOKE_MEMBER_NO') || ''
      if (!currentMemberNo) {
        throw new Error('사용자 세션이 만료되었습니다. 페이지를 새로고침 해주세요.')
      }

      // 1. 프로필 업데이트 (신규 참여자일 경우 자동 생성)
      await updateProfile(currentMemberNo, nickname.trim(), selectedAvatarUrl)
      
      // 2. 폴더 참여 (방장 강등 방지 로직 포함된 joinFolder 호출)
      await joinFolder(folderId, currentMemberNo)
      
      alert(`'${folderName}' 노래방에 오신 걸 환영합니다! 🎤✨`)
      onJoined()
    } catch (err: any) {
      console.error('[Invitation] Join ERROR:', err)
      const errorMsg = err.message || '알 수 없는 오류가 발생했습니다.'
      
      if (errorMsg.includes('PGRST116') || errorMsg.includes('not found')) {
        alert('존재하지 않거나 삭제된 폴더입니다. 😢')
      } else {
        alert(`참여 중 오류가 생겼어요: ${errorMsg}`)
      }
      
      // 이미 멤버인 경우 오류가 나더라도 성공으로 간주하여 진입 허용
      if (errorMsg.includes('duplicate key')) {
        onJoined()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-[20px] bg-black/75 backdrop-blur-md animate-in fade-in duration-500">
      <Card className="w-full max-w-[420px] flex flex-col gap-[20px] p-[28px] bg-white rounded-[40px] shadow-2xl relative overflow-hidden ring-1 ring-black/5">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-[12px] bg-gradient-to-r from-[var(--color-static-accent)] to-[#8E2DE2]" />
        
        <div className="flex flex-col items-center text-center gap-[12px] mt-[10px]">
          {/* Main Avatar Preview */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="size-[130px] rounded-[36px] bg-[var(--color-surface-tertiary)] border-[6px] border-white overflow-hidden shadow-[0_10px_35px_-5px_rgba(0,0,0,0.2)] mb-[4px] transform group-hover:rotate-3 transition-transform">
              <img 
                src={selectedAvatarUrl} 
                alt="Profile Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 size-[36px] bg-[var(--color-static-accent)] rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-lg">
              <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col gap-[12px] mt-[8px]">
            <div className="relative p-[20px] bg-[var(--color-surface-secondary)] rounded-[24px] border-2 border-[var(--color-border)] italic shadow-inner">
               <div className="absolute -top-[12px] left-[20px] bg-white px-[8px] text-[18px]">"</div>
               <BodyText className="text-[var(--color-text-primary)] !text-[16px] font-medium leading-relaxed">
                 {invitationMessage || `나랑 같이 '${folderName}' 노래방 리스트 만들래? 내가 좋아하는 곡들 다 모아놨어! 🎤✨`}
               </BodyText>
               <div className="absolute -bottom-[20px] right-[20px] bg-white px-[8px] text-[18px]">"</div>
            </div>
            
            <div className="flex flex-col gap-[4px] mt-[12px]">
              <Heading level={2} className="!text-[22px] font-black tracking-tight italic">JOIN THE CREW! 🎤</Heading>
              <DetailText className="text-[var(--color-text-secondary)] !text-[14px]">
                함께하는 노래방 <span className="font-bold text-[var(--color-static-accent)]">'{folderName}'</span> 멤버가 되어주세요!
              </DetailText>
            </div>
          </div>
        </div>

        {/* Character Selection */}
        <div className="flex flex-col gap-[10px]">
          <DetailText className="ml-[4px] font-extrabold text-[var(--color-text-tertiary)] !text-[11px] uppercase tracking-widest">🐾 Pick a Character</DetailText>
          <div className="flex gap-[12px] overflow-x-auto scrollbar-hide py-[6px] px-[2px]">
            {/* Camera Button First */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-[6px] shrink-0 group"
            >
              <div className="size-[60px] rounded-[22px] bg-[var(--color-surface-secondary)] border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-[24px] group-hover:bg-[var(--color-surface-tertiary)] group-hover:border-[var(--color-static-accent)] transition-all">
                <svg className="size-[26px] text-[var(--color-text-tertiary)] group-hover:text-[var(--color-static-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <DetailText className="!text-[10px] font-bold">내 사진</DetailText>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </button>

            {/* Animal Presets */}
            {ANIMAL_CHARACTER_PRESETS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleAvatarSelect(item.url)}
                className={`flex flex-col items-center gap-[6px] shrink-0 transition-transform active:scale-95 ${selectedAvatarUrl === item.url ? 'scale-105' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
              >
                <div className={`size-[60px] rounded-[22px] overflow-hidden border-[3px] transition-all ${selectedAvatarUrl === item.url ? 'border-[var(--color-static-accent)] shadow-lg' : 'border-transparent bg-[var(--color-surface-secondary)]'}`}>
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <DetailText className={`!text-[10px] font-bold ${selectedAvatarUrl === item.url ? 'text-[var(--color-static-accent)]' : 'text-transparent'}`}>{item.name}</DetailText>
              </button>
            ))}
          </div>
        </div>

        {/* Nickname Section */}
        <div className="flex flex-col gap-[8px]">
          <DetailText className="ml-[4px] font-extrabold text-[var(--color-text-tertiary)] !text-[11px] uppercase tracking-widest">Username</DetailText>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="노래방에서 불릴 닉네임"
            disabled={isLoading}
            className="w-full bg-[var(--color-surface-secondary)] border-2 border-transparent rounded-[20px] px-[20px] py-[14px] text-[15px] font-bold focus:outline-none focus:border-[var(--color-static-accent)] focus:bg-white transition-all shadow-sm"
            maxLength={10}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[12px] mt-[4px]">
          <Button 
            onClick={handleJoin} 
            loading={isLoading}
            disabled={!nickname.trim() || isLoading}
            className={`w-full !rounded-[22px] !h-[60px] !text-[18px] font-black shadow-xl transition-all duration-300 ${
              !nickname.trim() 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-[var(--color-static-accent)] to-[#8E2DE2] text-white hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {isLoading ? '연결 중...' : '참여하기'}
          </Button>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-[4px] text-[13px] text-[var(--color-text-tertiary)] font-bold hover:text-[var(--color-text-primary)] transition-colors"
          >
            다음에 할게요
          </button>
        </div>
      </Card>
    </div>
  )
}
