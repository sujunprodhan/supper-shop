import LoginFrom from '@/auth/LoginFrom';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'Sign In | SuperShop',
  description: 'Log in to your SuperShop account to manage your orders and cart.',
};

const LoginPage = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <LoginFrom />
      </Suspense>
    </div>
  );
};

export default LoginPage;
