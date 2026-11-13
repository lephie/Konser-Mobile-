import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../services/authApi';

type User = { 
  id?: string;
  name: string; 
  email: string; 
  phone: string;
  role?: string;
};

type AuthResult = { 
  ok: boolean; 
  message?: string; 
};

type Ctx = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, phone: string, pw: string) => Promise<{ ok: boolean; message?: string }>;
  updateProfile: (u: Partial<User>) => void;
  logout: () => void;
};

const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login: Ctx['login'] = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      
      if (!res.ok) {
        return { ok: false, message: res.message };
      }
      if(res.user){
        setUser(res.user);
        return{ok: true}
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, message: 'Terjadi kesalahan saat login' };
    }
  };

  const register: Ctx['register'] = async (name, email, phone, pw) => {
    try {
      const res = await authApi.register(name, email, phone, pw);

      if (!res.ok) {
        return { ok: false, message: res.message || 'Registrasi gagal'};
      }

      if (res.user) {
        setUser(res.user);
        return { ok: true };
      }

      return { ok: true };
    } catch (error) {
      return { ok: false, message: 'Terjadi kesalahan saat registrasi' };
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ 
      user, 
      login, 
      register, 
      logout,
      updateProfile: (u) => setUser((p) => (p ? { ...p, ...u } : p)) 
    }}>
      {children}
    </AuthCtx.Provider>
  );
}