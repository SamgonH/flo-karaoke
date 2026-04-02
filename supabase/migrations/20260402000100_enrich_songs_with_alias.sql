-- Migration: enrich_songs_with_alias
-- 1. BTS - Dynamite (다이너마이트) 추가
INSERT INTO public.karaoke_songs (title, artist, cover_url, tj_number, ky_number, search_keywords, category) VALUES
('Dynamite', 'BTS', 'https://i.scdn.co/image/ab67616d0000b2734106511a2119eb50e3957ebc', '62295', '21966', '방탄소년단, 비티에스, bts, 다이너마이트, 다이 너 마이트, dynamite, bts dynamite', 'K-POP'),
('Idol (アイドル)', 'YOASOBI', 'https://i.scdn.co/image/ab67616d0000b27389ea6d35272a8da427be5a04', '68862', '44874', '요아소비, 아이돌, idol, 아히돌, 야소비, yoasobi idol, 요아소비 아이돌', '일본'),
('귀요미송', '하리', 'https://i.scdn.co/image/ab67616d0000b273eb23927233fcb78c6e9cc8e6', '36622', '44011', '귀요미 송, 하리, gwiyomi, 기요미, 기요미송', 'K-POP');

-- 2. 기존 곡들에 띄어쓰기 제약 없는 키워드 보강
UPDATE public.karaoke_songs 
SET search_keywords = search_keywords || ', 밤을달리다, 요아소비' 
WHERE title LIKE '%요루니카케루%';

UPDATE public.karaoke_songs 
SET search_keywords = search_keywords || ', 나이트댄서, 이마세' 
WHERE title LIKE '%나이트 댄서%';
