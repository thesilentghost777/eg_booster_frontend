import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/api';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (telephone: string, code_pin: string) => Promise<User>;
  register: (data: {
    prenom: string;
    telephone: string;
    code_pin: string;
    code_pin_confirmation: string;
    email?: string;
    referral_code?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = api.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const response: any = await api.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      api.setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser();
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (telephone: string, code_pin: string): Promise<User> => {
    console.log('=== AuthContext: login() appelé ===');
    console.log('Téléphone:', telephone);
    
    const response: any = await api.login(telephone, code_pin);
    
    console.log('=== AuthContext: Réponse API brute ===');
    console.log('Response complète:', JSON.stringify(response, null, 2));
    console.log('response.success:', response.success);
    console.log('response.data exists:', !!response.data);
    
    if (response.success && response.data) {
      console.log('=== AuthContext: Traitement des données ===');
      console.log('Token reçu:', response.data.token ? 'OUI' : 'NON');
      console.log('User data:', JSON.stringify(response.data.user, null, 2));
      console.log('is_admin dans la réponse:', response.data.user?.is_admin);
      console.log('Type de is_admin:', typeof response.data.user?.is_admin);
      
      api.setToken(response.data.token);
      setUser(response.data.user);
      toast.success(response.message || 'Connexion réussie !');
      
      console.log('=== AuthContext: User défini dans le state ===');
      console.log('User stocké:', JSON.stringify(response.data.user, null, 2));
      
      // Retourner l'utilisateur pour permettre la redirection conditionnelle
      return response.data.user;
    } else {
      console.error('=== AuthContext: Échec de connexion ===');
      console.error('response.success:', response.success);
      console.error('response.data:', response.data);
      throw new Error(response.message || 'Erreur lors de la connexion');
    }
  };

  const register = async (data: {
    prenom: string;
    telephone: string;
    code_pin: string;
    code_pin_confirmation: string;
    email?: string;
    referral_code?: string;
  }): Promise<User> => {
    console.log('=== AuthContext: register() appelé ===');
    
    const response: any = await api.register(data);
    
    console.log('=== AuthContext: Réponse API register ===');
    console.log('Response complète:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      api.setToken(response.data.token);
      setUser(response.data.user);
      toast.success(response.message || 'Inscription réussie !');
      
      // Retourner l'utilisateur
      return response.data.user;
    } else {
      throw new Error(response.message || 'Erreur lors de l\'inscription');
    }
  };

  const logout = async () => {
    console.log('=== AuthContext: logout() appelé ===');
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.setToken(null);
      setUser(null);
      toast.success('Déconnexion réussie');
      console.log('=== AuthContext: Utilisateur déconnecté ===');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin || false,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}