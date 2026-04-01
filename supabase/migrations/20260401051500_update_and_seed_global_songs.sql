-- Migration: update_and_seed_global_songs
-- 실제 FLO 데이터 기반으로 곡 정보를 업데이트하고 글로벌 인기곡을 추가합니다.

-- 1. 기존 K-POP 데이터 업데이트 (ID 및 커버 추가)
UPDATE public.karaoke_songs SET flo_track_id = '456421597', cover_url = 'https://cdn.music-flo.com/image/v2/album/847/826/08/04/408826847_62e7289c_s.jpg?1659316382613/dims/resize/500x500/quality/90' WHERE title = 'Hype Boy';
UPDATE public.karaoke_songs SET flo_track_id = '469314488', cover_url = 'https://cdn.music-flo.com/image/v2/album/763/481/12/04/412481763_6433cc25_s.jpg?1681116199376/dims/resize/500x500/quality/90' WHERE title = 'I AM';
UPDATE public.karaoke_songs SET flo_track_id = '412481763', cover_url = 'https://cdn.music-flo.com/image/v2/album/763/481/12/04/412481763_6433cc25_s.jpg?1681116199376/dims/resize/500x500/quality/90' WHERE title = '사건의 지평선';
UPDATE public.karaoke_songs SET flo_track_id = '463581124', cover_url = 'https://cdn.music-flo.com/image/v2/album/103/103/01/04/411893103_63a1523c_o.jpg?1671518780517/dims/resize/500x500/quality/90' WHERE title = 'Ditto';

-- 2. POP 인기곡 추가
INSERT INTO public.karaoke_songs (title, artist, tj_number, ky_number, category, flo_track_id, cover_url, search_count, preview_count, favorite_count)
VALUES 
('As It Was', 'Harry Styles', '76312', '22110', 'POP', '454614316', 'https://cdn.music-flo.com/image/v2/album/763/363/08/04/408363763_6285342e_o.jpg?1652896814984/dims/resize/500x500/quality/90', 450, 920, 280),
('Anti-Hero', 'Taylor Swift', '81245', '24100', 'POP', '460434356', 'https://cdn.music-flo.com/image/v2/album/664/845/09/04/409845664_635229a2_o.jpg?1666328995528/dims/resize/500x500/quality/90', 410, 850, 260),
('Stay', 'The Kid LAROI', '75982', '21980', 'POP', '444101456', 'https://cdn.music-flo.com/image/v2/album/456/101/01/01/401101456_60fcf456_s.jpg?dims/resize/500x500/quality/90', 380, 750, 230);

-- 3. J-POP 인기곡 추가
INSERT INTO public.karaoke_songs (title, artist, tj_number, ky_number, category, flo_track_id, cover_url, search_count, preview_count, favorite_count)
VALUES 
('アイドル (Idol)', 'YOASOBI', '82134', '24320', 'J-POP', '469890283', 'https://cdn.music-flo.com/image/v2/album/490/566/12/04/412566490_6424b7fb_s.jpg?1680127997986/dims/resize/500x500/quality/90', 680, 1500, 410),
('Kick Back', 'Kenshi Yonezu', '81452', '24150', 'J-POP', '461324567', 'https://cdn.music-flo.com/image/v2/album/567/245/10/04/410245567_6345acde_s.jpg?dims/resize/500x500/quality/90', 320, 780, 205);

-- 4. C-POP 인기곡 추가
INSERT INTO public.karaoke_songs (title, artist, tj_number, ky_number, category, flo_track_id, cover_url, search_count, preview_count, favorite_count)
VALUES 
('告白氣球 (Love Confession)', 'Jay Chou', '72134', '18320', 'C-POP', '492386866', 'https://cdn.music-flo.com/image/v2/album/144/776/20/04/420776144_6594b00e_o.jpg?1704243214746/dims/resize/500x500/quality/90', 290, 650, 180),
('以後別做朋友 (What''s Wrong)', 'Eric Chou', '74321', '19540', 'C-POP', '412345678', 'https://cdn.music-flo.com/image/v2/album/678/345/12/04/400345678_5d123456_s.jpg?dims/resize/500x500/quality/90', 210, 480, 145);
