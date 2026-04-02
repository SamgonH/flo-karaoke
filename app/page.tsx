'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Heading, BodyText, DetailText } from '@/components/ui/Text'
import { Spinner } from '@/components/ui/Spinner'
import { SearchResultItem, type Song } from '@/components/SearchResultItem'
import { FolderSelectModal } from '@/components/FolderSelectModal'
import { InvitationModal } from '@/components/InvitationModal'
import { ShareModal } from '@/components/ShareModal'
import { QRScannerModal } from '@/components/QRScannerModal'
import { 
  getFolders, 
  getFolderByShareKey, 
  deleteFolder,
  updateFolderCover,
  renameFolder
} from '@/db/folders'
import { 
  getFavoriteSongsByFolder,
  getFavoriteSongsByUser,
  addFavoriteSong, 
  removeFavoriteSongByFolder,
} from '@/db/favorites'
import { getFolderMembers } from '@/db/folder_members'
import { incrementSongStat, getPopularSongs, searchKaraokeSongs } from '@/db/karaokeSongs'
import { logAction } from '@/utils/floLog'

const MOCK_FLO_KINGS = [
  { id: '1', memberNo: 'user-001', name: '홍대 감성남', song: '다이너마이트', videoTitle: '지하철 파업이라 걸어오다 부른 다이너마이트🔥', tags: ['#출근길', '#팝송장인', '#흥폭발'], views: '1.2M', likes: '12만', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop', videoTime: '1:02', badge: '🔥 급상승' },
  { id: '2', memberNo: 'user-002', name: '코인노래방 고인물', song: 'Tears', videoTitle: '코노에서 Tears 원키로 뽑아봄 (실제상황)', tags: ['#원키', '#소찬휘', '#고음병'], views: '980K', likes: '9.8만', img: 'https://images.unsplash.com/photo-1516280440502-601ce838202d?q=80&w=200&auto=format&fit=crop', videoTime: '0:58', badge: '👑 1위' },
  { id: '3', memberNo: 'user-003', name: '방구석 디바', song: '사건의 지평선', videoTitle: '방구석에서 부르는 사건의 지평선 커버', tags: ['#윤하', '#음색깡패', '#새벽감성'], views: '850K', likes: '6.5만', img: 'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?q=80&w=200&auto=format&fit=crop', videoTime: '1:15', badge: '✨ NEW' },
  { id: '4', memberNo: 'user-004', name: '출근길 스웨거', song: 'Hype Boy', videoTitle: '뉴진스의 하입보이요 (퇴근하고 싶다)', tags: ['#뉴진스', '#댄스보컬', '#퇴근길'], views: '640K', likes: '5.1만', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=200&auto=format&fit=crop', videoTime: '0:45', badge: '📈 인기' },
  { id: '5', memberNo: 'user-005', name: '노래하는 야옹이', song: '에필로그', videoTitle: '야옹이가 부르는 에필로그 들어보실래요?', tags: ['#냥이', '#잔잔한', '#에필로그'], views: '520K', likes: '4.8만', img: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Cat', videoTime: '1:30', badge: '🥺 감동' },
]

type RankingCategory = 'ALL' | 'K-POP' | 'POP' | 'J-POP' | 'C-POP' | 'FLO 가왕'

function KaraokeAppContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'search' | 'rank' | 'favorites'>('search')
  const [rankingCategory, setRankingCategory] = useState<RankingCategory>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [popularSongs, setPopularSongs] = useState<Song[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([])
  const [favMap, setFavMap] = useState<Record<string, string[]>>({}) // songId -> folderIds[]
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [folderMembers, setFolderMembers] = useState<any[]>([])
  const [playingSongId, setPlayingSongId] = useState<string | null>(null)
  const touchStartY = useRef<number | null>(null)

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [isSharedMode, setIsSharedMode] = useState(false)
  const [songToFavorite, setSongToFavorite] = useState<Song | null>(null)
  const [invitationFolder, setInvitationFolder] = useState<any | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isAllSongsMode, setIsAllSongsMode] = useState(false)
  const [folderCoversMap, setFolderCoversMap] = useState<Record<string, string[]>>({})
  const [activeMenuFolderId, setActiveMenuFolderId] = useState<string | null>(null)
  const [memberNo, setMemberNo] = useState<string>('')

  const [showIntro, setShowIntro] = useState(true)
  const [introStep, setIntroStep] = useState(0) // 0: '나의', 1: (🎤), 2: '노래방'
  const [isReelsMode, setIsReelsMode] = useState(false)
  const [isReelUploadOpen, setIsReelUploadOpen] = useState(false)
  const [reelUploadTitle, setReelUploadTitle] = useState('')
  const [reelUploadTags, setReelUploadTags] = useState('')
  const [reelUploadSongId, setReelUploadSongId] = useState<string | null>(null)
  const [reelUploadSongTitle, setReelUploadSongTitle] = useState('')
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileNickname, setProfileNickname] = useState('')
  const [profileAvatar, setProfileAvatar] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    let id = localStorage.getItem('KARAOKE_MEMBER_NO')
    if (!id) {
      id = `guest-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('KARAOKE_MEMBER_NO', id)
    }
    setMemberNo(id)

    // 애니메이션 시퀀스
    setTimeout(() => setIntroStep(1), 800)
    setTimeout(() => setIntroStep(2), 1600)
    setTimeout(() => setShowIntro(false), 3000)
  }, [])

  useEffect(() => {
    if (!memberNo) return
    const sharedKey = searchParams.get('shared')
    if (sharedKey) {
      checkInvitation(sharedKey)
    }
  }, [searchParams, memberNo])

  const checkInvitation = async (key: string) => {
    try {
      const folder = await getFolderByShareKey(key)
      if (folder) setInvitationFolder(folder)
    } catch (err) {
      console.error('초대 확인 실패:', err)
    }
  }

  useEffect(() => {
    if (!memberNo) return
    loadInitialData()
    loadRecentSearches()
  }, [memberNo])

  const loadInitialData = async () => {
    try {
      const folderList = await getFolders(memberNo)
      setFolders(folderList)
      
      const cat = rankingCategory === 'ALL' ? null : rankingCategory
      const rankList = await getPopularSongs(cat)
      setPopularSongs(rankList.map((s: any) => ({
        id: s.id, title: s.title, artist: s.artist, coverUrl: s.cover_url || '',
        floTrackId: s.flo_track_id ? String(s.flo_track_id) : undefined,
        tjNumber: s.tj_number || undefined, kyNumber: s.ky_number || undefined,
      })))

      const allFavs = await getFavoriteSongsByUser(memberNo)
      const map: Record<string, string[]> = {}
      allFavs.forEach((item: any) => { 
        if (!map[item.song_id]) map[item.song_id] = []
        map[item.song_id].push(item.folder_id) 
      })
      setFavMap(map)

      const covers: Record<string, string[]> = {}
      for (const folder of folderList) {
        const songs = await getFavoriteSongsByFolder(folder.id)
        // karaoke_songs가 null인 경우를 대비해 안전하게 커버 URL 추출
        covers[folder.id] = songs
          .filter((s: any) => s.karaoke_songs)
          .slice(0, 4)
          .map((s: any) => s.karaoke_songs.cover_url || '')
      }
      setFolderCoversMap(covers)
    } catch (err) {
      console.error('초기 데이터 로딩 실패:', err)
    }
  }

  useEffect(() => {
    if (activeTab === 'rank' && memberNo) loadInitialData()
  }, [rankingCategory, activeTab, memberNo])

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
  }

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleDeleteRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation() // 검색 이벤트 전파 방지
    const updated = recentSearches.filter(q => q !== query)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault()
    const targetQuery = overrideQuery || searchQuery
    if (!targetQuery.trim()) return
    
    setActiveTab('search')
    setIsLoading(true)
    saveRecentSearch(targetQuery)
    if (overrideQuery) setSearchQuery(overrideQuery)

    try {
      const results = await searchKaraokeSongs(targetQuery)
      setSearchResults(results.map((t: any) => ({
        id: t.id, title: t.title, artist: t.artist, coverUrl: t.cover_url || '',
        floTrackId: t.flo_track_id ? String(t.flo_track_id) : undefined,
        tjNumber: t.tj_number || undefined, kyNumber: t.ky_number || undefined,
      })))
      logAction.searchSongs(targetQuery)
    } catch (err) {
      console.error('검색 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = (song: Song, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!memberNo) return
    setSongToFavorite(song)
    setIsSharedMode(false)
    setIsFolderModalOpen(true)
  }

  const handleSelectFolder = async (folderId: string) => {
    if (!memberNo || !songToFavorite) return
    try {
      const currentInFolders = favMap[songToFavorite.id] || []
      const isAlreadyIn = currentInFolders.includes(folderId)

      if (isAlreadyIn) {
        // 이미 담겨있으면 제거
        await removeFavoriteSongByFolder(folderId, songToFavorite.id)
        setFavMap(prev => ({
          ...prev,
          [songToFavorite.id]: (prev[songToFavorite.id] || []).filter(id => id !== folderId)
        }))
        logAction.favorite(songToFavorite.id, songToFavorite.title, false, folders.find(f => f.id === folderId)?.name)
      } else {
        // 없으면 추가
        await addFavoriteSong(folderId, songToFavorite.id, memberNo)
        incrementSongStat(songToFavorite.id, 'favorite')
        setFavMap(prev => ({
          ...prev,
          [songToFavorite.id]: [...(prev[songToFavorite.id] || []), folderId]
        }))
        logAction.favorite(songToFavorite.id, songToFavorite.title, true, folders.find(f => f.id === folderId)?.name)
      }

      // 화면 즉시 갱신 (리스트 모드일 때)
      if (activeTab === 'favorites') {
        if (isAllSongsMode) handleViewAllSongs()
        else loadFavoritesByFolder()
      }
      
      // 커버 이미지 갱신 등이 필요할 수 있으므로 loadInitialData 호출
      await loadInitialData()
    } catch (err) {
      console.error('폴더 작업 실패:', err)
    }
  }

  const loadFavoritesByFolder = async () => {
    if (!selectedFolderId) return
    setIsLoading(true)
    try {
      const songs = await getFavoriteSongsByFolder(selectedFolderId)
      setFavoriteSongs(songs.map((s: any) => ({
        id: s.karaoke_songs.id, title: s.karaoke_songs.title, artist: s.karaoke_songs.artist, coverUrl: s.karaoke_songs.cover_url || '',
        floTrackId: s.karaoke_songs.flo_track_id ? String(s.karaoke_songs.flo_track_id) : undefined,
        tjNumber: s.karaoke_songs.tj_number || undefined, kyNumber: s.karaoke_songs.ky_number || undefined,
      })))
      const members = await getFolderMembers(selectedFolderId)
      setFolderMembers(members)
    } catch (err) {
      console.error('즐겨찾기 목록 로딩 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAllSongs = async () => {
    setIsAllSongsMode(true)
    setSelectedFolderId(null)
    setIsLoading(true)
    try {
      const songs = await getFavoriteSongsByUser(memberNo)
      setFavoriteSongs(songs.map((s: any) => ({
        id: s.karaoke_songs.id, title: s.karaoke_songs.title, artist: s.karaoke_songs.artist, coverUrl: s.karaoke_songs.cover_url || '',
        floTrackId: s.karaoke_songs.flo_track_id ? String(s.karaoke_songs.flo_track_id) : undefined,
        tjNumber: s.karaoke_songs.tj_number || undefined, kyNumber: s.karaoke_songs.ky_number || undefined,
      })))
    } catch (err) {
      console.error('전체 곡 로드 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'favorites' && selectedFolderId) loadFavoritesByFolder()
  }, [selectedFolderId, activeTab])

  const handleUpdateFolderCover = async (folderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      try {
        await updateFolderCover(folderId, base64)
        // 즉시 반영을 위해 로컬 상태 업데이트 후 재로드
        await loadInitialData()
        alert('폴더 커버가 업데이트되었습니다! 🎉')
      } catch (err) {
        console.error('커버 업데이트 실패:', err)
      }
    }
    reader.readAsDataURL(file)
  }

  const FolderCoverImage = ({ folder }: { folder: any }) => {
    if (folder.cover_url) return <img src={folder.cover_url} className="w-full h-full object-cover" alt="Custom Cover" />
    const covers = folderCoversMap[folder.id] || []
    if (covers.length === 0) return (
      <div className={`w-full h-full flex items-center justify-center text-[36px] bg-gradient-to-br ${folder.is_shared ? 'from-[#8E2DE2] to-[#4A00E0]' : 'from-[#FF512F] to-[#DD2476]'}`}>
        {folder.is_shared ? '📂' : '📁'}
      </div>
    )
    return (
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[1px] bg-[var(--color-border)]">
        {covers.map((url, i) => <img key={i} src={url} className="w-full h-full object-cover" alt="Cover Part" />)}
        {[...Array(Math.max(0, 4 - covers.length))].map((_, i) => <div key={`empty-${i}`} className="w-full h-full bg-[var(--color-surface-tertiary)]" />)}
      </div>
    )
  }


  const FolderMoreMenu = ({ folder, isHeader = false }: { folder: any, isHeader?: boolean }) => {
    const isOpen = activeMenuFolderId === folder.id
    
    // Rename/Delete logic inside component to avoid closure issues
    const handleRename = async () => {
      const newName = window.prompt('새로운 폴더 이름을 입력하세요:', folder.name);
      if (!newName || newName === folder.name) {
        setActiveMenuFolderId(null);
        return;
      }
      try {
        await renameFolder(folder.id, newName);
        await loadInitialData();
        window.alert('폴더 이름이 변경되었습니다.');
      } catch (err) {
        window.alert('이름 변경에 실패했습니다.');
      } finally {
        setActiveMenuFolderId(null);
      }
    };

    const handleDelete = async () => {
      if (!window.confirm('정말 이 폴더를 삭제할까요?\n폴더 내 모든 곡이 삭제됩니다.')) {
        setActiveMenuFolderId(null);
        return;
      }
      try {
        await deleteFolder(folder.id);
        if (selectedFolderId === folder.id) setSelectedFolderId(null);
        await loadInitialData();
        window.alert('폴더가 삭제되었습니다.');
      } catch (err) {
        window.alert('삭제에 실패했습니다.');
      } finally {
        setActiveMenuFolderId(null);
      }
    };

    if (folder.member_no !== memberNo) return null;

    return (
      <div className={`relative ${isHeader ? '' : 'ml-[8px]'}`}>
        <button 
          type="button"
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation();
            setActiveMenuFolderId(isOpen ? null : folder.id);
          }} 
          className={`p-[10px] rounded-full hover:bg-[var(--color-surface-tertiary)] transition-all active:scale-90 ${isOpen ? 'bg-[var(--color-surface-tertiary)] ring-2 ring-[var(--color-static-accent)]/20' : ''}`}
        >
          <svg className="size-[20px] text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2.5" /><circle cx="12" cy="12" r="2.5" /><circle cx="12" cy="19" r="2.5" />
          </svg>
        </button>
        {isOpen && (
          <div 
            className="absolute right-0 top-[48px] z-[100] w-[160px] bg-white rounded-[20px] shadow-2xl border border-[var(--color-border)] py-[8px] animate-in fade-in zoom-in-95 duration-200 ring-4 ring-black/5"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              type="button"
              onClick={handleRename}
              className="w-full px-[18px] py-[12px] text-left text-[14px] font-[900] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)] transition-colors cursor-pointer"
            >
              📝 이름 수정
            </button>
            {folder.is_shared && (
              <button 
                type="button"
                onClick={() => {
                  setSelectedFolderId(folder.id);
                  setIsShareModalOpen(true);
                  setActiveMenuFolderId(null);
                }}
                className="w-full px-[18px] py-[12px] text-left text-[14px] font-[900] text-[var(--color-static-accent)] hover:bg-[var(--color-static-accent)]/5 transition-colors cursor-pointer"
              >
                🔗 링크 공유
              </button>
            )}
            <div className="h-[1px] bg-[var(--color-border)] mx-[12px] opacity-50" />
            <button 
              type="button"
              onClick={handleDelete}
              className="w-full px-[18px] py-[12px] text-left text-[14px] font-[900] text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              🗑️ 폴더 삭제
            </button>
          </div>
        )}
      </div>
    );
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  const isInitialSearch = activeTab === 'search' && searchResults.length === 0 && !isLoading && !searchQuery;

  useEffect(() => {
    // 인트로 중이거나 이미 릴스 모드이거나 검색초기화면이 아니면 동작 제한
    if (showIntro || !isInitialSearch || isReelsMode) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) { // 약간의 휠 내림(아래로 스크롤)만 있어도 즉시 릴스로 넘어감
        setIsReelsMode(true);
      }
    };
    
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
       touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
       if (touchStartY && touchStartY - e.touches[0].clientY > 15) { // 15px 살짝만 쓸어올려도 반응
          setIsReelsMode(true);
       }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isInitialSearch, isReelsMode, showIntro]);

  return (
    <main 
      className={`bg-[var(--color-surface-bg)] text-[var(--color-text-primary)] overflow-x-hidden transition-all duration-300 ${isInitialSearch ? 'h-[100dvh] overflow-y-hidden' : 'min-h-screen pb-[100px]'}`}
      onWheel={(e) => {
        if (!showIntro && isInitialSearch && e.deltaY > 0) setIsReelsMode(true);
      }}
      onTouchStart={(e) => {
        if (!showIntro && isInitialSearch) touchStartY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        if (!showIntro && isInitialSearch && touchStartY.current !== null) {
          if (touchStartY.current - e.touches[0].clientY > 15) {
            setIsReelsMode(true);
            touchStartY.current = null;
          }
        }
      }}
      onTouchEnd={() => { touchStartY.current = null; }}
    >
      {/* Intro Landing Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-[200] bg-[var(--color-surface-bg)] flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center gap-[40px] animate-in fade-in duration-700">
             <div className="flex items-center gap-[12px]">
               <h1 className={`text-[48px] font-black transition-all duration-700 ${introStep >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                 나의
               </h1>
               <div className={`size-[80px] bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] rounded-[24px] flex items-center justify-center text-[40px] shadow-[0_0_40px_rgba(142,45,226,0.5)] transition-all duration-700 ${introStep >= 1 ? 'opacity-100 scale-100 rotate-12' : 'opacity-0 scale-50 rotate-0'}`}>
                 🎤
               </div>
               <h1 className={`text-[48px] font-black transition-all duration-700 ${introStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                 노래방
               </h1>
             </div>
             <div className={`h-[4px] bg-gradient-to-r from-transparent via-[var(--color-static-accent)] to-transparent transition-all duration-1000 ${introStep >= 2 ? 'w-[300px] opacity-100' : 'w-0 opacity-0'}`} />
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className={`flex flex-col transition-all duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100 animate-in slide-in-from-bottom-10'}`}>
        {/* Header Hero Area */}
        <div className="relative pt-[100px] pb-[40px] px-[20px] flex flex-col items-center gap-[40px] text-center">
          <div className="flex flex-col gap-[10px]">
             <Heading 
               level={1} 
               onClick={() => {
                 setActiveTab('search');
                 setSearchQuery('');
                 setSearchResults([]);
                 setIsReelsMode(false);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               className="!text-[42px] font-black tracking-tighter bg-gradient-to-br from-[var(--color-text-primary)] to-[var(--color-text-tertiary)] bg-clip-text text-transparent cursor-pointer hover:opacity-80 active:scale-95 transition-all select-none pb-[2px]"
             >
               나의 <span className="inline-block hover:scale-110 transition-transform">🎤</span> 노래방
             </Heading>
             <DetailText className="text-[var(--color-text-tertiary)] !text-[16px]">오늘 부를 노래의 번호를 찾아보세요!</DetailText>
          </div>

          {/* Centered Search Area (Glass Style) */}
          <div className="w-full max-w-[500px] relative">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] rounded-[28px] opacity-20 blur group-focus-within:opacity-40 transition-opacity" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="곡명, 아티스트를 검색" 
                className="relative w-full h-[64px] bg-white/80 backdrop-blur-3xl border border-white/40 rounded-[24px] px-[28px] text-[18px] font-medium shadow-2xl focus:outline-none focus:border-[var(--color-static-accent)] transition-all placeholder:text-[var(--color-text-tertiary)]" 
              />
              <button type="submit" className="absolute right-[12px] top-[12px] size-[40px] bg-[var(--color-static-accent)] rounded-[16px] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                <svg className="size-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            
            <div className="flex flex-wrap justify-center gap-[10px] mt-[20px]">
              {recentSearches.map((q, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSearch(undefined, q)} 
                  className="flex items-center gap-[6px] px-[16px] py-[10px] bg-white/30 backdrop-blur-3xl rounded-full text-[14px] font-bold text-[var(--color-text-secondary)] border border-white/40 hover:bg-white/60 transition-all shadow-sm cursor-pointer group/search"
                >
                  <span className="opacity-80 group-hover/search:opacity-100">{q}</span>
                  <button 
                    onClick={(e) => handleDeleteRecentSearch(q, e)} 
                    className="size-[18px] rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors text-[10px] opacity-40 hover:opacity-100 border border-transparent hover:border-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Tab Cards (Rounded Rect Buttons) */}
          <div className="flex gap-[16px] mt-[20px]">
            {([
              ...(searchResults.length > 0 ? ['search' as const] : []), 
              'rank' as const, 
              'favorites' as const
            ]).map(tab => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); window.scrollTo({ top: 400, behavior: 'smooth' }); }} 
                className={`relative group px-[32px] py-[20px] rounded-[28px] border transition-all duration-300 active:scale-95 ${activeTab === tab ? 'bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border-white border-[2px] -translate-y-2' : 'bg-transparent border-transparent text-[var(--color-text-tertiary)]'}`}
              >
                <div className={`absolute -inset-[2px] bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] rounded-[30px] opacity-0 ${activeTab === tab ? 'opacity-10' : ''}`} />
                <div className="flex flex-col items-center gap-[6px]">
                   <span className="text-[24px]">{tab === 'search' ? '🔍' : tab === 'rank' ? '🔥' : '📁'}</span>
                   <span className={`text-[15px] font-black tracking-tight ${activeTab === tab ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]'}`}>
                     {tab === 'search' ? '검색 결과' : tab === 'rank' ? '실시간 차트' : '나의 노래방'}
                   </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div id="content-view" className="max-w-[600px] mx-auto p-[20px] w-full">
          {activeTab === 'search' && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                {searchResults.length > 0 ? (
                  <>
                    <div className="flex items-center gap-[8px] mb-[16px] px-[4px]">
                       <div className="size-[8px] bg-green-500 rounded-full animate-pulse" />
                       <DetailText className="font-bold text-[var(--color-static-accent)] uppercase tracking-wider">Search Results</DetailText>
                    </div>
                    {isLoading ? <div className="flex justify-center py-[40px]"><Spinner /></div> : searchResults.map(song => (
                      <SearchResultItem key={song.id} song={song} isFavorite={!!favMap[song.id]?.length} isPlaying={playingSongId === song.id} onPlay={() => setPlayingSongId(song.id)} onPause={() => setPlayingSongId(null)} onToggleFavorite={(s, e) => handleToggleFavorite(s, e)} />
                    ))}
                    
                    {/* 플로팅 버튼 (검색 결과가 있을 때만 활성화) */}
                    <button 
                      onClick={() => { setSearchQuery(''); setIsReelsMode(true); }}
                      className="fixed bottom-[30px] left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-[10px] px-[28px] py-[16px] bg-gradient-to-r from-black to-[#222] text-white rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/20 hover:scale-[1.03] active:scale-95 transition-all outline outline-4 outline-white/10"
                    >
                      <svg className="size-[18px] text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                      <span className="font-extrabold text-[16px] tracking-tight">FLO 가왕 릴스 보기</span>
                    </button>
                  </>
                ) : !isLoading && (
                  <div 
                    className="flex flex-col items-center justify-center p-[40px] mt-[20px] rounded-[32px] cursor-pointer group active:scale-[0.98] transition-transform w-full relative overflow-hidden shadow-sm hover:shadow-lg border border-[var(--color-border)] hover:border-[var(--color-static-accent)] bg-gradient-to-b from-white to-[var(--color-surface-secondary)]"
                    onClick={() => setIsReelsMode(true)}
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
                    
                    <div className="relative mb-[24px]">
                      <div className="absolute inset-0 bg-[var(--color-static-accent)] blur-[40px] opacity-20 rounded-full group-hover:opacity-40 transition-opacity" />
                      <svg className="relative size-[90px] text-[var(--color-static-accent)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:-translate-y-2 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18 4v1h-2V4c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1H6V4c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-1h2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1s-1 .45-1 1zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" /></svg>
                    </div>
                    
                    <Heading level={1} className="!text-[46px] font-[900] tracking-tighter text-[var(--color-text-primary)] mb-[8px] drop-shadow-sm flex items-center gap-[4px]">
                      FLO <span className="text-[var(--color-static-accent)]">가왕</span>
                    </Heading>
                    <BodyText className="text-[17px] font-bold text-[var(--color-text-tertiary)] mb-[32px]">오리지널 커버 숏폼 피드</BodyText>

                    <div className="flex flex-col items-center gap-[12px] opacity-80 animate-bounce cursor-pointer group-hover:text-[var(--color-static-accent)] transition-colors">
                      <span className="text-[14px] font-black tracking-widest text-[var(--color-text-secondary)] group-hover:text-[var(--color-static-accent)]">클릭하거나 아래로 스크롤</span>
                      <div className="p-[12px] rounded-full bg-white shadow-xl border border-[var(--color-border)] group-hover:border-[var(--color-static-accent)] group-hover:scale-110 transition-all text-[var(--color-text-tertiary)] group-hover:text-[var(--color-static-accent)] group-hover:shadow-[0_10px_20px_rgba(var(--color-static-accent-rgb),0.2)]">
                        <svg className="size-[28px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          )}

          {activeTab === 'rank' && (
            <div className="flex flex-col gap-[20px] animate-in fade-in slide-in-from-bottom-4">
              {/* Category Subtabs */}
              <div className="flex gap-[10px] overflow-x-auto scrollbar-hide pb-[8px] px-[4px]">
                {(['ALL', 'K-POP', 'POP', 'J-POP', 'C-POP', 'FLO 가왕'] as RankingCategory[]).map(cat => (
                  <button key={cat} onClick={() => setRankingCategory(cat)} className={`shrink-0 flex items-center gap-[4px] px-[16px] py-[10px] rounded-[18px] text-[13px] font-black border transition-all ${rankingCategory === cat ? (cat === 'FLO 가왕' ? 'bg-black text-white border-black shadow-xl scale-105' : 'bg-white text-[var(--color-text-primary)] border-white shadow-xl scale-105') : 'bg-white/40 backdrop-blur-md text-[var(--color-text-secondary)] border-white/50 hover:bg-white/60'}`}>
                    {cat === 'FLO 가왕' && <span className="text-yellow-400">👑</span>}
                    {cat === 'ALL' ? '전체' : cat}
                  </button>
                ))}
              </div>
              <div className="flex flex-col p-[12px] bg-white/40 backdrop-blur-xl rounded-[32px] border border-white/50 shadow-sm mt-[10px]">
                {rankingCategory === 'FLO 가왕' ? (
                  <div className="flex flex-col gap-[12px] p-[8px]">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <span className="px-[12px] py-[4px] bg-black text-yellow-400 rounded-full text-[12px] font-black">👑 FLO 가왕 인기 차트</span>
                      <span className="text-[11px] text-[var(--color-text-tertiary)] font-bold">실시간 업데이트</span>
                    </div>
                    {MOCK_FLO_KINGS.map((king, index) => (
                      <div 
                        key={king.id}
                        onClick={() => setIsReelsMode(true)}
                        className="flex items-center gap-[14px] p-[12px] bg-white rounded-[20px] border border-[var(--color-border)] hover:border-[var(--color-static-accent)] hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
                      >
                        <div className="w-[32px] text-center font-black text-[20px] italic shrink-0">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-[var(--color-text-tertiary)] text-[16px]">{index + 1}</span>}
                        </div>
                        <div className="size-[56px] rounded-[14px] overflow-hidden shrink-0 shadow-md">
                          <img src={king.img} alt={king.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0 gap-[2px]">
                          <span className="font-black text-[14px] text-[var(--color-text-primary)] truncate">{king.videoTitle}</span>
                          <span className="text-[12px] font-bold text-[var(--color-text-secondary)]">🎵 {king.song}</span>
                          <div className="flex gap-[4px] flex-wrap mt-[2px]">
                            {king.tags.slice(0,2).map(tag => (
                              <span key={tag} className="text-[10px] font-bold text-[var(--color-static-accent)]">{tag}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-[10px] mt-[2px]">
                            <span className="text-[11px] text-[var(--color-text-tertiary)] font-bold">👁 {king.views}</span>
                            <span className="text-[11px] text-pink-500 font-bold">♥ {king.likes}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span className="px-[10px] py-[4px] bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black rounded-full">{king.badge}</span>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => setIsReelsMode(true)}
                      className="w-full mt-[8px] py-[14px] rounded-[20px] bg-black text-yellow-400 font-black text-[14px] flex items-center justify-center gap-[8px] hover:scale-[1.01] active:scale-95 transition-all shadow-lg"
                    >
                      <svg className="size-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" /></svg>
                      FLO 가왕 피드에서 전체 보기 →
                    </button>
                  </div>
                ) : popularSongs.length > 0 ? popularSongs.map((song, index) => (
                  <div key={song.id} className="flex items-center">
                    <div className="w-[36px] text-center font-black text-[var(--color-text-tertiary)] italic text-[18px] pr-[4px]">{index + 1}</div>
                    <div className="flex-1">
                      <SearchResultItem song={song} isFavorite={!!favMap[song.id]?.length} isPlaying={playingSongId === song.id} onPlay={() => setPlayingSongId(song.id)} onPause={() => setPlayingSongId(null)} onToggleFavorite={(s, e) => handleToggleFavorite(s, e)} />
                    </div>
                  </div>
                )) : <div className="flex justify-center py-[60px]"><Spinner /></div>}
              </div>
            </div>
          )}

        {activeTab === 'favorites' && (
          <div className="flex flex-col gap-[28px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!selectedFolderId && !isAllSongsMode ? (
              <>
                <button onClick={handleViewAllSongs} className="flex items-center p-[24px] bg-gradient-to-br from-[var(--color-surface-secondary)] to-[var(--color-surface-tertiary)] rounded-[28px] border border-[var(--color-border)] hover:border-[var(--color-static-accent)] transition-all group shadow-sm active:scale-[0.98]">
                  <div className="size-[64px] rounded-[22px] bg-[var(--color-static-accent)] flex items-center justify-center text-[32px] mr-[20px] shadow-lg group-hover:rotate-6 transition-transform">🎶</div>
                  <div className="flex flex-col items-start gap-[4px]">
                    <BodyText className="font-bold !text-[20px]">전체 노래 보기</BodyText>
                    <DetailText className="text-[var(--color-text-tertiary)]">내가 아끼는 모든 곡을 한눈에!</DetailText>
                  </div>
                  <div className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity">
                    <svg className="size-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
                <div className="h-[1px] bg-[var(--color-border)] opacity-50" />
                <div className="flex flex-col gap-[16px]">
                  <div className="flex justify-between items-center px-[4px]">
                    <div className="flex items-center gap-[8px]">
                      <Heading level={3} className="!text-[16px] text-[var(--color-static-accent)] font-bold">👥 함께 노래하기!</Heading>
                      <span className="px-[8px] py-[2px] bg-[var(--color-static-accent)]/10 text-[var(--color-static-accent)] rounded-full text-[10px] font-bold">SHARED</span>
                    </div>
                    <button onClick={() => { setIsSharedMode(true); setIsFolderModalOpen(true); }} className="text-[13px] font-bold text-[var(--color-static-accent)] hover:underline">+ 새로 만들기</button>
                  </div>
                  <div className="grid grid-cols-1 gap-[12px]">
                    {folders.filter(f => f.is_shared).map(folder => (
                      <div key={folder.id} className="relative group">
                        <div className="w-full flex items-center p-[16px] bg-white rounded-[24px] border border-[var(--color-border)] hover:border-[var(--color-static-accent)] hover:shadow-md transition-all text-left">
                          {/* Folder Click Area */}
                          <div 
                            onClick={() => { setIsAllSongsMode(false); setSelectedFolderId(folder.id); }}
                            className="flex items-center flex-1 min-w-0 cursor-pointer active:scale-[0.99] transition-transform"
                          >
                            <div className="size-[80px] rounded-[18px] overflow-hidden bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] mr-[18px] shadow-inner shrink-0 group-hover:scale-105 transition-transform"><FolderCoverImage folder={folder} /></div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <BodyText className="font-bold truncate !text-[18px]">{folder.name}</BodyText>
                              <div className="flex items-center gap-[10px] mt-[4px]">
                                <DetailText className="!text-[12px] text-[var(--color-text-tertiary)] font-medium">{new Date(folder.created_at).toLocaleDateString()}</DetailText>
                                <span className="size-[2px] bg-[var(--color-border)] rounded-full" />
                                <DetailText className="!text-[12px] text-[var(--color-static-accent)] font-bold">공용 폴더</DetailText>
                              </div>
                            </div>
                          </div>
                          {/* Menu Area */}
                          <div className="shrink-0 relative z-20">
                            <FolderMoreMenu folder={folder} />
                          </div>
                        </div>
                        {folder.member_no === memberNo && (
                          <label className="absolute bottom-[12px] left-[68px] p-[6px] bg-white rounded-full shadow-lg border border-[var(--color-border)] cursor-pointer hover:scale-110 active:scale-95 transition-all z-10">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpdateFolderCover(folder.id, e)} />
                            <svg className="size-[14px] text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-[1px] bg-[var(--color-border)] opacity-50" />
                <div className="flex flex-col gap-[16px]">
                  <div className="flex justify-between items-center px-[4px]">
                    <Heading level={3} className="!text-[16px] text-[var(--color-text-primary)] font-bold">📁 나의 개인 폴더</Heading>
                    <button onClick={() => { setIsSharedMode(false); setIsFolderModalOpen(true); }} className="text-[13px] font-bold text-[var(--color-text-tertiary)] hover:underline">+ 새 폴더</button>
                  </div>
                  <div className="grid grid-cols-1 gap-[12px]">
                    {folders.filter(f => !f.is_shared).map(folder => (
                      <div key={folder.id} className="relative group">
                        <div className="w-full flex items-center p-[16px] bg-white rounded-[24px] border border-[var(--color-border)] hover:border-[var(--color-text-primary)] hover:shadow-md transition-all text-left">
                          {/* Folder Click Area */}
                          <div 
                            onClick={() => { setIsAllSongsMode(false); setSelectedFolderId(folder.id); }}
                            className="flex items-center flex-1 min-w-0 cursor-pointer active:scale-[0.99] transition-transform"
                          >
                            <div className="size-[80px] rounded-[18px] overflow-hidden bg-gradient-to-br from-[#FF512F] to-[#DD2476] mr-[18px] shadow-inner shrink-0 group-hover:scale-105 transition-transform"><FolderCoverImage folder={folder} /></div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <BodyText className="font-bold truncate !text-[18px]">{folder.name}</BodyText>
                              <div className="flex items-center gap-[10px] mt-[4px]">
                                <DetailText className="!text-[12px] text-[var(--color-text-tertiary)] font-medium">{new Date(folder.created_at).toLocaleDateString()}</DetailText>
                                <span className="size-[2px] bg-[var(--color-border)] rounded-full" />
                                <DetailText className="!text-[12px] text-[var(--color-text-tertiary)] font-medium">개인</DetailText>
                              </div>
                            </div>
                          </div>
                          {/* Menu Area */}
                          <div className="shrink-0 relative z-20">
                            <FolderMoreMenu folder={folder} />
                          </div>
                        </div>
                        {folder.member_no === memberNo && (
                          <label className="absolute bottom-[12px] left-[68px] p-[6px] bg-white rounded-full shadow-lg border border-[var(--color-border)] cursor-pointer hover:scale-110 active:scale-95 transition-all z-10">
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpdateFolderCover(folder.id, e)} />
                            <svg className="size-[14px] text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-[16px] mt-[10px]">
                <div className="relative flex flex-col items-center py-[40px] px-[20px] animate-in fade-in slide-in-from-bottom-4 duration-700 bg-gradient-to-b from-[var(--color-surface-secondary)]/30 to-transparent rounded-[32px] mb-[20px]">
                  <button onClick={() => { setSelectedFolderId(null); setIsAllSongsMode(false); window.scrollTo(0, 0); }} className="absolute left-[16px] top-[16px] flex items-center gap-[6px] px-[14px] py-[10px] bg-white/90 backdrop-blur-xl rounded-[18px] shadow-sm border border-white/50 hover:bg-white transition-all active:scale-95 z-30 group">
                    <svg className="size-[20px] text-[var(--color-text-primary)] group-hover:-translate-x-[2px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    <span className="text-[14px] font-bold text-[var(--color-text-primary)]">뒤로</span>
                  </button>
                  {!isAllSongsMode && <div className="absolute right-[20px] top-[20px] z-20 p-[4px] bg-white/80 backdrop-blur-md rounded-[16px] shadow-lg border border-white/50"><FolderMoreMenu folder={selectedFolder} isHeader={true} /></div>}
                  <div className="size-[200px] rounded-[32px] overflow-hidden shadow-2xl mb-[24px] border-4 border-white transform hover:scale-[1.02] transition-transform duration-500"><FolderCoverImage folder={selectedFolder || { id: 'all' }} /></div>
                  <div className="flex flex-col items-center gap-[8px] text-center max-w-full">
                    <Heading level={1} className="!text-[28px] font-[900] tracking-tight px-[10px]">{isAllSongsMode ? '전체 노래' : selectedFolder?.name}</Heading>
                    <div className="flex items-center gap-[10px]"><span className="px-[12px] py-[4px] bg-[var(--color-surface-tertiary)] rounded-full text-[12px] font-bold text-[var(--color-text-tertiary)]">총 {favoriteSongs.length}곡</span>
                      {!isAllSongsMode && selectedFolder?.is_shared && (
                        <button 
                          onClick={() => setIsShareModalOpen(true)}
                          className="flex items-center gap-[6px] px-[12px] py-[4px] bg-[var(--color-static-accent)] text-white rounded-full text-[11px] font-extrabold shadow-sm active:scale-95 transition-transform"
                        >
                          <svg className="size-[12px]" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                          링크 공유하기
                        </button>
                      )}
                    </div>
                    {!isAllSongsMode && selectedFolder?.is_shared && (
                      <div className="flex -space-x-[10px] mt-[12px]">
                        {folderMembers.map((member) => <img key={member.id} src={member.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${member.member_no}`} alt={member.profiles?.nickname} className="size-[32px] rounded-[10px] border-2 border-white shadow-md object-cover" />)}
                      </div>
                    )}
                    {!isAllSongsMode && (
                      <div className="flex flex-col items-center mt-[32px] mb-[8px] w-full max-w-[340px] px-[10px]">
                        <button 
                          onClick={() => setIsQRScannerOpen(true)}
                          className="w-full h-[64px] rounded-[24px] bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-white font-extrabold text-[18px] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-[12px] group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <svg className="size-[24px] text-[var(--color-static-accent)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                          한꺼번에 예약하기! 🚀
                        </button>
                        <span className="mt-[12px] text-[12px] font-bold text-[var(--color-text-tertiary)] bg-white/60 backdrop-blur-xl px-[16px] py-[6px] rounded-full shadow-sm">
                          노래방 기기에 표시된 QR 코드를 비춰주세요! 📸
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!isAllSongsMode && selectedFolder?.is_shared && (
                  <div className="mx-[20px] mb-[32px] p-[20px] bg-white rounded-[24px] border border-[var(--color-border)] shadow-sm">
                    <div className="flex items-center justify-between mb-[16px]"><Heading level={3} className="!text-[16px] font-bold">함께하는 멤버</Heading><span className="text-[12px] font-bold text-[var(--color-text-tertiary)] bg-[var(--color-surface-tertiary)] px-[8px] py-[2px] rounded-full">{folderMembers.length}명</span></div>
                    <div className="flex flex-col gap-[12px]">
                      {folderMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-[12px]">
                            <img src={member.profiles?.avatar_url || `https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=${member.member_no}`} className="size-[44px] rounded-[14px] bg-[var(--color-surface-secondary)] object-cover" alt="Avatar" />
                            <div className="flex flex-col"><BodyText className="!text-[15px] font-bold">{member.profiles?.nickname}{member.member_no === memberNo && <span className="ml-[4px] text-[10px] text-[var(--color-static-accent)]">(나)</span>}</BodyText><DetailText className="!text-[11px] uppercase tracking-wider">{member.role === 'OWNER' ? 'Owner' : 'Participant'}</DetailText></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col">
                  {isLoading ? <div className="flex justify-center py-[40px]"><Spinner /></div> : favoriteSongs.length > 0 ? favoriteSongs.map(song => (
                    <SearchResultItem key={song.id} song={song} isFavorite={!!favMap[song.id]?.length} isPlaying={playingSongId === song.id} onPlay={() => setPlayingSongId(song.id)} onPause={() => setPlayingSongId(null)} onToggleFavorite={(s, e) => handleToggleFavorite(s, e)} />
                  )) : <div className="py-[80px] text-center bg-[var(--color-surface-tertiary)] rounded-[24px] border border-dashed border-[var(--color-border)]"><BodyText className="text-[var(--color-text-tertiary)]">폴더에 담긴 노래가 없어요.</BodyText></div>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    <FolderSelectModal 
      memberNo={memberNo} 
      isOpen={isFolderModalOpen} 
      onClose={() => { setIsFolderModalOpen(false); setSongToFavorite(null); }} 
      onSelect={handleSelectFolder} 
      onFolderCreated={loadInitialData} 
      defaultShared={isSharedMode} 
      currentFolderIds={songToFavorite ? (favMap[songToFavorite.id] || []) : []} 
    />
    {invitationFolder && <InvitationModal memberNo={memberNo} folderName={invitationFolder.name} folderId={invitationFolder.id} invitationMessage={invitationFolder.invitation_message} isOpen={!!invitationFolder} onClose={() => setInvitationFolder(null)} onJoined={async () => { const folderId = invitationFolder.id; setInvitationFolder(null); setActiveTab('favorites'); await loadInitialData(); setSelectedFolderId(folderId); }} />}
    {selectedFolder && <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} folderId={selectedFolder.id} folderName={selectedFolder.name} shareUrl={`${window.location.origin}${window.location.pathname}?shared=${selectedFolder.share_key}`} />}
    <QRScannerModal isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />

    {/* 전면 풀스크린 릴스 모달 오버레이 */}
    {isReelsMode && (
      <div className="fixed inset-0 z-[500] bg-black flex flex-col animate-in slide-in-from-bottom-full duration-500 ease-in-out">
        {/* 상단 닫기 바 */}
        <div className="absolute top-0 left-0 right-0 h-[80px] bg-gradient-to-b from-black/80 to-transparent z-[510] flex items-center px-[20px]">
          <button 
            onClick={() => setIsReelsMode(false)}
            className="size-[44px] rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/20 active:scale-95 transition-all text-white hover:bg-white/10"
          >
            <svg className="size-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="ml-[16px] text-white font-[900] text-[20px] tracking-tight">FLO 가왕 피드</span>
        </div>

        {/* 세로 영상 스와이프 컨테이너 */}
        <div className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory scrollbar-hide">
          {MOCK_FLO_KINGS.map((king, i) => (
            <div key={king.id} className="relative w-full h-[100dvh] shrink-0 snap-start bg-black overflow-hidden group">
              <img src={king.img} alt={king.name} className="absolute inset-0 w-full h-full object-cover opacity-80 scale-[1.02] group-hover:scale-100 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/50" />
              
              {/* 툴바 UI (우측) */}
              <div className="absolute right-[20px] bottom-[140px] flex flex-col gap-[24px] z-20 items-center">
                <button className="flex flex-col items-center gap-[6px] group/btn">
                  <div className="size-[52px] rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center group-hover/btn:bg-black/60 transition-all border border-white/20 shadow-xl group-active/btn:scale-95 text-pink-500">
                    <svg className="size-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  </div>
                  <span className="text-white font-bold text-[12px] drop-shadow-md">{king.likes}</span>
                </button>
                <button className="flex flex-col items-center gap-[6px] group/btn">
                  <div className="size-[52px] rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center group-hover/btn:bg-black/60 transition-all border border-white/20 shadow-xl group-active/btn:scale-95 text-white">
                    <svg className="size-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" /></svg>
                  </div>
                  <span className="text-white font-bold text-[12px] drop-shadow-md">3.2천</span>
                </button>
                <button className="flex flex-col items-center gap-[6px] group/btn">
                  <div className="size-[52px] rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center group-hover/btn:bg-black/60 transition-all border border-white/20 shadow-xl group-active/btn:scale-95 text-white">
                    <svg className="size-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  </div>
                  <span className="text-white font-bold text-[12px] drop-shadow-md">공유</span>
                </button>
              </div>

              {/* 하단 메타 데이터 */}
              <div className="absolute bottom-[40px] left-[20px] right-[100px] flex flex-col gap-[8px] z-10">
                <div className="flex flex-col gap-[4px]">
                  <Heading level={2} className="!text-[28px] font-[900] text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] leading-tight">{king.videoTitle}</Heading>
                  <div className="flex flex-wrap gap-[6px]">
                    {king.tags.map(tag => (
                      <span key={tag} className="text-[12px] font-bold text-yellow-400 drop-shadow-md">{tag}</span>
                    ))}
                  </div>
                </div>

                <div 
                  className="flex items-center gap-[8px] mt-[10px] cursor-pointer group/profile active:scale-95 transition-transform"
                  onClick={() => {
                    // 유저 프로필로 이동 (여기서는 해당 유저의 폴더 리스트 혹은 단순 프로필 노출로 시뮬레이션)
                    setIsReelsMode(false);
                    setActiveTab('favorites');
                    // 실제 구현 시 해당 유저 번호로 데이터 필터링 로직 필요
                    alert(`실제 서비스에서는 @${king.name}님의 노래방으로 이동합니다!`);
                  }}
                >
                  <div className="size-[36px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white border border-white/30 text-[14px]">🎧</div>
                  <DetailText className="!text-[18px] font-bold text-white/90 drop-shadow-lg group-hover/profile:text-white transition-colors">@{king.name}</DetailText>
                  <div className="px-[8px] py-[2px] bg-white/20 backdrop-blur-md rounded-full text-[10px] text-white/80 font-bold border border-white/10 uppercase tracking-tighter">Follow</div>
                </div>
                
                <div className="flex items-center gap-[8px] mt-[12px] bg-white/10 backdrop-blur-md px-[12px] py-[8px] rounded-xl border border-white/10 w-fit">
                   <svg className="size-[16px] text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                   <DetailText className="!text-[13px] font-medium text-white/90 drop-shadow-md truncate">오리지널 사운드 - {king.song}</DetailText>
                </div>
              </div>

              {/* 하단 중앙 기능 버튼 (업로드 버튼) */}
              <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-20">
                <button 
                  onClick={() => setIsReelUploadOpen(true)}
                  className="px-[24px] py-[14px] bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] text-white rounded-full font-black text-[15px] shadow-[0_10px_30px_rgba(142,45,226,0.6)] border border-white/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-[8px]"
                >
                  <svg className="size-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  내 노래 업로드 하기!
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ===== 업로드 모달 ===== */}
    {isReelUploadOpen && (
      <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={() => setIsReelUploadOpen(false)}>
        <div 
          className="w-full max-w-[560px] bg-white rounded-t-[32px] p-[28px] pb-[48px] flex flex-col gap-[20px] animate-in slide-in-from-bottom-full duration-400"
          onClick={e => e.stopPropagation()}
        >
          {/* 핸들 바 */}
          <div className="w-[48px] h-[4px] bg-[var(--color-border)] rounded-full mx-auto mb-[4px]" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <div className="size-[40px] rounded-[14px] bg-gradient-to-br from-[#8E2DE2] to-[#4A00E0] flex items-center justify-center shadow-lg">
                <svg className="size-[22px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <div>
                <Heading level={3} className="!text-[18px] font-black">내 노래 업로드</Heading>
                <DetailText className="text-[var(--color-text-tertiary)] !text-[12px]">FLO 가왕 피드에 등록됩니다</DetailText>
              </div>
            </div>
            <button onClick={() => setIsReelUploadOpen(false)} className="size-[36px] rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-tertiary)] transition-colors text-[18px]">✕</button>
          </div>

          {/* 곡 이름 - 기존 DB 매칭 필수 */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider">🎵 곡 이름 <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                value={reelUploadSongTitle}
                onChange={async (e) => {
                  setReelUploadSongTitle(e.target.value);
                  setReelUploadSongId(null);
                  if (e.target.value.length > 1) {
                    try {
                      const results = await searchKaraokeSongs(e.target.value);
                      if (results.length > 0) {
                        setReelUploadSongId(results[0].id);
                      }
                    } catch {}
                  }
                }}
                placeholder="곡명 또는 아티스트 입력 (기존 곡만 가능)"
                className={`w-full h-[52px] rounded-[16px] px-[18px] pr-[48px] text-[15px] font-medium border-2 focus:outline-none transition-all ${reelUploadSongId ? 'border-green-400 bg-green-50' : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] focus:border-[var(--color-static-accent)]'}`}
              />
              {reelUploadSongId && (
                <div className="absolute right-[14px] top-1/2 -translate-y-1/2 size-[24px] rounded-full bg-green-400 flex items-center justify-center">
                  <svg className="size-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                </div>
              )}
            </div>
            {reelUploadSongTitle.length > 0 && !reelUploadSongId && (
              <DetailText className="text-orange-500 !text-[12px] font-bold">⚠️ 일치하는 곡을 찾지 못했어요. 다른 이름으로 검색해 보세요.</DetailText>
            )}
            {reelUploadSongId && (
              <DetailText className="text-green-600 !text-[12px] font-bold">✅ 곡 매칭 완료! 이 곡으로 등록됩니다.</DetailText>
            )}
          </div>

          {/* 영상 제목 */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider">🎬 영상 제목</label>
            <input
              type="text"
              value={reelUploadTitle}
              onChange={e => setReelUploadTitle(e.target.value)}
              placeholder="예: 코노에서 즉흥으로 불러봄 ㅋㅋ"
              maxLength={60}
              className="w-full h-[52px] rounded-[16px] px-[18px] text-[15px] font-medium border-2 border-[var(--color-border)] bg-[var(--color-surface-secondary)] focus:outline-none focus:border-[var(--color-static-accent)] transition-all"
            />
            <DetailText className="text-right text-[var(--color-text-tertiary)] !text-[11px]">{reelUploadTitle.length}/60</DetailText>
          </div>

          {/* 태그 */}
          <div className="flex flex-col gap-[8px]">
            <label className="text-[13px] font-black text-[var(--color-text-secondary)] uppercase tracking-wider">🏷️ 태그 <span className="text-[var(--color-text-tertiary)] font-normal normal-case">(쉼표로 구분)</span></label>
            <input
              type="text"
              value={reelUploadTags}
              onChange={e => setReelUploadTags(e.target.value)}
              placeholder="#팝송, #고음, #코인노래방"
              className="w-full h-[52px] rounded-[16px] px-[18px] text-[15px] font-medium border-2 border-[var(--color-border)] bg-[var(--color-surface-secondary)] focus:outline-none focus:border-[var(--color-static-accent)] transition-all"
            />
            {reelUploadTags && (
              <div className="flex flex-wrap gap-[6px] mt-[4px]">
                {reelUploadTags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="px-[10px] py-[4px] rounded-full bg-[var(--color-static-accent)]/10 text-[var(--color-static-accent)] text-[12px] font-bold border border-[var(--color-static-accent)]/20">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            disabled={!reelUploadSongId}
            onClick={() => {
              if (!reelUploadSongId) return;
              alert(`🎉 업로드 완료!\n제목: ${reelUploadTitle || '(제목 없음)'}\n태그: ${reelUploadTags}\n\n실제 서비스에서는 영상 파일도 함께 업로드됩니다!`);
              setIsReelUploadOpen(false);
              setReelUploadTitle('');
              setReelUploadTags('');
              setReelUploadSongId(null);
              setReelUploadSongTitle('');
            }}
            className="w-full h-[60px] rounded-[20px] bg-gradient-to-r from-[#8E2DE2] to-[#4A00E0] text-white font-black text-[18px] shadow-[0_10px_30px_rgba(142,45,226,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          >
            {reelUploadSongId ? '🎤 FLO 가왕 피드에 올리기!' : '곡을 먼저 선택해주세요'}
          </button>
        </div>
      </div>
    )}

  </main>
  )
}

export default function KaraokeApp() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-bg)]"><Spinner /></div>}>
      <KaraokeAppContent />
    </Suspense>
  )
}
