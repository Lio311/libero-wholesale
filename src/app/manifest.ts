import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ליברו סיטונאות - B2B Wholesale',
    short_name: 'Libero',
    description: 'מערכת הזמנות סיטונאית מתקדמת לרשתות וחנויות קוסמטיקה. קטלוג עשיר, חיבור בזמן אמת למלאי ומערכת קומקס.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
