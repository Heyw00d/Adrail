import { serve } from '@hono/node-server';
import { app } from './app';

const port = parseInt(process.env.PORT || '3849');

console.log(`🚀 AdRail API starting on port ${port}`);

serve({
  fetch: app.fetch,
  port
});

console.log(`✅ AdRail API running at http://localhost:${port}`);
