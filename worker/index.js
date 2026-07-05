export default {
  async fetch(request) {
    const url = new URL(request.url)
    const board = url.searchParams.get('id') || 'greenside-rahmah'
    const resp = await fetch(`https://masjidboardlive.com/boards/api/board.php?${board}`)
    const data = await resp.text()
    return new Response(data, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      }
    })
  }
}
