import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat') ?? '-23.5505'
  const lon = searchParams.get('lon') ?? '-46.6333'

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,precipitation_probability,weather_code` +
      `&hourly=precipitation_probability` +
      `&timezone=America%2FSao_Paulo` +
      `&forecast_days=1`

    const res  = await fetch(url, { next: { revalidate: 1800 } })
    const json = await res.json() as {
      current: { temperature_2m: number; precipitation_probability: number; weather_code: number }
      hourly:  { precipitation_probability: number[] }
    }

    const chuva2h = Math.round(
      (json.hourly.precipitation_probability.slice(0, 2).reduce((a, b) => a + b, 0)) / 2
    )

    // WMO Weather codes
    const getWeatherDescription = (code: number): string => {
      if (code === 0) return 'Céu claro'
      if (code === 1 || code === 2) return 'Parcialmente nublado'
      if (code === 3) return 'Nublado'
      if (code === 45 || code === 48) return 'Neblina'
      if (code === 51 || code === 53 || code === 55) return 'Garoa'
      if (code === 61 || code === 63 || code === 65) return 'Chuva'
      if (code === 71 || code === 73 || code === 75) return 'Neve'
      if (code === 77) return 'Neve em grãos'
      if (code === 80 || code === 81 || code === 82) return 'Chuva forte'
      if (code === 85 || code === 86) return 'Neve forte'
      if (code === 95 || code === 96 || code === 99) return 'Tempestade'
      return 'Sem dados'
    }

    return NextResponse.json({
      temp:      Math.round(json.current.temperature_2m),
      chuva:     json.current.precipitation_probability,
      chuva2h,
      condicao:  getWeatherDescription(json.current.weather_code),
    })
  } catch {
    return NextResponse.json({ temp: null, chuva: null, chuva2h: null, condicao: undefined }, { status: 200 })
  }
}
