---
layout: page
title: Blog
description: Thought leadership on agentic advertising, programmatic efficiency, and the future of AI-powered commerce.
---

<script setup>
import { data as posts } from '../.vitepress/theme/posts.data.js'
</script>

# AdRail Blog

Insights on agent advertising, programmatic efficiency, and building the future of AI-powered commerce.

<div class="blog-filters">
  <span class="filter-label">Filter:</span>
  <a href="#" class="filter-tag active">All</a>
  <a href="#" class="filter-tag">Industry</a>
  <a href="#" class="filter-tag">Product</a>
  <a href="#" class="filter-tag">Vision</a>
</div>

<div class="blog-list">
  <article v-for="post in posts" :key="post.url" class="blog-card">
    <a :href="post.url" class="blog-card-link">
      <div class="blog-card-image" v-if="post.heroImage">
        <img :src="post.heroImage" :alt="post.title" />
      </div>
      <div class="blog-card-content">
        <div class="blog-meta">
          <span class="blog-category">{{ post.category }}</span>
          <span class="blog-date">{{ post.date }}</span>
          <span class="blog-reading-time">{{ post.readingTime }} min read</span>
        </div>
        <h2 class="blog-title">{{ post.title }}</h2>
        <p class="blog-excerpt">{{ post.excerpt }}</p>
        <div class="blog-author">
          <img :src="post.author.avatar" :alt="post.author.name" class="author-avatar" />
          <div class="author-info">
            <span class="author-name">{{ post.author.name }}</span>
            <span class="author-role">{{ post.author.role }}</span>
          </div>
        </div>
      </div>
    </a>
  </article>
</div>

<div class="rss-link">
  <a href="/feed.xml" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="6.18" cy="17.82" r="2.18"/>
      <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>
    </svg>
    Subscribe via RSS
  </a>
</div>

<style>
.blog-filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 2rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.filter-label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.filter-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  transition: all 0.2s;
}

.filter-tag:hover,
.filter-tag.active {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.blog-list {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}

.blog-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  background: var(--vp-c-bg-soft);
}

.blog-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.blog-card-link {
  text-decoration: none;
  color: inherit;
}

.blog-card-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.blog-card-content {
  padding: 1.5rem;
}

.blog-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
}

.blog-category {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.blog-title {
  font-size: 1.4rem;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  color: var(--vp-c-text-1);
}

.blog-excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.blog-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 1rem;
  border-top: 1px solid var(--vp-c-divider);
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.author-role {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.rss-link {
  margin-top: 3rem;
  text-align: center;
}

.rss-link a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  transition: color 0.2s;
}

.rss-link a:hover {
  color: var(--vp-c-brand-1);
}
</style>
