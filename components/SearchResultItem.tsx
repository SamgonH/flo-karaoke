'use client'

import { BodyText, DetailText } from './ui/Text'
import { Card } from './ui/Card'
import Image from 'next/image'
import { APP_SCHEME } from '@/utils/webview'
import { logAction, logMixpanel } from '@/utils/floLog'
import { incrementSongStat } from '@/db/karaokeSongs'
import { DynamicAlbumCover } from './ui/DynamicAlbumCover'

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
  isFavorite?: boolean
  isPlaying?: boolean
  onPlay?: () => void
  onPause?: () => void
  onClick?: (song: Song) => void
  onToggleFavorite?: (song: Song, e: React.MouseEvent) => void
}

export function SearchResultItem({
  song,
  isFavorite = false,
  isPlaying = false,
  onPlay,
  onPause,
  onClick,
  onToggleFavorite
}: SearchResultItemProps) {

  const handlePlayAppScheme = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()

    if (song.floTrackId) {
      if (!isPlaying) {
        incrementSongStat(song.id, 'preview')
        logAction.playPreview(song.id, song.title)
        logMixpanel.playAction('preview', song.title)
        window.location.href = `${APP_SCHEME.BASE}://play/track?ids=${song.floTrackId}&repeat=off&shuffle=off&autoPlay=true`
        onPlay?.()
      } else {
        onPause?.()
      }
    } else {
      alert('재생 가능한 FLO 트랙 ID가 없습니다.')
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    handlePlayAppScheme(e)
    if (onClick) onClick(song)
  }

  return (
    <Card
      className="flex flex-row items-center p-[16px] gap-[16px] hover:bg-[var(--color-surface-primary)] active:bg-[var(--color-surface-primary)] border-[var(--color-border)] transition-colors border-0 border-b last:border-b-0 rounded-none shadow-none cursor-pointer"
      onClick={handleClick}
    >
      {/* 앨범 커버 */}
      <div className="relative size-[60px] flex-shrink-0 group">
        <DynamicAlbumCover 
          title={song.title}
          artist={song.artist}
          initialCoverUrl={song.coverUrl}
          alt={`${song.title} 앨범 커버`}
          size={60}
        />

        {/* 재생 아이콘 및 사운드 파 오버레이 */}
        <div className={`absolute inset-0 rounded-[8px] flex flex-col items-center justify-center transition-all ${isPlaying ? 'bg-black/40' : 'bg-black/20'} group-active:bg-black/40`}>
          {/* 재생(▶) / 일시정지(||) 아이콘 토글 */}
          {isPlaying ? (
            <svg className="size-[22px] text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="size-[22px] text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}

          {/* 사운드 파 (재생 중일 때만 애니메이션 활성화) */}
          <div className="flex gap-[1.5px] items-end h-[8px] mt-[3px]">
            <div className={`w-[2px] bg-white rounded-full transition-all ${isPlaying ? 'h-[100%] animate-pulse' : 'h-[30%]'}`}></div>
            <div className={`w-[2px] bg-white rounded-full transition-all ${isPlaying ? 'h-[60%] animate-pulse delay-75' : 'h-[50%]'}`}></div>
            <div className={`w-[2px] bg-white rounded-full transition-all ${isPlaying ? 'h-[100%] animate-pulse delay-150' : 'h-[40%]'}`}></div>
            <div className={`w-[2px] bg-white rounded-full transition-all ${isPlaying ? 'h-[70%] animate-pulse delay-300' : 'h-[60%]'}`}></div>
          </div>
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

      {/* 노래방 번호 및 즐겨찾기 */}
      <div className="flex flex-col items-end flex-shrink-0 gap-[8px] ml-[8px]">
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite?.(song, e)
          }}
          className="p-[4px] -m-[4px] focus:outline-none transition-transform active:scale-90"
        >
          <svg
            className={`size-[22px] ${isFavorite ? 'text-[#FFD700]' : 'text-[var(--color-icon-disabled)]'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>

        <div className="flex flex-col gap-[4px]">
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
      </div>
    </Card>
  )
}
