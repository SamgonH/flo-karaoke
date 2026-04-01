const axios = require('axios');
const fs = require('fs');

const SUPABASE_URL = 'https://okequzqjptgipeqvmxbb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_lwl-NA3lv-pkjf2Hy99aRQ_JY4LdzfG';
const FLO_SEARCH_URL = 'https://api.music-flo.com/search/v2/search';

const ARTIST_ALIASES = {
    '(여자)아이들': ['i-dle', '아이들', '(g)i-dle'],
    'Kenshi Yonezu': ['요네즈 켄시', 'kenshi', '米津玄師'],
    'Yonezu Kenshi': ['요네즈 켄시', 'kenshi', '米津玄師'],
    'Jay Chou': ['주걸륜', 'jay chou', '周杰倫'],
    'Eric Chou': ['주흥철', 'eric chou', '周興哲'],
    'IVE (아이브)': ['ive', '아이브', '아이브']
};

function cleanArtistName(name) {
    return name.replace(/\s+/g, '').replace(/\(.*\)/g, '').toLowerCase();
}

async function fetchAllSongs() {
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/karaoke_songs?select=id,title,artist`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
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
            const matchedTrack = tracks.find(t => {
                const floArtistList = t.artistList?.map(a => cleanArtistName(a.name)) || [];
                return floArtistList.some(fa => targetNames.some(tn => fa.includes(tn) || tn.includes(fa)));
            });

            if (matchedTrack) {
                const trackId = matchedTrack.id || matchedTrack.trackId;
                const coverUrl = matchedTrack.album?.imgList?.find(img => img.size === 500)?.url 
                                || matchedTrack.album?.imgList?.[0]?.url;

                return {
                    floTrackId: String(trackId),
                    coverUrl: coverUrl ? coverUrl.split('?')[0] + '?dims/resize/500x500/quality/90' : null
                };
            }
        } catch (e) { }
    }
    return null;
}

async function main() {
    console.log('-- Generating migration...');
    const songs = await fetchAllSongs();
    let sql = '-- Manual Metadata Fix Migration\n';
    
    for (const song of songs) {
        process.stdout.write(`Processing "${song.title}"... `);
        const data = await searchFlo(song.title, song.artist);
        if (data) {
            sql += `UPDATE public.karaoke_songs SET flo_track_id = '${data.floTrackId}', cover_url = '${data.coverUrl}' WHERE id = '${song.id}';\n`;
            console.log('✅ Found');
        } else {
            console.log('❌ Failed');
        }
        await new Promise(r => setTimeout(r, 400));
    }
    
    fs.writeFileSync('supabase/migrations/20260401084700_final_metadata_fix.sql', sql);
    console.log('-- Done! saved to migrations.');
}

main().catch(console.error);
