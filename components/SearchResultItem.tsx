'use client'

import { BodyText, DetailText } from './ui/Text'
import { Card } from './ui/Card'
import Image from 'next/image'
import { APP_SCHEME } from '@/utils/webview'

export interface Song {
  id: string
  title: string
  artist: string
  coverUrl: string
  tjNumber?: string
  kyNumber?: string
  floTrackId?: string
}

interface SearchResultItemProps {
  song: Song
  onClick?: (song: Song) => void
}

export function SearchResultItem({ song, onClick }: SearchResultItemProps) {
  
  const handlePlayAppScheme = () => {
    if (song.floTrackId) {
      window.location.href = `${APP_SCHEME.BASE}://play/track?ids=${song.floTrackId}&repeat=off&shuffle=off&autoPlay=true`
    }
  }

  const handleClick = () => {
    // 앱 재생 스킴 호출
    handlePlayAppScheme()
    // 부모 onClick 이벤트 (선택사항)
    if (onClick) onClick(song)
  }

  return (
    <Card 
      className="flex flex-row items-center p-[16px] gap-[16px] hover:bg-[var(--color-surface-primary)] active:bg-[var(--color-surface-primary)] border-[var(--color-border)] transition-colors border-0 border-b last:border-b-0 rounded-none shadow-none cursor-pointer" 
      padding="none" 
      onClick={handleClick}
    >
      {/* 앨범 커버 */}
      <div className="relative size-[60px] rounded-[8px] overflow-hidden flex-shrink-0 bg-[var(--color-surface-quaternary)]">
        {song.coverUrl ? (
          <Image 
            src={song.coverUrl} 
            alt={`${song.title} 앨범 커버`} 
            fill 
            className="object-cover"
            unoptimized // 임시 외부 URL이므로 unoptimized 사용
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="size-[24px] text-[var(--color-icon-disabled)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        )}
        
        {/* 재생 아이콘 오버레이 */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
           <svg className="size-[24px] text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M8 5v14l11-7z" />
           </svg>
        </div>
      </div>

      {/* 곡 정보 */}
      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <BodyText className="truncate" size={22}>
          {song.title}
        </BodyText>
        <DetailText className="truncate mt-[4px]" color="text-[var(--color-text-secondary)]">
          {song.artist}
        </DetailText>
      </div>

      {/* 노래방 번호 */}
      <div className="flex flex-col items-end flex-shrink-0 gap-[4px] ml-[8px]">
        {song.tjNumber && (
          <div className="flex items-center gap-[6px]">
            <span className="text-[10px] font-bold px-[6px] py-[2px] rounded-[4px] bg-[#ff334b] text-white">TJ</span>
            <span className="text-[16px] font-bold text-[var(--color-text-primary)] tracking-tight">{song.tjNumber}</span>
          </div>
        )}
        {song.kyNumber && (
          <div className="flex items-center gap-[6px]">
            <span className="text-[10px] font-bold px-[6px] py-[2px] rounded-[4px] bg-[#028af4] text-white">KY</span>
            <span className="text-[16px] font-bold text-[var(--color-text-primary)] tracking-tight">{song.kyNumber}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
