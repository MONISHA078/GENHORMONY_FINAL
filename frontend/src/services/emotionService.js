import api from './api';

const emotionService = {
  analyzeText: async (text) => {
    const response = await api.post('/emotion/text', { text });
    return response.data;
  },

  analyzeSpeech: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    const response = await api.post('/emotion/speech', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  analyzeFace: async (imageBlob) => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'capture.jpg');
    const response = await api.post('/emotion/face', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  fuseEmotions: async (textScores, speechScores, faceScores) => {
    const response = await api.post('/emotion/fuse', {
      text_scores: textScores,
      speech_scores: speechScores,
      face_scores: faceScores,
    });
    return response.data;
  },
};

export default emotionService;
