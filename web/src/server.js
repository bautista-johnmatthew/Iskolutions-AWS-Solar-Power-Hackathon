import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

const app = new Hono()

// Serve static files (CSS, JS, icons)
app.use('/static/*', serveStatic({ root: './src' }))
app.use('/icons/*', serveStatic({ root: './src' }))

// Serve HTML templates
app.get('/', async (c) => {
  try {
    const file = Bun.file('./src/templates/index.html')
    const html = await file.text()
    return c.html(html)
  } catch (error) {
    return c.text('Index page not found', 404)
  }
})

app.get('/:page.html', async (c) => {
  const page = c.req.param('page')
  try {
    const file = Bun.file(`./src/templates/${page}.html`)
    const html = await file.text()
    return c.html(html)
  } catch (error) {
    return c.text(`Page ${page}.html not found`, 404)
  }
})

// API proxy to FastAPI backend
app.all('/api/*', async (c) => {
  const url = new URL(c.req.url)
  const backendUrl = `${process.env.API_URL || 'http://localhost:8000'}${url.pathname.replace('/api', '')}`
  
  try {
    const response = await fetch(backendUrl, {
      method: c.req.method,
      headers: c.req.header(),
      body: c.req.method !== 'GET' ? await c.req.text() : undefined,
    })
    
    const data = await response.text()
    return new Response(data, {
      status: response.status,
      headers: response.headers,
    })
  } catch (error) {
    return c.json({ error: 'Backend service unavailable' }, 502)
  }
})

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

const port = process.env.PORT || 3000
console.log(`🚀 Frontend server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
