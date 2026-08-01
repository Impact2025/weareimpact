import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://weareimpact.nl';

  return {
    // Eén regelgroep voor alle crawlers. Bewust géén aparte Googlebot-/Bingbot-
    // groep: een user-agent-specifieke groep vervangt de *-groep volledig, wat
    // makkelijk tot afwijkend crawlgedrag leidt zodra hier iets bij komt.
    //
    // /_next/ en *.json worden NIET geblokkeerd: crawlers hebben de CSS/JS uit
    // /_next/ nodig om de pagina te renderen, en /manifest.json is onderdeel van
    // de mobiele beoordeling.
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
