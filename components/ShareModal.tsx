import { useState } from 'react'
import { Heading, BodyText, DetailText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { updateInvitationMessage } from '@/db/folders'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  folderId: string
  folderName: string
  shareUrl: string
}

const SHARE_APPS = [
  { id: 'kakao', name: '카카오톡', icon: '🟡', bgColor: '#FEE500' },
  { id: 'line', name: '라인', icon: '🟢', bgColor: '#06C755' },
  { id: 'instagram', name: '인스타', icon: '📸', bgColor: '#E1306C' },
  { id: 'message', name: '메시지', icon: '💬', bgColor: '#34C759' },
  { id: 'facebook', name: '페이스북', icon: '🔵', bgColor: '#1877F2' },
  { id: 'more', name: '더보기', icon: '➕', bgColor: '#8E8E93' },
]

export function ShareModal({
  isOpen,
  onClose,
  folderId,
  folderName,
  shareUrl
}: ShareModalProps) {
  const defaultMessage = `나랑 같이 '${folderName}' 노래방 리스트 만들래? 내가 좋아하는 곡들 다 모아놨어! 🎤✨`
  const [message, setMessage] = useState(defaultMessage)

  if (!isOpen) return null

  const handleShare = async () => {
    try {
      // 1. DB에 문구 저장
      await updateInvitationMessage(folderId, message)
      
      const shareData = {
        title: `'${folderName}' 노래방 초대`,
        text: message,
        url: shareUrl
      }

      // 2. 네이티브 공유 API 시도 (모바일 등 브라우저 지원 시)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // 3. 지원하지 않을 경우 클립보드 복사 폴백
        await navigator.clipboard.writeText(`${message}\n\n초대 링크: ${shareUrl}`)
        alert('초대 링크가 복사되었습니다! 원하는 곳에 붙여넣어 주세요. 📋')
      }
      onClose()
    } catch (err) {
      console.error('공유 실패:', err)
      if (err instanceof Error && err.name !== 'AbortError') {
        alert('공유 중 오류가 발생했습니다.')
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('링크만 깔끔하게 복사되었습니다! 🔗')
    } catch (err) {
      alert('링크 복사에 실패했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 sm:items-center p-[20px]">
      <div className="absolute inset-0" onClick={onClose} />
      
      <Card className="relative w-full max-w-[400px] bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col gap-[24px] p-[28px] animate-in slide-in-from-bottom duration-300">
        <div className="flex flex-col items-center gap-[6px]">
          <div className="w-[40px] h-[4px] bg-[var(--color-border)] rounded-full mb-[10px] sm:hidden" />
          <Heading level={2} className="!text-[22px]">친구 초대하기! 💌</Heading>
          <DetailText color="text-[var(--color-text-tertiary)]">공유할 메시지를 자유롭게 적어보세요.</DetailText>
        </div>

        {/* Message Input Area */}
        <div className="flex flex-col gap-[12px]">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-[120px] bg-[var(--color-surface-secondary)] border-2 border-[var(--color-border)] rounded-[24px] p-[20px] text-[15px] font-medium resize-none focus:outline-none focus:border-[var(--color-static-accent)] focus:bg-white transition-all shadow-inner"
            placeholder="친구에게 보낼 따뜻한 메시지를 입력하세요..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-[12px] mt-[10px]">
          <button 
            onClick={handleShare} 
            className="w-full h-[60px] rounded-[22px] text-[18px] font-extrabold shadow-xl bg-gradient-to-r from-[var(--color-static-accent)] to-[#8E2DE2] text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-[8px]"
          >
            <svg className="size-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            초대하기
          </button>
          <button 
            onClick={onClose}
            className="w-full py-[8px] text-[14px] text-[var(--color-text-tertiary)] font-bold hover:text-[var(--color-text-primary)] transition-colors"
          >
            취소
          </button>
        </div>
      </Card>
    </div>
  )
}
