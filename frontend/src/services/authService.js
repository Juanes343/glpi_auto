import client from '../api/client';

export const login  = (credentials) => client.post('/auth/login', credentials);
export const me     = ()             => client.get('/auth/me');
export const logout = ()             => client.post('/auth/logout');
