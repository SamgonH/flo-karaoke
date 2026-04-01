'use client'

import { useState } from 'react'
import { Heading } from '@/components/ui/Text'
import { SearchBar } from '@/components/SearchBar'
import { SearchResultItem, type Song } from '@/components/SearchResultItem'
import { searchKaraokeSongs } from '@/db/karaokeSongs'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Song[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (value: string) => {
    if (!value.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    
    try {
      const data = await searchKaraokeSongs(value)
      
      // DB 모델(KaraokeSongRow)을 UI 모델(Song)로 변환
      const mappedResults: Song[] = data.map(row => ({
        id: row.id,
        title: row.title,
        artist: row.artist,
        coverUrl: row.cover_url || '',
        tjNumber: row.tj_number || undefined,
        kyNumber: row.ky_number || undefined,
        floTrackId: row.flo_track_id || undefined,
      }))
      
      setResults(mappedResults)
    } catch (error) {
      console.error('검색 데이터 로딩 실패:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col w-full h-full min-h-screen bg-[var(--color-surface-bg)] mobile-container">
      {/* Header section */}
      <header className="flex flex-col sticky top-0 bg-[var(--color-surface-bg)] z-10 gap-[20px] px-[20px] pt-[40px] pb-[16px] shadow-sm">
        <Heading level={1}>노래방 번호 검색</Heading>
        
        <SearchBar
          value={query}
          onChange={(val) => {
            setQuery(val)
            if (!val) setHasSearched(false)
          }}
          onSearch={handleSearch}
        />
      </header>
      
      {/* Content section */}
      <section className="flex flex-col flex-1 pb-[100px]">
        {hasSearched ? (
          isLoading ? (
            <div className="flex flex-col flex-1 items-center justify-center pt-[60px]">
              <div className="size-[40px] border-4 border-[var(--color-surface-quaternary)] border-t-[var(--color-static-accent)] rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((song) => (
                <SearchResultItem key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center text-[var(--color-text-tertiary)] pt-[60px] gap-[12px]">
              <svg className="size-[48px] opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[16px]">'{query}' 검색 결과가 없습니다.</p>
            </div>
          )
        ) : (
          <div className="flex flex-col flex-1 items-center pt-[60px] text-[var(--color-text-tertiary)] gap-[12px]">
            <svg className="size-[64px] opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[16px]">부르고 싶은 노래를 검색해보세요!</p>
          </div>
        )}
      </section>
    </main>
  )
}
