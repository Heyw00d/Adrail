import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AdRail',
  description: 'Payment rails for agent advertising',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'AdRail Blog RSS', href: '/feed.xml' }],
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
      { text: 'Blog', link: '/blog/' },
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
            { text: 'Payments', link: '/api/payments' },
            { text: 'AdCP', link: '/api/adcp' }
          ]
        }
      ],
      '/blog/': [
        {
          text: 'Latest Posts',
          items: [
            { text: '← All Posts', link: '/blog/' },
            { text: 'The Future of Agentic Advertising', link: '/blog/future-of-agentic-advertising' },
            { text: 'The Hidden Tax: Programmatic Inefficiency', link: '/blog/programmatic-inefficiency' },
            { text: 'Why Publishers Deserve 95%', link: '/blog/why-publishers-deserve-95-percent' }
          ]
        },
        {
          text: 'Categories',
          items: [
            { text: 'Vision', link: '/blog/?category=vision' },
            { text: 'Industry', link: '/blog/?category=industry' },
            { text: 'Product', link: '/blog/?category=product' }
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
