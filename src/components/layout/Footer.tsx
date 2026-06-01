import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/WeAreImpact_hart.png"
                alt="WeAreImpact Logo"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold text-white">WeAreImpact</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4">
              AI consultant die mensen, teams en technologie verbindt.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/in/vincent-van-münster"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Diensten</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/ai-consultant-sociaal-domein"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  AI Consultant Sociaal Domein
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-strategie-consultant"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  AI Strategie Consultant
                </Link>
              </li>
              <li>
                <Link
                  href="/programmamanager-digitale-transformatie"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Programmamanager Digitale Transformatie
                </Link>
              </li>
              <li>
                <Link
                  href="/change-management-digitale-transformatie"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Change Management
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-scan"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Gratis AI-scan
                </Link>
              </li>
              <li>
                <Link
                  href="/kennisbank"
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  Kennisbank
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:v.munster@weareimpact.nl"
                  className="hover:text-orange-400 transition-colors"
                >
                  v.munster@weareimpact.nl
                </a>
              </li>
              <li>
                <a
                  href="tel:+31614470977"
                  className="hover:text-orange-400 transition-colors"
                >
                  06 - 144 709 77
                </a>
              </li>
              <li className="text-slate-500">
                Nieuw-Vennep / Hoofddorp
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Plan een gesprek
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <span>
              &copy; {new Date().getFullYear()} WeAreImpact. Alle rechten voorbehouden.
              LEGO&reg; is a trademark of the LEGO Group.
            </span>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-orange-400 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-orange-400 transition-colors">
                Cookies
              </Link>
              <Link href="/voorwaarden" className="hover:text-orange-400 transition-colors">
                Voorwaarden
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
