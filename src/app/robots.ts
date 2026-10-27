import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mims.sch.ng';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/admissions',
          '/admissions/apply',
          '/admissions/status',
          '/docs',
          '/contact',
          '/login',
          '/images/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/bursar',
          '/bursar/*',
          '/teachers',
          '/teachers/*',
          '/students',
          '/students/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
