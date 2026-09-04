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
  Send,
  Briefcase,
  Building2,
  Users,
  Target,
  CheckSquare,
  ChevronDown,
  BarChart2,
  Zap,
  Search,
  Magnet,
  ListChecks,
  AlertTriangle,
  ClipboardList,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import IrisVoiceButton from '@/components/admin/IrisVoiceButton';
import MobileNav from '@/components/admin/MobileNav';
import PWAProvider from '@/components/admin/PWAProvider';

import { Calendar, Share2 } from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  subItems?: { label: string; href: string; icon: React.ComponentType<{ size?: number }> }[];
}

const sidebarItems: SidebarItem[] = [
  { label: 'Praat met Iris', href: '/admin/iris', icon: Sparkles },
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Agenda', href: '/admin/agenda', icon: Calendar },
  { label: 'Sprint Sessies', href: '/admin/sprint', icon: Rocket },
  {
    label: 'CRM',
    href: '/admin/crm',
    icon: Briefcase,
    subItems: [
      { label: 'Bedrijven', href: '/admin/crm/bedrijven', icon: Building2 },
      { label: 'Contacten', href: '/admin/crm/contacten', icon: Users },
      { label: 'Deals', href: '/admin/crm/deals', icon: Target },
      { label: 'Taken', href: '/admin/crm/taken', icon: CheckSquare },
    ]
  },
  {
    label: 'SEO Intelligence',
    href: '/admin/seo',
    icon: BarChart2,
    subItems: [
      { label: 'Prestaties', href: '/admin/seo', icon: BarChart2 },
      { label: 'CTR Booster', href: '/admin/seo?tab=ctr-booster', icon: Zap },
      { label: 'Keywords', href: '/admin/seo?tab=keywords', icon: Search },
      { label: 'Content audit', href: '/admin/seo/content-audit', icon: ClipboardList },
      { label: '404-log', href: '/admin/seo/404-logs', icon: AlertTriangle },
    ],
  },
  {
    label: 'Lead Machine',
    href: '/admin/lead-machine',
    icon: Magnet,
    subItems: [
      { label: 'Zoeken', href: '/admin/lead-machine', icon: Search },
      { label: 'Opgeslagen', href: '/admin/lead-machine?tab=saved', icon: ListChecks },
    ],
  },
  { label: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { label: 'Kennisbank', href: '/admin/kennisbank', icon: BookOpen },
  { label: 'Social', href: '/admin/social', icon: Share2 },
  { label: 'AI Scanner Leads', href: '/admin/leads', icon: Brain },
  { label: 'Contact Berichten', href: '/admin/contact', icon: Mail },
  { label: 'Nieuwsbrieven', href: '/admin/newsletter', icon: Send },
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // Auto-expand menus based on current path
  useEffect(() => {
    const toExpand: string[] = [];
    if (pathname.startsWith('/admin/crm') && !expandedMenus.includes('/admin/crm')) {
      toExpand.push('/admin/crm');
    }
    if (pathname.startsWith('/admin/seo') && !expandedMenus.includes('/admin/seo')) {
      toExpand.push('/admin/seo');
    }
    if (pathname.startsWith('/admin/lead-machine') && !expandedMenus.includes('/admin/lead-machine')) {
      toExpand.push('/admin/lead-machine');
    }
    if (toExpand.length > 0) {
      setExpandedMenus(prev => [...prev, ...toExpand]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (href: string) => {
    setExpandedMenus(prev =>
      prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]
    );
  };

  // PWA setup for admin
  useEffect(() => {
    // Set theme color for admin
    let themeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    themeColor.content = '#fb923c';

    // Add PWA meta tags for iOS
    const addMetaTag = (name: string, content: string) => {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    addMetaTag('apple-mobile-web-app-capable', 'yes');
    addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMetaTag('apple-mobile-web-app-title', 'WI Admin');
    addMetaTag('mobile-web-app-capable', 'yes');

    // Switch to admin manifest
    const existingManifest = document.querySelector('link[rel="manifest"]:not([data-admin])') as HTMLLinkElement;
    if (existingManifest) {
      existingManifest.setAttribute('data-original-href', existingManifest.href);
      existingManifest.href = '/manifest-admin.json';
      existingManifest.setAttribute('data-admin', 'true');
    } else {
      // Create manifest link if not exists
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = '/manifest-admin.json';
      manifest.setAttribute('data-admin', 'true');
      document.head.appendChild(manifest);
    }

    return () => {
      // Restore original manifest when unmounting
      const manifest = document.querySelector('link[rel="manifest"][data-admin]') as HTMLLinkElement;
      if (manifest) {
        const originalHref = manifest.getAttribute('data-original-href');
        if (originalHref) {
          manifest.href = originalHref;
          manifest.removeAttribute('data-original-href');
          manifest.removeAttribute('data-admin');
        }
      }
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
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            const isExpanded = expandedMenus.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.href}>
                {hasSubItems ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.href)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-4">
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            pathname === item.href
                              ? 'bg-orange-100 text-orange-700'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <LayoutDashboard size={16} />
                          <span>Overzicht</span>
                        </Link>
                        {item.subItems?.map((subItem) => {
                          // Compare only pathname, ignore query params
                          const isSubActive = pathname === subItem.href.split('?')[0];
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isSubActive
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <subItem.icon size={16} />
                              <span>{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
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
                )}
              </div>
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
