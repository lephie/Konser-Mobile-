
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.11.107:5000/api';

const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = await SecureStore.getItemAsync('user_token');

    if (!token) {
        throw new Error('Token login tidak ditemukan. Silakan login kembali.');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Terjadi kesalahan pada server');
    }

    return result.data ?? result;
};

export const notificationApi = {
    getAll: (page = 1, limit = 20) => request(`/notifications?page=${page}&limit=${limit}`),
    getUnread: () => request('/notifications/unread-count'),
    markAsRead: (id: number) => request(`/notifications/${id}/read`, { method: 'PATCH', }),

    markAllAsRead: () => request('/notifications/read-all', { method: 'PATCH', }),
    delete: (id: number) => request(`/notifications/${id}`, { method: 'DELETE', }),
};
