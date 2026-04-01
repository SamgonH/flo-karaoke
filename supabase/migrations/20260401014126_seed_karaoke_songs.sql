-- Migration: seed_karaoke_songs
-- 테스트용 더미 곡 데이터 추가
INSERT INTO public.karaoke_songs (title, artist, cover_url, tj_number, ky_number, search_keywords, category) VALUES
('나이트 댄서 (NIGHT DANCER)', 'Imase', 'https://i.scdn.co/image/ab67616d0000b273b0606f7ba52240ab12f6d2ae', '68745', '44849', 'NIGHT DANCER, 이마세, imase', '일본'),
('요루니카케루 (夜に駆ける)', 'YOASOBI', 'https://i.scdn.co/image/ab67616d0000b273b1897e9e8f47c32cf9835706', '68212', '44605', '야소비, 요아소비, 밤을달리다, 밤을 달리다, 夜に駆ける, 밤에달리다', '일본'),
('레몬 (Lemon)', 'Yonezu Kenshi', 'https://i.scdn.co/image/ab67616d0000b273eb23927233fcb78c6e9cc8e6', '28841', '44265', '요네즈 켄시, yonezu kenshi, 레몬, lemon', '일본');
