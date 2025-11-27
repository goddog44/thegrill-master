import { useRef, useCallback } from 'react';

export const useSound = (soundUrl: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.volume = 0.5; // Volume à 50%
    audioRef.current.play().catch(err => console.log('Erreur audio:', err));
  }, [soundUrl]);

  return play;
};