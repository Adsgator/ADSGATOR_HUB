import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat') ?? '-23.5505'
  const lon = searchParams.get('lon') ?? '-46.6333'

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,precipitation_probability` +
      `&hourly=precipitation_probability` +
      `&timezone=America%2FSao_Paulo` +
      `&forecast_days=1`

    const res  = await fetch(url, { next: { revalidate: 1800 } })
    const json = await res.json() as {
      current: { temperature_2m: number; precipitation_probability: number }
      hourly:  { precipitation_probability: number[] }
    }

    const chuva2h = Math.round(
      (json.hourly.precipitation_probability.slice(0, 2).reduce((a, b) => a + b, 0)) / 2
    )

    return NextResponse.json({
      temp:   Math.round(json.current.temperature_2m),
      chuva:  json.current.precipitation_probability,
      chuva2h,
    })
  } catch {
    return NextResponse.json({ temp: null, chuva: null, chuva2h: null }, { status: 200 })
  }
}
