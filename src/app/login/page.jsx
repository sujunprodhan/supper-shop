import LoginFrom from '@/auth/LoginFrom';
import React from 'react';

export const metadata = {
  title: 'Sign In | SuperShop',
  description: 'Log in to your SuperShop account to manage your orders and cart.',
};

const LoginPage = () => {
  return (
    <div>
      <LoginFrom />
    </div>
  );
};

export default LoginPage;
