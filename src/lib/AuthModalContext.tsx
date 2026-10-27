'use client';

import React, { createContext, useContext, useState } from 'react';
import AuthModal from '@/components/ui/AuthModal';

interface AuthModalContextType {
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialTab, setInitialTab] = useState<'login' | 'register'>('login');

  const openLoginModal = (): void => {
    setInitialTab('login');
    setIsOpen(true);
  };

  const openRegisterModal = (): void => {
    setInitialTab('register');
    setIsOpen(true);
  };

  const closeAuthModal = (): void => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openLoginModal, openRegisterModal, closeAuthModal }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        initialTab={initialTab}
        onClose={closeAuthModal}
      />
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = (): AuthModalContextType => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal debe ser utilizado dentro de un AuthModalProvider');
  }
  return context;
};
