import { Metadata } from 'next';
import RegisterForm from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | CEDT Rentals',
  description: 'Create an account to book with us.',
};

export default function RegisterPage() {
  return (
    <main className="py-10 px-4">
      <RegisterForm />
    </main>
  );
}