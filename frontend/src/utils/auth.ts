import { User } from '../types';

const TOKEN_KEY = 'civic_auth_token';
const USER_KEY = 'civic_user_data';

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const isOfficer = (user: User | null): boolean => {
  return user?.role === 'officer';
};

export const isCitizen = (user: User | null): boolean => {
  return user?.role === 'citizen';
};