import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/meeting';

export const DEFAULT_AVATARS = [
  '/src/assets/images/avatar_ana_1790190833213.jpg',
  '/src/assets/images/avatar_marcos_1790190844647.jpg',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Zoey',
];

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (initialMode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SEED_USERS: User[] = [
  {
    id: 'user-helena',
    name: 'Helena Martins',
    email: 'helena@resenha.app',
    avatar: '/src/assets/images/avatar_ana_1790190833213.jpg',
    role: 'host',
    statusEmoji: '🍿',
    bio: 'Adoro maratonar filmes e bater papo com a galera!',
  },
  {
    id: 'user-marcos',
    name: 'Marcos Silva',
    email: 'marcos@resenha.app',
    avatar: '/src/assets/images/avatar_marcos_1790190844647.jpg',
    role: 'participant',
    statusEmoji: '🎮',
    bio: 'Sempre pronto pra resenha, games e boa música!',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('miazoom_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_USERS[0];
      }
    }
    return SEED_USERS[0];
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    const saved = localStorage.getItem('miazoom_users_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return SEED_USERS;
      }
    }
    return SEED_USERS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('miazoom_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('miazoom_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('miazoom_users_list', JSON.stringify(usersList));
  }, [usersList]);

  const login = async (email: string): Promise<boolean> => {
    const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsAuthModalOpen(false);
      return true;
    }
    // Create new quick user if not exists
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: DEFAULT_AVATARS[0],
      role: 'participant',
    };
    setUsersList(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      avatar: userData.avatar || DEFAULT_AVATARS[0],
    };
    setUsersList(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => (u.id === updated.id ? updated : u)));
  };

  const openAuthModal = (initialMode: 'login' | 'signup' = 'login') => {
    setAuthMode(initialMode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        login,
        signup,
        logout,
        updateProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
