import RegisterFrom from '@/auth/RegisterFrom';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'Register | SuperShop',
  description: 'Create a new account on SuperShop to get fast delivery and exclusive offers.',
};

const RegisterPage = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <RegisterFrom />
      </Suspense>
    </div>
  );
};

export default RegisterPage;
