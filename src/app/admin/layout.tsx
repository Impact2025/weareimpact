'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Brain,
  MessageSquare,
  BookOpen,
  Sparkles,
  Mail,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import IrisVoiceButton from '@/components/admin/IrisVoiceButton';
import MobileNav from '@/components/admin/MobileNav';
import PWAProvider from '@/components/admin/PWAProvider';

import { Calendar } from 'lucide-react';

const sidebarItems = [
  { label: 'Praat met Iris', href: '/admin/iris', icon: Sparkles },
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Agenda', href: '/admin/agenda', icon: Calendar },
  { label: 'CRM', href: '/admin/crm', icon: Briefcase },
  { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { label: 'Kennisbank', href: '/admin/kennisbank', icon: BookOpen },
  { label: 'AI Scanner Leads', href: '/admin/leads', icon: Brain },
  { label: 'Contact Berichten', href: '/admin/contact', icon: Mail },
  { label: 'Chat Logs', href: '/admin/chats', icon: MessageSquare },
  { label: 'Instellingen', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Use admin-specific manifest for PWA installation
  useEffect(() => {
    // Find existing manifest link
    const existingManifest = document.querySelector('link[rel="manifest"]');

    // Create or update manifest link for admin
    let adminManifest = document.querySelector('link[data-admin-manifest]') as HTMLLinkElement;
    if (!adminManifest) {
      adminManifest = document.createElement('link');
      adminManifest.rel = 'manifest';
      adminManifest.setAttribute('data-admin-manifest', 'true');
      adminManifest.href = '/manifest-admin.json';
      document.head.appendChild(adminManifest);
    }

    // Hide original manifest while on admin
    if (existingManifest && !existingManifest.hasAttribute('data-admin-manifest')) {
      existingManifest.setAttribute('data-original-href', existingManifest.getAttribute('href') || '');
      existingManifest.removeAttribute('href');
    }

    return () => {
      // Restore original manifest when leaving admin
      if (existingManifest && existingManifest.hasAttribute('data-original-href')) {
        existingManifest.setAttribute('href', existingManifest.getAttribute('data-original-href') || '/manifest.json');
        existingManifest.removeAttribute('data-original-href');
      }
      adminManifest?.remove();
    };
  }, []);

  // Don't render admin layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <PWAProvider>
      <div className="min-h-screen bg-slate-100 pb-16 lg:pb-0">
        {/* Top Bar */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/admin" className="font-bold text-xl text-slate-900">
            WeAreImpact <span className="text-orange-600">Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
            Bekijk site
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={16} className="mr-2" />
            {loggingOut ? 'Uitloggen...' : 'Uitloggen'}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 z-40 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-6">{children}</div>
      </main>

      {/* Floating Iris Voice Button */}
      <IrisVoiceButton />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
    </PWAProvider>
  );
}
