import type { Metadata } from 'next';
import { ProfileShell } from '@/components/profile/profile-shell';

export const metadata: Metadata = { title: 'حساب کاربری' };

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <ProfileShell>{children}</ProfileShell>;
}
