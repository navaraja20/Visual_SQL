export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://visual-sql-backend.vercel.app';

export const API_ENDPOINTS = {
  modules: `${API_BASE_URL}/api/modules`,
  query: `${API_BASE_URL}/api/query/execute`,
  exercises: `${API_BASE_URL}/api/exercises`,
  schemas: `${API_BASE_URL}/api/schemas`,
  health: `${API_BASE_URL}/api/health`,
};
