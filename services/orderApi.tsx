
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://192.168.1.13:5000/api';



const request = async (endpoint: string, options: RequestInit = {}) => {
    const token =
        await SecureStore.getItemAsync('user_token')
    if (token) {
        const payload = JSON.parse(
            atob(token.split('.')[1])
        );

        console.log('ORDER TOKEN USER ID:', payload.id);
    }


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

export const orderApi = {
    create: (concert_id: number, items: { ticket_tier_id: number; quantity: number }[]) =>
        request('/orders', {
            method: 'POST',
            body: JSON.stringify({ concert_id, items }),
        }),

    getById: (id: number) => request(`/orders/${id}`),

    getMyOrders: () => request('/orders'),

    cancel: (id: number) =>
        request(`/orders/${id}/cancel`, { method: 'POST' }),

    pay: (id: number) =>
        request(`/orders/${id}/pay`, { method: 'POST' }),

    checkStatus: (id: number) =>
        request(`/payment/${id}/status`),
};
