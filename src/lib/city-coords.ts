// Coordenadas aproximadas das principais cidades brasileiras
export const CITY_COORDS: Record<string, [number, number]> = {
  'São Paulo':          [-23.5505, -46.6333],
  'Rio de Janeiro':     [-22.9068, -43.1729],
  'Belo Horizonte':     [-19.9191, -43.9387],
  'Brasília':           [-15.7801, -47.9292],
  'Salvador':           [-12.9714, -38.5014],
  'Fortaleza':          [-3.7172,  -38.5433],
  'Curitiba':           [-25.4284, -49.2733],
  'Manaus':             [-3.1190,  -60.0217],
  'Recife':             [-8.0476,  -34.8770],
  'Porto Alegre':       [-30.0346, -51.2177],
  'Belém':              [-1.4558,  -48.5044],
  'Goiânia':            [-16.6869, -49.2648],
  'Guarulhos':          [-23.4538, -46.5333],
  'Campinas':           [-22.9056, -47.0608],
  'São Luís':           [-2.5307,  -44.3068],
  'São Gonçalo':        [-22.8268, -43.0539],
  'Maceió':             [-9.6658,  -35.7350],
  'Duque de Caxias':    [-22.7856, -43.3117],
  'Natal':              [-5.7945,  -35.2110],
  'Teresina':           [-5.0892,  -42.8019],
  'Campo Grande':       [-20.4697, -54.6201],
  'Osasco':             [-23.5329, -46.7920],
  'Santo André':        [-23.6639, -46.5383],
  'João Pessoa':        [-7.1195,  -34.8450],
  'Jaboatão dos Guararapes': [-8.1131, -35.0145],
  'Contagem':           [-19.9319, -44.0536],
  'São José dos Campos': [-23.1791, -45.8872],
  'Ribeirão Preto':     [-21.1775, -47.8103],
  'Uberlândia':         [-18.9113, -48.2622],
  'Sorocaba':           [-23.5015, -47.4526],
  'Aracaju':            [-10.9472, -37.0731],
  'Cuiabá':             [-15.5989, -56.0949],
  'Porto Velho':        [-8.7612,  -63.9004],
  'Macapá':             [0.0349,   -51.0694],
  'Rio Branco':         [-9.9754,  -67.8249],
  'Boa Vista':          [2.8235,   -60.6758],
  'Palmas':             [-10.2491, -48.3243],
  'Florianópolis':      [-27.5954, -48.5480],
  'Vitória':            [-20.3155, -40.3128],
  'Niterói':            [-22.8830, -43.1036],
  'Joinville':          [-26.3045, -48.8487],
  'Santos':             [-23.9608, -46.3336],
  'Londrina':           [-23.3045, -51.1696],
  'Caxias do Sul':      [-29.1681, -51.1794],
}

export function getCityCoords(city: string): [number, number] | null {
  const direct = CITY_COORDS[city]
  if (direct) return direct
  // busca parcial
  const key = Object.keys(CITY_COORDS).find(
    (k) => k.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(k.toLowerCase())
  )
  return key ? CITY_COORDS[key] : null
}
