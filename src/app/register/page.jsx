import RegisterFrom from '@/auth/RegisterFrom';
import React from 'react';

export const metadata = {
  title: 'Register | SuperShop',
  description: 'Create a new account on SuperShop to get fast delivery and exclusive offers.',
};

const RegisterPage = () => {
  return (
    <div>
      <RegisterFrom />
    </div>
  );
};

export default RegisterPage;
