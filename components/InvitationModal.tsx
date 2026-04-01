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
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Panda&backgroundColor=f1f5f9',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat&backgroundColor=fef2f2',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dog&backgroundColor=ecfdf5',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Fox&backgroundColor=fff7ed',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rabbit&backgroundColor=f5f3ff',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Owl&backgroundColor=f0f9ff'
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
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(ANIMAL_CHARACTER_PRESETS[0])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 초기 아바타 설정
  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarUrl(ANIMAL_CHARACTER_PRESETS[0])
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
      // 1. 사용자 번호 확인 (Context에서 안 넘어올 경우 대비)
      const currentMemberNo = memberNo || localStorage.getItem('KARAOKE_MEMBER_NO') || ''
      if (!currentMemberNo) {
        alert('사용자 번호를 찾을 수 없습니다. 페이지를 새로고침 해주세요.')
        return
      }

      console.log('[Invitation] Processing join with memberNo:', currentMemberNo)

      // 2. 프로필 업데이트
      await updateProfile(currentMemberNo, nickname, selectedAvatarUrl)
      console.log('[Invitation] Profile updated')
      
      // 3. 폴더 참여
      await joinFolder(folderId, currentMemberNo)
      console.log('[Invitation] Join folder member success')
      
      alert(`'${folderName}' 폴더에 참여되었습니다! 🎉`)
      onJoined()
    } catch (err: any) {
      console.error('[Invitation] Join ERROR:', err)
      // 정확한 원인 파악을 위해 에러 상세 노출
      alert(`참여 실패 사유: ${JSON.stringify(err.message || err)}`)
      
      if (err.message?.includes('duplicate key')) {
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
            {ANIMAL_CHARACTER_PRESETS.map((url, idx) => (
              <button
                key={idx}
                onClick={() => handleAvatarSelect(url)}
                className={`flex flex-col items-center gap-[6px] shrink-0 transition-transform active:scale-95 ${selectedAvatarUrl === url ? 'scale-105' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
              >
                <div className={`size-[60px] rounded-[22px] overflow-hidden border-[3px] transition-all ${selectedAvatarUrl === url ? 'border-[var(--color-static-accent)] shadow-lg' : 'border-transparent bg-[var(--color-surface-secondary)]'}`}>
                  <img src={url} alt={`Pet ${idx}`} className="w-full h-full object-cover" />
                </div>
                <DetailText className={`!text-[10px] font-bold ${selectedAvatarUrl === url ? 'text-[var(--color-static-accent)]' : 'text-transparent'}`}>PET</DetailText>
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
            className="w-full !rounded-[22px] !h-[60px] !text-[18px] font-black shadow-xl bg-gradient-to-r from-[var(--color-static-accent)] to-[#8E2DE2] text-white border-0 hover:brightness-110 active:scale-[0.98] transition-all"
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
