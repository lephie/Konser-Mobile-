import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.13:5000/api';

export const authApi = {

    login: async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                return { ok: false, message: data.message || 'Email atau Password salah' };
            }

            const responseData = data.data || data;

            if (!responseData.token) {
                return { ok: false, message: 'Token tidak ditemukan' };
            }

            await SecureStore.setItemAsync('user_token', responseData.token);
            await SecureStore.deleteItemAsync('token');

            const userObject = {
                id: responseData.id,
                name: responseData.name,
                email: email,
                phone: responseData.phone || '',
                role: responseData.role
            };

            return { ok: true, user: userObject };

        } catch (error) {
            console.error('Login error:', error);
            return {
                ok: false,
                message: 'Terjadi kesalahan saat login'
            };
        }
    },


    register: async (name: string, email: string, phone: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Gagal melakukan pendaftaran')
            }

            const responseData = data.data || data
            const userObject = {
                name: responseData.name,
                email: email,
                phone: responseData.phone || '',
                role: responseData.role,
                id: responseData.id
            };
            if (data.token) {
                await SecureStore.setItemAsync('user_token', responseData.token);
            }

            return { ok: true, user: userObject }

        } catch (error: any) {
            throw new Error(error.message || 'Terjadi kesalahan pada server');
        }
    },

    logout: async () => {
        try {
            await SecureStore.deleteItemAsync('user_token')
        } catch (error) {
            console.error('Logout error', error);
        }
    },

    getProfile: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            if (!token) return null;

            const response = await fetch(`${API_URL}/auth/getMe`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) return null;
            const data = await response.json();
            return data.user;
        } catch (error) {
            return null;
        }
    },
}