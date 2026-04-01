const axios = require('axios');
const fs = require('fs');

// [시스템] 관리자 키 승인됨 - 전체 DB 정제 시작
const SUPABASE_URL = 'https://okequzqjptgipeqvmxbb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZXF1enFqcHRnaXBlcXZteGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk0MjUxNCwiZXhwIjoyMDkwNTE4NTE0fQ.u_7vMVmtH0eIObP6hD5fUeOBHvcbhpeIbfLR0vEk3nw';
const FLO_SEARCH_URL = 'https://api.music-flo.com/search/v2/search';

// 아티스트 명칭 불일치 해결을 위한 별칭 맵
const ARTIST_ALIASES = {
    '(여자)아이들': ['i-dle', '아이들', '(g)i-dle'],
    'Kenshi Yonezu': ['요네즈 켄시', 'kenshi', '米津玄師'],
    'Yonezu Kenshi': ['요네즈 켄시', 'kenshi', '米津玄師'],
    'Jay Chou': ['주걸륜', 'jay chou', '周杰倫'],
    'Eric Chou': ['주흥철', 'eric chou', '周興哲'],
    'LE SSERAFIM': ['르세라핌'],
    'NewJeans': ['뉴진스'],
    'IVE (아이브)': ['ive', '아이브']
};

function cleanArtistName(name) {
    if (!name) return '';
    return name.replace(/\s+/g, '').replace(/\(.*\)/g, '').toLowerCase();
}

async function fetchAllSongs() {
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/karaoke_songs?select=*`, {
        headers: { 
            'apikey': SUPABASE_SERVICE_KEY, 
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` 
        }
    });
    return response.data;
}

async function searchFlo(title, artist) {
    const cleanTitle = title.replace(/\(.*\)/g, '').trim();
    const searchKeywords = [
        `${title} ${artist}`,
        `${cleanTitle} ${artist}`,
        title,
        cleanTitle
    ];

    const aliases = ARTIST_ALIASES[artist] || [];
    const targetNames = [artist, ...aliases].map(a => cleanArtistName(a));

    for (const keyword of searchKeywords) {
        try {
            const response = await axios.get(FLO_SEARCH_URL, {
                params: {
                    sortType: 'ACCURACY',
                    searchType: 'TRACK',
                    keyword: keyword,
                    queryType: 'system',
                    mixYn: 'Y',
                    page: 1,
                    size: 15
                },
                headers: {
                    'Accept': 'application/json',
                    'x-gm-app-name': 'FLO_WEB',
                    'x-gm-app-version': '2.4.0'
                }
            });

            const tracks = response.data?.data?.list?.[0]?.list || [];
            
            // 아티스트 일치 여부 정밀 확인
            const matchedTrack = tracks.find(t => {
                const floArtistList = t.artistList?.map(a => cleanArtistName(a.name)) || [];
                return floArtistList.some(fa => targetNames.some(tn => fa.includes(tn) || tn.includes(fa)));
            });

            if (matchedTrack) {
                const trackId = matchedTrack.id || matchedTrack.trackId;
                const coverUrl = matchedTrack.album?.imgList?.find(img => img.size === 500)?.url 
                                || matchedTrack.album?.imgList?.[0]?.url;

                // 디버깅: 윤하 노래에 아이브 커버가 들어가는지 감시
                if (artist === '윤하' && coverUrl.includes('412481763')) {
                    console.log(`[경고] "${title}" 검색 중 오매칭 감지됨. 스킵.`);
                    return null;
                }

                return {
                    floTrackId: String(trackId),
                    coverUrl: coverUrl ? coverUrl.split('?')[0] + '?dims/resize/500x500/quality/90' : null
                };
            }
        } catch (e) { }
    }
    return null;
}

async function updateDb(songId, floData) {
    try {
        await axios.patch(`${SUPABASE_URL}/rest/v1/karaoke_songs?id=eq.${songId}`, {
            flo_track_id: floData.floTrackId,
            cover_url: floData.coverUrl
        }, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
        });
        return true;
    } catch (e) {
        console.error(`[오류] DB 업데이트 실패: ${e.message}`);
        return false;
    }
}

async function main() {
    console.log('🏁 [시스템] 어드민 권한 정밀 복구 시스템 가동...');
    const songs = await fetchAllSongs();
    console.log(`총 ${songs.length}곡을 점검합니다.`);
    
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        process.stdout.write(`[${i+1}/${songs.length}] "${song.title}" (${song.artist})... `);
        
        const data = await searchFlo(song.title, song.artist);
        if (data) {
            const ok = await updateDb(song.id, data);
            if (ok) {
                console.log(`✅ 정제 완료: ${data.floTrackId}`);
            } else {
                console.log(`❌ DB 반영 실패`);
            }
        } else {
            console.log(`❌ FLO 데이터 수급 실패`);
        }
        // API 부하 방지
        await new Promise(r => setTimeout(r, 300));
    }
    
    console.log('✨ [시스템] 모든 곡의 메타데이터 정제가 완료되었습니다.');
    console.log('이제 앱에서 깨끗한 정보를 확인하실 수 있습니다.');
}

main().catch(console.error);
