<template>
  <article class="blog-post">
    <header class="post-header">
      <div class="post-meta">
        <span class="post-category">{{ frontmatter.category }}</span>
        <span class="post-date">{{ formatDate(frontmatter.date) }}</span>
        <span class="post-reading-time">{{ frontmatter.readingTime }} min read</span>
      </div>
      
      <div v-if="frontmatter.heroImage" class="post-hero">
        <img :src="frontmatter.heroImage" :alt="frontmatter.title" />
      </div>
      
      <div class="post-author">
        <img :src="frontmatter.author.avatar" :alt="frontmatter.author.name" class="author-avatar" />
        <div class="author-details">
          <span class="author-name">{{ frontmatter.author.name }}</span>
          <span class="author-role">{{ frontmatter.author.role }}</span>
        </div>
      </div>
    </header>
    
    <div class="post-content">
      <slot />
    </div>
    
    <footer class="post-footer">
      <div class="post-tags">
        <span v-for="tag in frontmatter.tags" :key="tag" class="tag">
          #{{ tag }}
        </span>
      </div>
      
      <div class="share-buttons">
        <span class="share-label">Share:</span>
        <a :href="twitterShareUrl" target="_blank" rel="noopener" class="share-btn twitter" aria-label="Share on Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a :href="linkedinShareUrl" target="_blank" rel="noopener" class="share-btn linkedin" aria-label="Share on LinkedIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        <button @click="copyLink" class="share-btn copy" aria-label="Copy link">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </button>
      </div>
      
      <div class="related-posts">
        <h3>Related Posts</h3>
        <div class="related-list">
          <a v-for="post in relatedPosts" :key="post.url" :href="post.url" class="related-card">
            <span class="related-category">{{ post.category }}</span>
            <span class="related-title">{{ post.title }}</span>
          </a>
        </div>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({
  frontmatter: {
    type: Object,
    required: true
  }
})

const { page } = useData()

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const currentUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return `https://docs.adrail.ai${page.value.relativePath.replace('.md', '')}`
})

const twitterShareUrl = computed(() => {
  const text = encodeURIComponent(props.frontmatter.title)
  const url = encodeURIComponent(currentUrl.value)
  return `https://twitter.com/intent/tweet?text=${text}&url=${url}`
})

const linkedinShareUrl = computed(() => {
  const url = encodeURIComponent(currentUrl.value)
  return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
})

const copyLink = async () => {
  if (typeof navigator !== 'undefined') {
    await navigator.clipboard.writeText(currentUrl.value)
    alert('Link copied!')
  }
}

// Static related posts for now (could be dynamic based on tags)
const relatedPosts = computed(() => {
  const allPosts = [
    { url: '/blog/future-of-agentic-advertising', title: 'The Future of Agentic Advertising', category: 'Vision' },
    { url: '/blog/programmatic-inefficiency', title: 'The Hidden Tax: Programmatic Inefficiency', category: 'Industry' },
    { url: '/blog/why-publishers-deserve-95-percent', title: 'Why Publishers Deserve 95%', category: 'Product' }
  ]
  
  return allPosts
    .filter(post => !page.value.relativePath.includes(post.url.split('/').pop()))
    .slice(0, 2)
})
</script>

<style scoped>
.blog-post {
  max-width: 800px;
  margin: 0 auto;
}

.post-header {
  margin-bottom: 2rem;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.post-category {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.post-hero {
  margin: 1.5rem 0;
  border-radius: 12px;
  overflow: hidden;
}

.post-hero img {
  width: 100%;
  height: auto;
  display: block;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.author-role {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.post-content {
  line-height: 1.8;
}

.post-content :deep(h1) {
  display: none; /* Title shown in header */
}

.post-content :deep(h2) {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.post-content :deep(h3) {
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
}

.post-content :deep(p) {
  margin-bottom: 1.25rem;
}

.post-content :deep(blockquote) {
  border-left: 4px solid var(--vp-c-brand-1);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.post-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 2rem;
}

.tag {
  padding: 4px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.share-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2rem;
}

.share-label {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.share-btn:hover {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.related-posts {
  margin-top: 2rem;
}

.related-posts h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--vp-c-text-1);
}

.related-list {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .related-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.related-card {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid var(--vp-c-divider);
}

.related-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.related-category {
  font-size: 0.75rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  margin-bottom: 4px;
}

.related-title {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}
</style>
