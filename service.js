// service.ts
import TrackPlayer from 'react-native-track-player';

export async function playbackService() {
  TrackPlayer.addEventListener('remote-play', () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener('remote-pause', () => {
    TrackPlayer.pause();
  });
}
