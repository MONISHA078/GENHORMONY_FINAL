import api from './api';

const songService = {
  listSongs: async () => {
    const response = await api.get('/songs');
    return response.data;
  },

  uploadSong: async (formData) => {
    // Note: Multipart file upload requires specific headers
    const response = await api.post('/songs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  importCsv: async (formData) => {
    const response = await api.post('/songs/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteSong: async (songId) => {
    const response = await api.delete(`/songs/${songId}`);
    return response.data;
  },

  getStreamUrl: (songId) => {
    // Return direct authenticated streaming path
    return `/api/v1/songs/stream/${songId}`;
  },

  getRecommendations: async (emotion) => {
    const path = emotion ? `/songs/recommend?emotion=${emotion}` : '/songs/recommend';
    const response = await api.get(path);
    return response.data;
  },

  generateMusic: async (emotionTag, prompt, duration = 15) => {
    const response = await api.post('/songs/generate', {
      emotion_tag: emotionTag,
      prompt: prompt || undefined,
      duration: duration,
    });
    return response.data;
  },

  listGeneratedHistory: async () => {
    const response = await api.get('/songs/generated/history');
    return response.data;
  },

  getGeneratedStreamUrl: (generatedMusicId) => {
    return `/api/v1/songs/stream/generated/${generatedMusicId}`;
  },
};

export default songService;
