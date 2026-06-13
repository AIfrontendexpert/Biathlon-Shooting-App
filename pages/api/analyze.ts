import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { ShootingType } from '@/lib/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Model použitý pro analýzu terčů (vision). Měň na jednom místě.
const MODEL = 'claude-opus-4-8'

function buildPrompt(type: ShootingType): string {
  const isLezka = type === 'lezka'
  const rules = isLezka
    ? `TYP STŘELBY: LEŽKA\n- TREFENÁ = dírka UVNITŘ malého kruhu (NEPŘERUŠOVANÁ bílá čára)\n- NETREFENÁ = vše ostatní`
    : `TYP STŘELBY: STOJKA\n- TREFENÁ = dírka kdekoliv v tmavém kruhu\n- NETREFENÁ = dírka na světlém papíru mimo tmavý kruh`

  const lezkaEx = `Příklad 1: 5 ran uvnitř nepřerušované kružnice, 14 ve velkém kruhu, 2 na papíru → hit=5,miss=16,total=21
Příklad 2: 2 rány uvnitř kružnice, zbytek ve velkém kruhu → hit=2,miss=10,total=12
Příklad 3: 10 ran uvnitř kružnice, 5 ve velkém kruhu → hit=10,miss=5,total=15
Příklad 4: 2 rány uvnitř kružnice, 22 mimo → hit=2,miss=22,total=24
Příklad 5: 1 rána uvnitř kružnice, 13 mimo → hit=1,miss=13,total=14`

  const stojkaEx = `Příklad 1: 11 ran v tmavém kruhu, 8 na papíru → hit=11,miss=8,total=19
Příklad 2: 3 rány v tmavém kruhu, 6 na papíru → hit=3,miss=6,total=9
Příklad 3: 8 ran v tmavém kruhu, 4 na papíru → hit=8,miss=4,total=12
Příklad 4: 6 ran v tmavém kruhu, 17 na papíru → hit=6,miss=17,total=23
Příklad 5: 4 rány v tmavém kruhu, 15 na papíru → hit=4,miss=15,total=19`

  return `Analyzuj biatlonový terč. Velký tmavý kruh na světlém papíru. Uvnitř malý kruh s NEPŘERUŠOVANOU bílou čárou. Tečkované čáry jsou jen stupnice - ignoruj je. Terč může být elipsa (focený z úhlu).

RÁNA = fyzická dírka nebo hvězdicová trhlina v papíru. NENÍ rána: tisk, čísla, kružnice nakreslené na terči.

${rules}

PŘÍKLADY:
${isLezka ? lezkaEx : stojkaEx}

Spočítej zóny:
- Zóna A = dírky uvnitř nepřerušované bílé čáry
- Zóna B = dírky v tmavém kruhu mimo nepřerušovanou bílou čáru  
- Zóna C = dírky na světlém papíru mimo tmavý kruh

${isLezka ? 'Trefené = zóna A, Netrefené = zóna B + C' : 'Trefené = zóna A + B, Netrefené = zóna C'}

Odpověz POUZE JSON:
{"hit":CISLO,"miss":CISLO,"total":CISLO,"confidence":"high","note":"popis","details":"zona_A=X, zona_B=Y, zona_C=Z"}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { imageBase64, mediaType, shootingType } = req.body as {
    imageBase64: string
    mediaType: string
    shootingType: ShootingType
  }

  if (!imageBase64 || !shootingType) {
    return res.status(400).json({ error: 'Chybí obrázek nebo typ střelby' })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY není nastavena v .env.local' })
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: (mediaType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp',
              data: imageBase64
            }
          },
          { type: 'text', text: buildPrompt(shootingType) },
        ],
      }],
    })

    const raw = response.content.map(b => b.type === 'text' ? b.text : '').join('').trim()
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const match = cleaned.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(match ? match[0] : cleaned)

    return res.status(200).json({
      hit: Number(parsed.hit) || 0,
      miss: Number(parsed.miss) || 0,
      total: Number(parsed.total) || 0,
      confidence: parsed.confidence || 'medium',
      note: parsed.note || '',
      details: parsed.details || '',
      method: 'claude',
    })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}