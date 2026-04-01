/**
 * FLO 검색 API를 통해 곡의 최신 메타데이터(앨범 커버 등)를 가져옵니다.
 */

export interface FloTrackMetadata {
  trackId: string
  coverUrl: string
  title: string
  artist: string
}

// 명백하게 잘못 매칭된 데이터 패턴 (예: 윤하 노래에 아이브 커버)을 감지하기 위한 블랙리스트
const KNOWN_MISMATCH_PATTERNS = [
  { artist: '윤하', invalidAlbumId: '412481763' }, // 아이브 I AM 앨범 ID
]

export function isMetadataMismatched(artist: string, coverUrl: string | null): boolean {
  if (!coverUrl) return false
  return KNOWN_MISMATCH_PATTERNS.some(pattern => 
    artist.includes(pattern.artist) && coverUrl.includes(pattern.invalidAlbumId)
  )
}

export async function fetchFloMetadata(title: string, artist: string): Promise<FloTrackMetadata | null> {
  try {
    // 괄호 안의 부가 정보 제거 (예: "Idol (Japanese Ver.)" -> "Idol")
    const cleanTitle = title.replace(/\(.*\)/g, '').trim()
    const keyword = `${cleanTitle} ${artist}`
    
    console.log(`[FLO API] 수급 시도: ${keyword}`)

    const params = new URLSearchParams({
      sortType: 'ACCURACY',
      searchType: 'TRACK',
      keyword: keyword,
      queryType: 'system',
      mixYn: 'Y',
      page: '1',
      size: '5',
    })

    // next.config.mjs의 rewrites 설정을 통해 api.music-flo.com으로 프록시됨
    const response = await fetch(`/api/search/v2/search?${params}`, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.error(`[FLO API] HTTP 오류: ${response.status}`)
      return null
    }

    const json = await response.json()
    const tracks = json.data?.list?.[0]?.list || []

    if (tracks.length === 0) {
      console.warn(`[FLO API] 검색 결과 없음: ${keyword}`)
      return null
    }

    // 아티스트 명칭 유사도 검증 로직 추가 (최소한의 안전장치)
    const track = tracks.find((t: any) => {
      const floArtist = t.artistList?.[0]?.name?.toLowerCase() || ''
      const targetArtist = artist.toLowerCase()
      return floArtist.includes(targetArtist) || targetArtist.includes(floArtist) || targetArtist.includes('아이들') // 아이들 예외처리
    }) || tracks[0]

    const trackId = track.id || track.trackId
    const coverUrl = track.album?.imgList?.find((img: any) => img.size === 500)?.url 
                  || track.album?.imgList?.[0]?.url

    if (!coverUrl) return null

    const result = {
      trackId: String(trackId),
      coverUrl: coverUrl.split('?')[0] + '?dims/resize/500x500/quality/90',
      title: track.name || track.title,
      artist: track.artistList?.[0]?.name || '',
    }
    
    console.log(`[FLO API] 수급 성공: ${result.title} / ${result.artist}`)
    return result
  } catch (error) {
    console.error('[FLO API] 시스템 오류:', error)
    return null
  }
}
