import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AdRail',
  description: 'Payment rails for agent advertising',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { property: 'og:title', content: 'AdRail Docs' }],
    ['meta', { property: 'og:description', content: 'Payment rails for agent advertising' }]
  ],
  sitemap: {
    hostname: 'https://docs.adrail.ai'
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/overview' },
      { text: 'GitHub', link: 'https://github.com/Heyw00d/Adrail' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is AdRail?', link: '/guide/what-is-adrail' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quickstart' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Publishers', link: '/guide/publishers' },
            { text: 'Advertisers', link: '/guide/advertisers' },
            { text: 'Escrows', link: '/guide/escrows' },
            { text: 'Impressions', link: '/guide/impressions' },
            { text: 'Payments', link: '/guide/payments' }
          ]
        },
        {
          text: 'Integrations',
          items: [
            { text: 'x402 Protocol', link: '/guide/x402' },
            { text: 'AdCP Integration', link: '/guide/adcp' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Authentication', link: '/api/authentication' },
            { text: 'Publishers', link: '/api/publishers' },
            { text: 'Advertisers', link: '/api/advertisers' },
            { text: 'Escrows', link: '/api/escrows' },
            { text: 'Impressions', link: '/api/impressions' },
            { text: 'Payments', link: '/api/payments' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Heyw00d/Adrail' }
    ],
    footer: {
      message: 'Built with x402 • USDC on Base',
      copyright: '© 2026 AdRail'
    }
  }
})
