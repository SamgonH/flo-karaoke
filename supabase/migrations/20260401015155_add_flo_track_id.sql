ALTER TABLE public.karaoke_songs ADD COLUMN flo_track_id TEXT;

UPDATE public.karaoke_songs 
SET flo_track_id='460975429' 
WHERE title='나이트 댄서 (NIGHT DANCER)';

UPDATE public.karaoke_songs 
SET flo_track_id='566438661' 
WHERE title='요루니카케루 (夜に駆ける)';

UPDATE public.karaoke_songs 
SET flo_track_id='446917276' 
WHERE title='레몬 (Lemon)';
