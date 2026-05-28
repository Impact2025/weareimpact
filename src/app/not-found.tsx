import Link from 'next/link';
import { Home, BookOpen, FileText, Mail, ArrowRight } from 'lucide-react';
import { NotFoundLogger } from '@/components/features/NotFoundLogger';

const links = [
  { href: '/', label: 'Homepage', icon: Home },
  { href: '/kennisbank', label: 'Kennisbank', icon: BookOpen },
  { href: '/blog', label: 'Blog', icon: FileText },
  { href: '/contact', label: 'Contact', icon: Mail },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6">
      <NotFoundLogger />
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <span className="text-8xl font-black text-orange-600/20 select-none">404</span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Pagina niet gevonden
        </h1>
        <p className="text-slate-500 mb-10 leading-relaxed">
          De pagina die je zoekt bestaat niet (meer) of is verplaatst.
          Gebruik de links hieronder om verder te gaan.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-10">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all group"
            >
              <Icon size={18} className="text-slate-400 group-hover:text-orange-600 transition-colors flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                {label}
              </span>
              <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-orange-400 transition-colors" />
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-sm font-medium transition-all duration-300"
        >
          Terug naar home
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
