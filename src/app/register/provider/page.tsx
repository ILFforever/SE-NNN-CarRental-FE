import { Metadata } from 'next';
import RegisterProviderForm from '@/components/RegisterProviderForm';

export const metadata: Metadata = {
  title: 'Register as Car Provider | CEDT Rentals',
  description: 'Create a car provider account to partner with us.',
};

export default function RegisterProviderPage() {
  return (
    <main className="py-10 px-4">
      <RegisterProviderForm />
    </main>
  );
}