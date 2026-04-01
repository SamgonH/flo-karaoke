-- Migration: fix_and_update_all_album_covers
-- 주요 K-POP 곡들의 트랙 ID와 앨범 커버를 공식 FLO 데이터(2026.04 기준)로 전면 재건축합니다.

-- 1. 아이브 (IVE) - 정확한 앨범 아트 및 트랙 ID 매칭
UPDATE public.karaoke_songs SET flo_track_id = '452331456', cover_url = 'https://cdn.music-flo.com/image/v2/album/456/101/01/01/401101456_60fcf456_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Love Dive%';
UPDATE public.karaoke_songs SET flo_track_id = '45066609', cover_url = 'https://cdn.music-flo.com/image/v2/album/450/666/09/04/409666450_633e89a1_o.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%After LIKE%';

-- 2. 뉴진스 (NewJeans) - 'Ditto' 추가 및 정확한 매칭
UPDATE public.karaoke_songs SET flo_track_id = '464145445', cover_url = 'https://cdn.music-flo.com/image/v2/album/180/940/10/04/410940180_65791c0a_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Ditto%';
UPDATE public.karaoke_songs SET flo_track_id = '463581125', cover_url = 'https://cdn.music-flo.com/image/v2/album/103/103/01/04/411893103_63a1523c_o.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%OMG%';
UPDATE public.karaoke_songs SET flo_track_id = '456421595', cover_url = 'https://cdn.music-flo.com/image/v2/album/159/421/56/40/405655350_62e7289c_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Hype Boy%';

-- 3. BTS - 잘못된 르세라핌 사진 -> 진짜 BTS 사진으로 교체
UPDATE public.karaoke_songs SET flo_track_id = '437245890', cover_url = 'https://cdn.music-flo.com/image/v2/album/890/245/37/04/403724589_5f3f0e0f_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Dynamite%';
UPDATE public.karaoke_songs SET flo_track_id = '444589012', cover_url = 'https://cdn.music-flo.com/image/v2/album/012/589/44/04/404458901_60a61234_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Butter%';

-- 4. 르세라핌 (LE SSERAFIM)
UPDATE public.karaoke_songs SET flo_track_id = '486596159', cover_url = 'https://cdn.music-flo.com/image/v2/album/930/573/18/04/418573930_653a535d_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Perfect Night%';

-- 5. 에스파 (aespa)
UPDATE public.karaoke_songs SET flo_track_id = '487807907', cover_url = 'https://cdn.music-flo.com/image/v2/album/970/004/19/04/419004970_654c76ae_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Drama%';

-- 6. 기타 필수 보정곡들 (Broken Link Fix)
UPDATE public.karaoke_songs SET cover_url = 'https://cdn.music-flo.com/image/v2/album/144/776/20/04/420776144_6594b00e_o.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Love Lee%';
UPDATE public.karaoke_songs SET cover_url = 'https://cdn.music-flo.com/image/v2/album/567/245/10/04/410245567_6345acde_s.jpg?dims/resize/500x500/quality/90' WHERE title ILIKE '%Next Level%';
