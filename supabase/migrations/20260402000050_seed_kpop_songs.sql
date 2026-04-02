-- Migration: seed_kpop_songs
-- K-POP 인기곡 데이터 대량 추가
INSERT INTO public.karaoke_songs (title, artist, cover_url, tj_number, ky_number, search_keywords, category) VALUES
('Ditto', 'NewJeans', 'https://i.scdn.co/image/ab67616d0000b2739d42398555e16886e08c5c7d', '82234', '44912', '뉴진스, 디토, ditto, NewJeans, 어도어', 'K-POP'),
('Hype Boy', 'NewJeans', 'https://i.scdn.co/image/ab67616d0000b2739d42398555e16886e08c5c7d', '81452', '44811', '뉴진스, 하입보이, 하입 보이, hype boy, NewJeans', 'K-POP'),
('I AM', 'IVE', 'https://i.scdn.co/image/ab67616d0000b27357321e25e24b7a1362080356', '82490', '44899', '아이브, 아이엠, I AM, ive, 장원영', 'K-POP'),
('LOVE DIVE', 'IVE', 'https://i.scdn.co/image/ab67616d0000b27357321e25e24b7a1362080356', '80712', '44766', '아이브, 러브 다이브, 러브다이브, love dive, ive', 'K-POP'),
('Antifragile', 'LE SSERAFIM', 'https://i.scdn.co/image/ab67616d0000b273617ea2d46e0e6490327f311a', '81881', '44844', '르세라핌, 안티프래질, antifragile, 르세라핌', 'K-POP'),
('Perfect Night', 'LE SSERAFIM', 'https://i.scdn.co/image/ab67616d0000b273617ea2d46e0e6490327f311a', '83556', '44977', '르세라핌, 퍼펙트 나이트, perfect night', 'K-POP'),
('Seven (feat. Latto)', 'Jungkook', 'https://i.scdn.co/image/ab67616d0000b2730591f8615abcb44b6aa3d132', '82991', '44922', '정국, 세븐, seven, bts, 방탄소년단', 'K-POP');
