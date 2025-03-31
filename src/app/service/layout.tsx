import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Services | CEDT Rentals',
  description: 'Explore our premium services and membership tier benefits at CEDT Rentals',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}