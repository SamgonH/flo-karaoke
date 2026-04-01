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

  const handleShare = async (appName: string) => {
    try {
      // 1. DB에 문구 저장
      await updateInvitationMessage(folderId, message)
      
      // 2. 클립보드 복사 (실제 SNS 연동 전 폴백)
      await navigator.clipboard.writeText(`${message}\n\n초대 링크: ${shareUrl}`)
      
      alert(`'${appName}'(으)로 초대 문구가 저장 및 복사되었습니다! 🎉`)
      onClose()
    } catch (err) {
      console.error('초대 메시지 저장 실패:', err)
      alert('초대 메시지 저장 중 오류가 발생했습니다.')
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
        <div className="flex flex-col gap-[10px]">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-[100px] bg-[var(--color-surface-secondary)] border-2 border-[var(--color-border)] rounded-[20px] p-[16px] text-[15px] resize-none focus:outline-none focus:border-[var(--color-static-accent)] transition-all"
            placeholder="메시지를 입력하세요..."
          />
          <div className="p-[12px] bg-[var(--color-surface-tertiary)] rounded-[14px] border border-[var(--color-border)]">
            <DetailText className="truncate text-[var(--color-text-tertiary)] select-none">
              🔗 {shareUrl}
            </DetailText>
          </div>
        </div>

        {/* Share Apps Horizontal Scroll */}
        <div className="flex flex-col gap-[12px]">
          <BodyText className="font-bold text-[14px] pl-[4px]">공유할 앱 선택</BodyText>
          <div className="flex gap-[16px] overflow-x-auto scrollbar-hide py-[8px] -mx-[4px] px-[4px]">
            {SHARE_APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => handleShare(app.name)}
                className="flex flex-col items-center gap-[8px] shrink-0 active:scale-90 transition-transform"
              >
                <div 
                  className="size-[56px] rounded-[18px] flex items-center justify-center text-[24px] shadow-sm"
                  style={{ backgroundColor: app.bgColor }}
                >
                  {app.icon}
                </div>
                <DetailText className="!text-[12px] font-medium text-[var(--color-text-secondary)]">{app.name}</DetailText>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => handleShare('전체')} className="w-full !h-[56px] !rounded-[18px] !text-[17px] font-bold">
          초대 메시지 보내기
        </Button>
      </Card>
    </div>
  )
}
