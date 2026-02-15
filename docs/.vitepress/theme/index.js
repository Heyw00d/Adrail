// Custom VitePress theme with blog support
import DefaultTheme from 'vitepress/theme'
import BlogPost from './BlogPost.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components
    app.component('BlogPost', BlogPost)
  }
}
