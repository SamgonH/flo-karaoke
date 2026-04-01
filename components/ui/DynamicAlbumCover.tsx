'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { fetchFloMetadata, isMetadataMismatched } from '@/services/floSearchService'

interface DynamicAlbumCoverProps {
  title: string
  artist: string
  initialCoverUrl?: string
  alt: string
  size?: number
}

/**
 * 앨범 아트워크를 동적으로 관리하는 컴포넌트입니다.
 * 1. DB에 정보가 없는 경우
 * 2. DB에 정보가 있으나 로드에 실패(404)하는 경우
 * 3. DB에 정보가 있으나 명백하게 잘못된(미스매칭) 데이터 패턴인 경우
 * 4. FLO 검색을 통해 실시간으로 최신 메타데이터를 수급합니다.
 */
export const DynamicAlbumCover = ({ 
  title, 
  artist, 
  initialCoverUrl, 
  alt,
  size = 60 
}: DynamicAlbumCoverProps) => {
  const [coverUrl, setCoverUrl] = useState<string | undefined>(initialCoverUrl)
  const [isError, setIsError] = useState(false)
  const [isAutoFetching, setIsAutoFetching] = useState(false)

  // 1. 초기 상태에서 수급이 필요한지 확인
  useEffect(() => {
    const isMismatched = isMetadataMismatched(artist, initialCoverUrl || null)
    
    // URL이 없거나, 명백하게 잘못된 데이터라면 즉시 수급 시작
    if ((!initialCoverUrl || isMismatched) && !isAutoFetching) {
      if (isMismatched) {
        console.warn(`[Auto-Repair] ${title} (${artist})의 커버 데이터 불일치가 감지되었습니다. 실시간 복구합니다.`)
      }
      handleAutoFetch()
    }
  }, [initialCoverUrl])

  const handleAutoFetch = async () => {
    if (isAutoFetching) return
    setIsAutoFetching(true)
    
    const metadata = await fetchFloMetadata(title, artist)
    
    if (metadata?.coverUrl) {
      setCoverUrl(metadata.coverUrl)
      setIsError(false)
    } else {
      setIsError(true)
    }
    
    setIsAutoFetching(false)
  }

  const handleError = () => {
    console.error(`[DynamicCover] ${title} 로드 실패 (404), 실시간 복구 시도합니다.`)
    if (!isAutoFetching) {
      handleAutoFetch()
    } else {
      setIsError(true)
    }
  }

  return (
    <div 
      className="relative rounded-[8px] overflow-hidden flex-shrink-0 bg-[var(--color-surface-quaternary)] shadow-sm"
      style={{ width: size, height: size }}
    >
      {coverUrl && !isError && !isMetadataMismatched(artist, coverUrl) ? (
        <Image
          src={coverUrl}
          alt={alt}
          fill
          className="object-cover"
          unoptimized
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-surface-tertiary)] to-[var(--color-surface-quaternary)] transition-all">
          {isAutoFetching ? (
            <div className="flex flex-col items-center gap-[4px] p-[8px]">
              <div className="size-[20px] border-2 border-[var(--color-icon-disabled)] border-t-white rounded-full animate-spin" />
              <span className="text-[9px] text-[var(--color-text-secondary)] font-medium animate-pulse">Sync</span>
            </div>
          ) : (
            <svg className="size-[28px] text-[var(--color-icon-disabled)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          )}
        </div>
      )}
    </div>
  )
}
