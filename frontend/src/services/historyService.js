import api from './api';

const historyService = {
  recordPlay: async (songId, generatedMusicId) => {
    const payload = {};
    if (songId) payload.song_id = songId;
    if (generatedMusicId) payload.generated_music_id = generatedMusicId;
    
    const response = await api.post('/history/play', payload);
    return response.data;
  },

  getPlayHistory: async () => {
    const response = await api.get('/history/play');
    return response.data;
  },

  getEmotionHistory: async () => {
    const response = await api.get('/history/emotion');
    return response.data;
  },
};

export default historyService;
