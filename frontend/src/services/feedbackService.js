import api from './api';

const feedbackService = {
  submitFeedback: async (songId, generatedMusicId, rating, comment = '') => {
    const payload = { rating };
    if (songId) payload.song_id = songId;
    if (generatedMusicId) payload.generated_music_id = generatedMusicId;
    if (comment) payload.comment = comment;

    const response = await api.post('/feedback/submit', payload);
    return response.data;
  },
};

export default feedbackService;
