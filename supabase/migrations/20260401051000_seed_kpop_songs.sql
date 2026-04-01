-- Migration: seed_kpop_songs
-- 한국인이라면 누구나 부르는 노래방 필수곡들 추가

INSERT INTO public.karaoke_songs (title, artist, tj_number, ky_number, category, search_count, preview_count, favorite_count)
VALUES 
('Hype Boy', 'NewJeans', '81432', '24110', 'K-POP', 520, 1200, 340),
('Ditto', 'NewJeans', '82103', '24215', 'K-POP', 480, 1100, 310),
('사건의 지평선', '윤하', '80432', '23890', 'K-POP', 650, 900, 420),
('I AM', 'IVE (아이브)', '82541', '24430', 'K-POP', 590, 1300, 380),
('Love Dive', 'IVE (아이브)', '80921', '23980', 'K-POP', 430, 850, 290),
('Dynamite', 'BTS', '76431', '21210', 'K-POP', 310, 600, 210),
('Attention', 'NewJeans', '81231', '24090', 'K-POP', 390, 750, 260),
('After LIKE', 'IVE (아이브)', '81654', '24180', 'K-POP', 410, 800, 275),
('Tomboy', '(여자)아이들', '80211', '23790', 'K-POP', 350, 700, 240),
('Antifragile', 'LE SSERAFIM', '81920', '24220', 'K-POP', 370, 720, 230);
