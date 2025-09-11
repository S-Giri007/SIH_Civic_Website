import axios from 'axios';
import { User, Issue } from '../types';
import { getAuthToken } from '../utils/auth';

const API_BASE_URL = 'https://sih-civic-website.onrender.com/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('civic_auth_token');
      localStorage.removeItem('civic_user_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth operations
export const registerUser = async (userData: Omit<User, '_id' | 'createdAt'>): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const loginUser = async (username: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error logging in:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user;
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user data');
  }
};

// Issue operations
export const createIssue = async (issue: Omit<Issue, '_id' | 'createdAt' | 'updatedAt'>): Promise<Issue> => {
  try {
    const response = await api.post('/issues', issue);
    return response.data.issue;
  } catch (error: any) {
    console.error('Error creating issue:', error);
    throw new Error(error.response?.data?.message || 'Failed to create issue');
  }
};

export const getIssues = async (filters?: { 
  status?: string; 
  category?: string; 
  assignedOfficer?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ issues: Issue[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const response = await api.get('/issues', { params: filters });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching issues:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch issues');
  }
};

export const updateIssue = async (id: string, updates: Partial<Issue>): Promise<Issue> => {
  try {
    const response = await api.put(`/issues/${id}`, updates);
    return response.data.issue;
  } catch (error: any) {
    console.error('Error updating issue:', error);
    throw new Error(error.response?.data?.message || 'Failed to update issue');
  }
};

export const getIssueById = async (id: string): Promise<Issue> => {
  try {
    const response = await api.get(`/issues/${id}`);
    return response.data.issue;
  } catch (error: any) {
    console.error('Error fetching issue:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch issue');
  }
};

export const assignIssue = async (id: string, officerId: string): Promise<Issue> => {
  try {
    const response = await api.patch(`/issues/${id}/assign`, { officerId });
    return response.data.issue;
  } catch (error: any) {
    console.error('Error assigning issue:', error);
    throw new Error(error.response?.data?.message || 'Failed to assign issue');
  }
};

export const getIssueStats = async (): Promise<{
  total: number;
  statusStats: Array<{ _id: string; count: number }>;
  categoryStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
}> => {
  try {
    const response = await api.get('/issues/stats/overview');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching issue stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
  }
};

// User operations
export const getUsers = async (filters?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}): Promise<{ users: User[]; total: number; totalPages: number; currentPage: number }> => {
  try {
    const response = await api.get('/users', { params: filters });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const updateUserProfile = async (id: string, updates: Partial<User>): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, updates);
    return response.data.user;
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};