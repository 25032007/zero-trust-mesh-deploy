import { Dashboard } from '@/components/dashboard/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zero-Trust Mesh - SOC Dashboard',
  description: 'Enterprise zero-trust access control and microservice security platform',
};

export default function Page() {
  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Dashboard />
    </main>
  );
}
