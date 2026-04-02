import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Heading, BodyText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    if (isOpen) {
      // 카메라 권한 요청 및 비디오 스트림 시작
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          stream = mediaStream
          setHasPermission(true)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            // iOS 등에서 인라인 재생을 위해
            videoRef.current.setAttribute('playsinline', 'true')
            videoRef.current.play().catch(console.error)
          }
        })
        .catch((err) => {
          console.error("카메라 접근 오류:", err)
          setHasPermission(false)
        })
    }

    return () => {
      // 모달 닫힐 때 카메라 끄기
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 sm:p-[20px] backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      
      <Card className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[420px] bg-[#121212] sm:rounded-[40px] overflow-hidden flex flex-col p-[24px] animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-[24px] z-10">
          <button 
            onClick={onClose}
            className="size-[44px] flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
          >
            <svg className="size-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Heading level={2} className="!text-[20px] text-white">QR 스캔</Heading>
          <div className="size-[44px]" />
        </div>

        {/* Camera Feed Area */}
        <div className="relative flex-1 sm:min-h-[400px] w-full bg-black rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col items-center justify-center">
          
          {hasPermission === false && (
            <div className="text-center p-6 text-white/70">
              <svg className="size-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <BodyText>카메라 접근 권한이 없습니다.<br/>브라우저 설정에서 권한을 허용해주세요.</BodyText>
            </div>
          )}

          {hasPermission !== false && (
            <>
              {/* Video Element */}
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay 
                playsInline 
                muted
              />

              {/* Scanning Overlay UI */}
              <div className="absolute inset-0 z-10 custom-scanner-overlay" />
              
              {/* Scan Frame */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[240px] border-2 border-white/30 rounded-[24px]">
                {/* 4 corners */}
                <div className="absolute top-[-2px] left-[-2px] size-[30px] border-t-4 border-l-4 border-[var(--color-static-accent)] rounded-tl-[24px]" />
                <div className="absolute top-[-2px] right-[-2px] size-[30px] border-t-4 border-r-4 border-[var(--color-static-accent)] rounded-tr-[24px]" />
                <div className="absolute bottom-[-2px] left-[-2px] size-[30px] border-b-4 border-l-4 border-[var(--color-static-accent)] rounded-bl-[24px]" />
                <div className="absolute bottom-[-2px] right-[-2px] size-[30px] border-b-4 border-r-4 border-[var(--color-static-accent)] rounded-br-[24px]" />
                
                {/* Laser animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--color-static-accent)] shadow-[0_0_15px_var(--color-static-accent)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>

              {/* Guide Text inside Camera */}
              <div className="absolute bottom-[40px] left-0 right-0 text-center px-[20px]">
                <div className="inline-block bg-black/50 backdrop-blur-md px-[16px] py-[8px] rounded-full">
                  <span className="text-white font-bold text-[14px] drop-shadow-md">
                    기기 화면의 QR 코드를 사각형 안에 맞춰주세요
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="mt-[24px] z-10 flex gap-[12px]">
          <Button 
            onClick={onClose}
            className="w-full !h-[60px] !rounded-[20px] bg-white/10 text-white border border-white/20 hover:bg-white/20 active:bg-white/30 transition-all font-bold !text-[16px]"
          >
            취소
          </Button>
        </div>
      </Card>
      
      {/* Scanner CSS Additions */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scanner-overlay {
          background: radial-gradient(circle at center, transparent 120px, rgba(0,0,0,0.6) 120px);
        }
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  )
}
