import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Meeting endpoints
export const meetingAPI = {
  uploadAudio: async (formData: FormData) => {
    const response = await api.post('/meetings/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  createMeeting: async (data: any) => {
    const response = await api.post('/meetings/create', data);
    return response.data;
  },
  
  getAllMeetings: async (params?: any) => {
    const response = await api.get('/meetings', { params });
    return response.data;
  },
  
  getMeetingById: async (id: string) => {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  },
  
  updateMeeting: async (id: string, data: any) => {
    const response = await api.put(`/meetings/${id}`, data);
    return response.data;
  },
  
  deleteMeeting: async (id: string) => {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/meetings/stats/overview');
    return response.data;
  }
};

// Transcription endpoints
export const transcriptionAPI = {
  process: async (meetingId: string) => {
    const response = await api.post(`/transcriptions/process/${meetingId}`);
    return response.data;
  },
  
  getByMeeting: async (meetingId: string) => {
    const response = await api.get(`/transcriptions/meeting/${meetingId}`);
    return response.data;
  },
  
  updateSegment: async (segmentId: string, data: any) => {
    const response = await api.put(`/transcriptions/segment/${segmentId}`, data);
    return response.data;
  }
};

// Analysis endpoints
export const analysisAPI = {
  analyzeMeeting: async (meetingId: string) => {
    const response = await api.post(`/analysis/meeting/${meetingId}`);
    return response.data;
  },
  
  getAnalysis: async (meetingId: string) => {
    const response = await api.get(`/analysis/meeting/${meetingId}`);
    return response.data;
  },
  
  regenerateSection: async (meetingId: string, section: string) => {
    const response = await api.post(`/analysis/regenerate/${meetingId}`, { section });
    return response.data;
  }
};

// Export endpoints
export const exportAPI = {
  exportMarkdown: async (meetingId: string) => {
    const response = await api.get(`/export/markdown/${meetingId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  exportPDF: async (meetingId: string) => {
    const response = await api.get(`/export/pdf/${meetingId}`);
    return response.data;
  },

  exportDocx: async (meetingId: string) => {
    const response = await api.get(`/export/docx/${meetingId}`);
    return response.data;
  }
};

// System configuration endpoints
export const systemAPI = {
  getConfig: async () => {
    const response = await api.get('/config');
    return response.data;
  },

  getHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
