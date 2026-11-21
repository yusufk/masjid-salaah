export default {
  async fetch(request) {
    const url = new URL(request.url)
    const board = url.searchParams.get('id') || 'greenside-rahmah'

    // Only allow known origins
    const origin = request.headers.get('Origin') || ''
    const referer = request.headers.get('Referer') || ''
    const allowed = ['masjidurrahmah.org.za', 'yusuf.kaka.co.za', 'yusufk.github.io']
    const isAllowed = allowed.some(d => origin.includes(d) || referer.includes(d)) || !origin

    if (!isAllowed) {
      return new Response('Forbidden', { status: 403 })
    }

    // Only allow specific board IDs
    if (!/^[a-z0-9-]+$/.test(board) || board.length > 50) {
      return new Response('Invalid board ID', { status: 400 })
    }

    const cors = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff'
    }

    try {
      // MasjidBoardLive removed its JSON API; boards are now server-rendered
      // HTML with the times embedded in an inline `let data = { ... }` object.
      // We fetch that page and extract the object.
      const upstream = `https://masjidboardlive.com/boards/?id=${encodeURIComponent(board)}`
      const resp = await fetch(upstream, {
        redirect: 'follow',
        headers: {
          // A real UA avoids any bot filtering on the origin.
          'User-Agent': 'Mozilla/5.0 (compatible; masjid-salaah-widget/1.0; +https://masjidurrahmah.org.za)',
          'Accept': 'text/html'
        }
      })

      if (!resp.ok) {
        return new Response(JSON.stringify({ error: 'upstream_status', status: resp.status }), { status: 502, headers: cors })
      }

      const html = await resp.text()
      const data = extractBoardData(html)

      if (!data || !data.fajrJamaah) {
        return new Response(JSON.stringify({ error: 'parse_failed' }), { status: 502, headers: cors })
      }

      return new Response(JSON.stringify({ data }), { headers: cors })
    } catch (err) {
      return new Response(JSON.stringify({ error: 'fetch_failed', detail: String(err) }), { status: 502, headers: cors })
    }
  }
}

/**
 * Extract the inline `let data = { key : "value", ... }` object from a
 * MasjidBoardLive board page and return it as a plain object.
 * The object uses unquoted keys and double-quoted string values.
 */
function extractBoardData(html) {
  const start = html.indexOf('let data = {')
  if (start === -1) return null
  const braceStart = html.indexOf('{', start)
  if (braceStart === -1) return null

  // Walk forward to the matching closing brace (values contain no braces,
  // but be safe and balance them, ignoring braces inside quoted strings).
  let depth = 0
  let inStr = false
  let quote = ''
  let end = -1
  for (let i = braceStart; i < html.length; i++) {
    const c = html[i]
    if (inStr) {
      if (c === quote && html[i - 1] !== '\\') inStr = false
      continue
    }
    if (c === '"' || c === "'") { inStr = true; quote = c; continue }
    if (c === '{') depth++
    else if (c === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) return null

  const body = html.slice(braceStart + 1, end)

  // Parse `key : "value"` pairs. Keys are bare identifiers; values are
  // double-quoted strings (possibly empty).
  const data = {}
  const re = /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*"((?:[^"\\]|\\.)*)"/g
  let m
  while ((m = re.exec(body)) !== null) {
    data[m[1]] = m[2].replace(/\\"/g, '"')
  }
  return Object.keys(data).length ? data : null
}
