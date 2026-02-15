---
title: "Why Publishers Deserve 95%: Our Revenue Share Philosophy"
description: "The economic case for giving publishers the lion's share—and why we believe this creates a better advertising ecosystem."
date: 2026-02-08
author:
  name: AdRail Team
  avatar: /blog/avatars/adrail-team.svg
  role: Engineering & Research
category: Product
tags: [publishers, revenue-share, economics, philosophy]
heroImage: /blog/images/publisher-value.svg
readingTime: 5
---

<script setup>
import BlogPost from '../.vitepress/theme/BlogPost.vue'
</script>

<BlogPost :frontmatter="$frontmatter">

# Why Publishers Deserve 95%: Our Revenue Share Philosophy

When we announced AdRail's 95/5 revenue split—95% to publishers, 5% to the platform—the most common reaction was disbelief. How can you run a business on 5%? What's the catch?

There is no catch. Here's our reasoning.

## The Value Chain Reality

In any advertising transaction, value is created at two points:

1. **The advertiser** creates value by having something worth promoting
2. **The publisher** creates value by building an audience worth reaching

Intermediaries—ad tech platforms, verification services, data vendors—don't create value. They facilitate transactions. Facilitation is useful, but it's not value creation.

Current ad tech captures 40-60% of advertising spend for transaction facilitation. That's economically irrational.

## What 5% Actually Covers

Our 5% fee is designed to be exactly sustainable:

- **Smart contract deployment**: One-time cost per escrow, amortized across transactions
- **USDC settlement**: Near-zero on Base L2 (~$0.001 per transaction)
- **Infrastructure**: API hosting, monitoring, dispute resolution
- **Development**: Continued improvement of the protocol

We don't need more than 5% because our costs are fundamentally lower than legacy ad tech:

| Cost Center | Legacy Ad Tech | AdRail |
|-------------|---------------|--------|
| Server infrastructure | High | Minimal (on-chain) |
| Payment processing | 2-3% | ~0% (USDC) |
| Reconciliation | Manual | Automated |
| Fraud prevention | Expensive | Cryptographic |
| Collections | Slow & costly | Instant |

Blockchain settlement eliminates entire categories of cost that traditional platforms bear.

## The Incentive Alignment

A 95/5 split creates powerful incentive alignment:

**For Publishers:**
- Direct relationship with advertisers
- No incentive to maximize pageviews over quality
- Full transparency into transaction economics

**For Advertisers:**
- More efficient spend (95% reaches publishers vs. 50%)
- Publisher incentivized to deliver results, not volume
- Clear accountability through on-chain settlement

**For AdRail:**
- Scale requires happy publishers
- Growth comes from network effects, not margin capture
- Long-term sustainability over short-term extraction

## The Philosophical Case

Beyond economics, there's a philosophical argument for 95/5.

Publishers create the content agents consult. They build the trust agents rely on. They maintain the infrastructure agents access. Without publishers, there is no advertising ecosystem.

Advertising platforms are infrastructure—necessary but not sufficient. Infrastructure should be priced like infrastructure: low margin, high volume, utility-focused.

The ad tech industry's current margins are a historical accident, not an economic necessity. They emerged from information asymmetry (publishers didn't know what advertisers paid) and switching costs (integrating new platforms was expensive).

Blockchain removes both barriers. Information is public. Integration is standardized. The 95/5 split isn't generous—it's the natural equilibrium of transparent markets.

## What This Enables

When publishers keep 95%, they can:

- **Invest in quality**: Better content attracts more agents
- **Experiment with formats**: Lower stakes for trying new ad approaches
- **Build direct relationships**: Advertisers and publishers can collaborate without intermediary permission

Higher publisher revenue creates a virtuous cycle: better content → more agent trust → more advertising value → higher publisher revenue.

## Join Us

We're building advertising infrastructure designed for the agent economy—efficient, transparent, and fair.

Publishers: [Start earning 95%](/guide/publishers)

Advertisers: [See where your budget goes](/guide/advertisers)

---

*Questions about our model? Reach out at hello@adrail.ai or open an issue on [GitHub](https://github.com/Heyw00d/Adrail).*

</BlogPost>
