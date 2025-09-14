// API Keys Configuration
// This file contains API keys and won't be ignored by .cursorignore

export const API_KEYS = {
  GEMINI: 'AIzaSyDOHC6sTNMpkn94JrtyU47t8J6n7ZokfZ0',
  SIMILARWEB: 'b38b0c5b7e204802b93f258fb6f6883c'
};

export const getGeminiApiKey = (): string => {
  return API_KEYS.GEMINI;
};

export const getSimilarWebApiKey = (): string => {
  return API_KEYS.SIMILARWEB;
};

