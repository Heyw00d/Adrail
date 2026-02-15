// Blog posts data loader for VitePress
export default {
  load() {
    // Static blog post data
    // In production, this could scan the blog directory
    return [
      {
        url: '/blog/future-of-agentic-advertising',
        title: 'The Future of Agentic Advertising: When AI Agents Become the Audience',
        excerpt: 'Exploring how AI agents are transforming from ad blockers to ad interpreters—and why this changes everything for digital advertising.',
        date: 'February 15, 2026',
        category: 'Vision',
        tags: ['agents', 'advertising', 'ai', 'future'],
        readingTime: 8,
        heroImage: '/blog/images/agentic-future.svg',
        author: {
          name: 'AdRail Team',
          avatar: '/blog/avatars/adrail-team.svg',
          role: 'Engineering & Research'
        }
      },
      {
        url: '/blog/programmatic-inefficiency',
        title: 'The Hidden Tax: Why Programmatic Advertising Loses 60% Before Reaching Publishers',
        excerpt: 'Breaking down the ad tech supply chain and exposing where your advertising dollars actually go—and why agents deserve better.',
        date: 'February 12, 2026',
        category: 'Industry',
        tags: ['programmatic', 'ad-tech', 'efficiency', 'transparency'],
        readingTime: 6,
        heroImage: '/blog/images/ad-inefficiency.svg',
        author: {
          name: 'AdRail Team',
          avatar: '/blog/avatars/adrail-team.svg',
          role: 'Engineering & Research'
        }
      },
      {
        url: '/blog/why-publishers-deserve-95-percent',
        title: 'Why Publishers Deserve 95%: Our Revenue Share Philosophy',
        excerpt: 'The economic case for giving publishers the lion\'s share—and why we believe this creates a better advertising ecosystem.',
        date: 'February 8, 2026',
        category: 'Product',
        tags: ['publishers', 'revenue-share', 'economics', 'philosophy'],
        readingTime: 5,
        heroImage: '/blog/images/publisher-value.svg',
        author: {
          name: 'AdRail Team',
          avatar: '/blog/avatars/adrail-team.svg',
          role: 'Engineering & Research'
        }
      }
    ]
  }
}
