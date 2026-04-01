-- Migration: update_more_kpop_metadata
-- 주요 K-POP 곡들의 트랙 ID와 앨범 커버를 대폭 업데이트합니다.

-- 1. 아이브 (IVE)
UPDATE public.karaoke_songs SET flo_track_id = '452331456', cover_url = 'https://cdn.music-flo.com/image/v2/album/456/101/01/01/401101456_60fcf456_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Love Dive%';
UPDATE public.karaoke_songs SET flo_track_id = '45066609', cover_url = 'https://cdn.music-flo.com/image/v2/album/450/666/09/04/409666450_633e89a1_o.jpg?1665042851063/dims/resize/500x500/quality/90' WHERE title ILIKE '%After LIKE%';

-- 2. 뉴진스 (NewJeans)
UPDATE public.karaoke_songs SET flo_track_id = '456421595', cover_url = 'https://cdn.music-flo.com/image/v2/album/847/826/08/04/408826847_62e7289c_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Attention%';
UPDATE public.karaoke_songs SET flo_track_id = '463581125', cover_url = 'https://cdn.music-flo.com/image/v2/album/103/103/01/04/411893103_63a1523c_o.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%OMG%';

-- 3. 르세라핌 (LE SSERAFIM)
UPDATE public.karaoke_songs SET flo_track_id = '486596159', cover_url = 'https://cdn.music-flo.com/image/v2/album/930/573/18/04/418573930_653a535d_s.jpg?1698321246494/dims/resize/500x500/quality/90' WHERE title ILIKE '%Perfect Night%';

-- 4. 에스파 (aespa)
UPDATE public.karaoke_songs SET flo_track_id = '487807907', cover_url = 'https://cdn.music-flo.com/image/v2/album/970/004/19/04/419004970_654c76ae_s.jpg?1699509936112/dims/resize/500x500/quality/90' WHERE title ILIKE '%Drama%';
UPDATE public.karaoke_songs SET flo_track_id = '444101456', cover_url = 'https://cdn.music-flo.com/image/v2/album/567/245/10/04/410245567_6345acde_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Next Level%';

-- 5. 아이유 (IU)
UPDATE public.karaoke_songs SET flo_track_id = '440019009', cover_url = 'https://cdn.music-flo.com/image/artist/009/019/00/04/400019009_5c9dadf0.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Celebrity%';

-- 6. AKMU
UPDATE public.karaoke_songs SET flo_track_id = '492386866', cover_url = 'https://cdn.music-flo.com/image/v2/album/144/776/20/04/420776144_6594b00e_o.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Love Lee%';

-- 7. BTS
UPDATE public.karaoke_songs SET flo_track_id = '437245890', cover_url = 'https://cdn.music-flo.com/image/v2/album/930/573/18/04/418573930_653a535d_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Dynamite%';
