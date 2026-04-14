import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const via = searchParams.get('via')

    if (code && via === 'electron') {
        // This request came from the external browser after Google OAuth.
        // Don't exchange the code here — redirect the browser to the custom
        // scheme so Electron receives the code and exchanges it using the PKCE
        // verifier stored in its own session.
        const params = new URLSearchParams()
        params.set('code', code)
        const state = searchParams.get('state')
        if (state) params.set('state', state)

        const deepLink = `turnover://auth?${params.toString()}`

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Returning to Turn-Over…</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
    .card { text-align: center; padding: 2rem; }
    a { color: #0070f3; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Authentication successful!</h2>
    <p>Returning to Turn-Over…</p>
    <p>If the app does not open automatically,<br>
       <a href="${deepLink}">click here to open Turn-Over</a>.</p>
  </div>
  <script>window.location.href = ${JSON.stringify(deepLink)};</script>
</body>
</html>`

        return new Response(html, { headers: { 'Content-Type': 'text/html' } })
    }

    if (code) {
        const supabase = await createClient()
        await supabase.auth.exchangeCodeForSession(code)
    }

    return NextResponse.redirect(`${origin}/dashboard`)
}
