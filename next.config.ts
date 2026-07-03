import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old service pages → huidige routes of homepage-anker
      { source: '/lego-serious-play', destination: '/kennisbank/categorie/lego-serious-play', permanent: true },
      { source: '/interim-management', destination: '/programmamanager-digitale-transformatie', permanent: true },
      { source: '/programmamanagement', destination: '/programmamanager-digitale-transformatie', permanent: true },
      { source: '/strategisch-advies', destination: '/', permanent: true },
      { source: '/over-ons', destination: '/', permanent: true },
      { source: '/over', destination: '/', permanent: true },
      { source: '/team', destination: '/', permanent: true },
      { source: '/diensten', destination: '/', permanent: true },
      { source: '/diensten/:path*', destination: '/', permanent: true },

      // Persoonlijk profiel — naam in URL is primair rankingsignaal
      { source: '/interim', destination: '/vincent-van-munster', permanent: true },

      // Varianten van bestaande landingspagina's
      { source: '/ai-readiness-scan', destination: '/ai-scan', permanent: true },
      { source: '/ai-scan-organisatie', destination: '/ai-scan', permanent: true },
      { source: '/ai-checklist', destination: '/ai-proof-checklist', permanent: true },
      { source: '/checklist', destination: '/ai-proof-checklist', permanent: true },
      { source: '/calculator', destination: '/impact-calculator', permanent: true },
      { source: '/impact', destination: '/impact-calculator', permanent: true },
      { source: '/welzijn', destination: '/ai-welzijn-expert', permanent: true },
      { source: '/ai-consultant', destination: '/ai-strategie-consultant', permanent: true },
      { source: '/change-management', destination: '/change-management-digitale-transformatie', permanent: true },

      // Nieuwe AI consulent pagina (Nederlandse term)
      { source: '/ai-consulent', destination: '/kennisbank/ai-consulent-sociaal-domein', permanent: true },
      { source: '/ai-consulent-sociaal-domein', destination: '/kennisbank/ai-consulent-sociaal-domein', permanent: true },

      // Veelgemaakte typfouten / URL-varianten
      { source: '/kennisbank/categorie', destination: '/kennisbank', permanent: true },
      { source: '/blog/page/:num', destination: '/blog', permanent: true },

      // Oude WordPress-URL's (verspillen crawl budget)
      { source: '/over-vincent-van-munster', destination: '/vincent-van-munster', permanent: true },
      { source: '/over-vincent-van-munster/', destination: '/vincent-van-munster', permanent: true },
      { source: '/algemene-voorwaarden-van', destination: '/', permanent: true },
      { source: '/algemene-voorwaarden-van/', destination: '/', permanent: true },
      { source: '/social-return-on-investment-de-basis-voor-beginners', destination: '/kennisbank', permanent: true },
      { source: '/social-return-on-investment-de-basis-voor-beginners/', destination: '/kennisbank', permanent: true },
      { source: '/wishlist-2', destination: '/', permanent: true },
      { source: '/wishlist-2/', destination: '/', permanent: true },
      { source: '/category/:path*', destination: '/kennisbank', permanent: true },
      { source: '/tag/:path*', destination: '/kennisbank', permanent: true },
      { source: '/portfolio-tag/:path*', destination: '/kennisbank', permanent: true },
      { source: '/maatschappelijke-impact/:path*', destination: '/', permanent: true },
      { source: '/:year(\\d{4})/:month(\\d{2})', destination: '/blog', permanent: true },
      { source: '/:year(\\d{4})/:month(\\d{2})/', destination: '/blog', permanent: true },

      // Oude HTML-extensie URL's
      { source: '/ai-voor-welzijnsorganisaties.html', destination: '/ai-welzijn-expert', permanent: true },

      // Kennisbank-consolidatie: keyword-kannibalisatie opgelost door duplicaten samen te voegen (2026-07-03)
      { source: '/kennisbank/interim-manager-kiezen-sociaal-domein', destination: '/kennisbank/interim-manager-kiezen-welzijn', permanent: true },
      { source: '/kennisbank/ai-implementeren-welzijn-stappenplan', destination: '/kennisbank/ai-implementeren-non-profit-stappenplan', permanent: true },
      { source: '/kennisbank/avg-ai-zorg-stappenplan', destination: '/kennisbank/privacy-ai-zorg-avg-checklist', permanent: true },
      { source: '/kennisbank/lego-serious-play-draagvlak-ai', destination: '/kennisbank/lego-serious-play-gemeenten-draagvlak', permanent: true },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'qqpeo17kbskzlisq.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Enable compression
  compress: true,

  // Optimize production builds
  poweredByHeader: false,

  // Strict mode for better development
  reactStrictMode: true,
};

export default nextConfig;
