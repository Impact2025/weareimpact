import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#FDFBF7] py-12 border-t border-slate-200">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
        <div className="mb-4 md:mb-0 flex items-center gap-3">
          <Image
            src="/WeAreImpact_hart.png"
            alt="WeAreImpact Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
          />
          <span>
            &copy; {new Date().getFullYear()} WeAreImpact. Alle rechten
            voorbehouden. LEGO&reg; is a trademark of the LEGO Group.
          </span>
        </div>
        <div className="flex space-x-6">
          <Link
            href="https://linkedin.com/in/vincentvanmunster"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-600 transition-colors"
          >
            LinkedIn
          </Link>
          <Link href="/privacy" className="hover:text-orange-600 transition-colors">
            Privacy
          </Link>
          <Link href="/voorwaarden" className="hover:text-orange-600 transition-colors">
            Voorwaarden
          </Link>
        </div>
      </div>
    </footer>
  );
}
