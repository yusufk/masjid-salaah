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

    const resp = await fetch(`https://masjidboardlive.com/boards/api/board.php?${board}`)
    const data = await resp.text()

    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Cache-Control': 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }
}
