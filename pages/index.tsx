import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { Training, TargetPhoto, ShootingType, AnalysisResult } from '@/lib/types'
import { loadDB, saveDB, formatDate, formatDateShort, pct, getTrainingStats, getAllStats } from '@/lib/db'

type Page = 'intro' | 'dashboard' | 'new' | 'history'

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  chart: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  history: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  x: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  scan: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>,
  edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  save: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  notes: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  target: <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  trophy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  warning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chevronDown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
  chevronUp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  absence: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
}

// Blue target logo shown next to the "Biathlon Shooting App" heading
function TitleTarget() {
  return (
    <svg className="title-target" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}

// ─── Logo SVG (blue target on white) ──────────────────────────────────────────
function LogoIcon() {
  return (
    <div className="logo-icon">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
      </svg>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctColor(p: number) { return p >= 50 ? 'var(--green)' : 'var(--red)' }

// Smooth SVG path through points (Catmull-Rom → cubic bezier)
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}

// Resize an uploaded image file to a data URL (max 1600px), then call back
function readResizedImage(file: File, cb: (dataUrl: string, name: string) => void) {
  const reader = new FileReader()
  reader.onload = (ev) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxDim = 1600; let w = img.width, h = img.height
      if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w = Math.round(w * r); h = Math.round(h * r) }
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      cb(canvas.toDataURL('image/jpeg', 0.92), file.name)
    }
    img.src = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

// ─── Photo Edit Modal ─────────────────────────────────────────────────────────
function PhotoEditModal({ photo, trainingId, photoIndex, onSave, onClose }: {
  photo: TargetPhoto; trainingId: string; photoIndex: number
  onSave: (trainingId: string, photoIndex: number, hit: number, miss: number) => void
  onClose: () => void
}) {
  const [hit, setHit] = useState(photo.result.hit)
  const [miss, setMiss] = useState(photo.result.miss)
  const typeColor = photo.type === 'lezka' ? 'var(--blue)' : 'var(--purple)'
  const typeBg = photo.type === 'lezka' ? 'var(--blue-light)' : 'var(--purple-light)'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">
          <span>Upravit výsledek / Edit result</span>
          <button className="btn btn-sm" onClick={onClose} style={{ border: 'none', background: 'var(--gray-100)' }}>{Icon.x}</button>
        </div>
        <img src={photo.image} alt="Terč" style={{ width: '100%', borderRadius: 12, maxHeight: 260, objectFit: 'contain', background: 'var(--gray-50)', marginBottom: 20, border: 'var(--border)' }} />
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Trefené / Hits', val: hit, setVal: setHit, color: typeColor, bg: typeBg },
            { label: 'Netrefené / Misses', val: miss, setVal: setMiss, color: 'var(--red)', bg: 'var(--red-light)' },
            { label: 'Celkem / Total', val: hit + miss, setVal: null, color: 'var(--text)', bg: 'var(--gray-100)' },
          ].map(({ label, val, setVal, color, bg }) => (
            <div key={label} style={{ flex: 1, textAlign: 'center', background: bg, borderRadius: 12, padding: '14px 10px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                {setVal && <button onClick={() => setVal((v: number) => Math.max(0, v - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--gray-200)', background: 'white', fontSize: 18, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>}
                <span style={{ fontSize: 32, fontWeight: 800, color, minWidth: 40, textAlign: 'center' }}>{val}</span>
                {setVal && <button onClick={() => setVal((v: number) => v + 1)} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${color}`, background: bg, fontSize: 18, cursor: 'pointer', fontWeight: 700, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-full" onClick={() => onSave(trainingId, photoIndex, hit, miss)}>{Icon.check} Uložit změny / Save</button>
          <button className="btn" onClick={onClose}>{Icon.x}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card (expandable) ─────────────────────────────────────────────────
function StatCard({ label, value, sub, color, detail }: {
  label: string; value: string; sub: string; color: string
  detail?: { rows: { label: string; value: string; color?: string }[] }
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`stat-card ${open ? 'expanded' : ''}`} onClick={() => detail && setOpen(o => !o)}>
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={{ color }}>{value}</div>
      <div className="stat-sub">{sub}</div>
      {open && detail && (
        <div className="stat-detail">
          {detail.rows.map((r, i) => (
            <div key={i} className="stat-detail-row">
              <span>{r.label}</span>
              <span className="stat-detail-val" style={{ color: r.color || 'var(--text)' }}>{r.value}</span>
            </div>
          ))}
        </div>
      )}
      {detail && <div className="stat-toggle">{open ? '▲' : '▼'}</div>}
    </div>
  )
}

// ─── Range targets graphic — "digital sight" view (five biathlon targets) ─────
function RangeTargets() {
  return (
    <div className="range-board">
      {[0, 1, 2, 3, 4].map(i => (
        <svg key={i} className="range-target" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="14" fill="none" stroke="#CBD5E1" strokeWidth="2" />
          <circle cx="24" cy="24" r="6" fill="#0F172A" />
        </svg>
      ))}
    </div>
  )
}

// ─── Intro / Landing page ─────────────────────────────────────────────────────
function Intro({ trainings }: { trainings: Training[] }) {
  const stats = getAllStats(trainings)
  const totShots = stats.lT + stats.sT
  const totHits = stats.lH + stats.sH
  const totPct = pct(totHits, totShots)
  return (
    <div className="page">
      <div className="container">
        <div className="intro">
          <h1 className="intro-title"><TitleTarget /> Biathlon Shooting App</h1>
          <p className="intro-subtitle">Aplikace pro biatlonovou střelbu</p>

          <div className="intro-stats">
            <div className="intro-stat-card">
              <div className="intro-stat-label">Celková přesnost / Overall</div>
              <div className="intro-stat-val" style={{ color: pctColor(totPct) }}>{totPct} %</div>
              <div className="intro-stat-sub">{totShots} výstřelů / shots</div>
            </div>
            <div className="intro-stat-card">
              <div className="intro-stat-label">Zásahy celkem / Overall hits</div>
              <div className="intro-stat-val" style={{ color: 'var(--blue)' }}>{totHits}<span style={{ fontSize: 20, color: 'var(--gray-400)' }}>/{totShots}</span></div>
              <div className="intro-stat-sub">{stats.totalTrainings} tréninků / sessions</div>
            </div>
          </div>

          <RangeTargets />
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard (Statistiky) ───────────────────────────────────────────────────
function Dashboard({ trainings, onNav }: { trainings: Training[]; onNav: (p: Page) => void }) {
  const stats = getAllStats(trainings)
  const totPct = pct(stats.lH + stats.sH, stats.lT + stats.sT)
  const lPct = pct(stats.lH, stats.lT)
  const sPct = pct(stats.sH, stats.sT)

  const sortedByPct = [...trainings].map(t => {
    const s = getTrainingStats(t)
    const total = s.lT + s.sT
    const hit = s.lH + s.sH
    return { t, pct: total > 0 ? Math.round(hit / total * 100) : 0 }
  }).filter(x => x.pct > 0).sort((a, b) => b.pct - a.pct)
  const best = sortedByPct[0]
  const worst = sortedByPct[sortedByPct.length - 1]

  const lezkaTrainings = trainings.filter(t => t.photos.some(p => p.type === 'lezka')).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const stojkaTrainings = trainings.filter(t => t.photos.some(p => p.type === 'stojka')).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="page">
      <div className="container">
        <div className="page-title">Statistiky střelby / Shooting Statistics</div>
        {trainings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{Icon.target}</div>
            <p>Zatím žádné záznamy.<br />Nahrajte první terč a sledujte svůj pokrok.</p>
            <button className="btn btn-primary" onClick={() => onNav('new')}>{Icon.plus} Přidat trénink</button>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard label="Celková přesnost / Overall" value={`${totPct} %`} sub={`${stats.lT + stats.sT} výstřelů`} color={pctColor(totPct)}
                detail={{ rows: [
                  { label: 'Trefené celkem', value: `${stats.lH + stats.sH}`, color: 'var(--green)' },
                  { label: 'Netrefené celkem', value: `${stats.lT + stats.sT - stats.lH - stats.sH}`, color: 'var(--red)' },
                  { label: 'Tréninky', value: `${stats.totalTrainings}` },
                ]}}
              />
              <StatCard label="Přesnost ležka / Prone" value={`${lPct} %`} sub={`${stats.lT} výstřelů`} color="var(--blue)"
                detail={{ rows: [
                  { label: 'Trefené', value: `${stats.lH}`, color: 'var(--green)' },
                  { label: 'Netrefené', value: `${stats.lT - stats.lH}`, color: 'var(--red)' },
                  { label: 'Terčů', value: `${trainings.flatMap(t => t.photos).filter(p => p.type === 'lezka').length}` },
                  ...lezkaTrainings.map(t => { const s = getTrainingStats(t); return { label: formatDateShort(t.date), value: `${pct(s.lH, s.lT)} %`, color: pctColor(pct(s.lH, s.lT)) } })
                ]}}
              />
              <StatCard label="Přesnost stojka / Standing" value={`${sPct} %`} sub={`${stats.sT} výstřelů`} color="var(--purple)"
                detail={{ rows: [
                  { label: 'Trefené', value: `${stats.sH}`, color: 'var(--green)' },
                  { label: 'Netrefené', value: `${stats.sT - stats.sH}`, color: 'var(--red)' },
                  { label: 'Terčů', value: `${trainings.flatMap(t => t.photos).filter(p => p.type === 'stojka').length}` },
                  ...stojkaTrainings.map(t => { const s = getTrainingStats(t); return { label: formatDateShort(t.date), value: `${pct(s.sH, s.sT)} %`, color: pctColor(pct(s.sH, s.sT)) } })
                ]}}
              />
              <StatCard label="Tréninky / Sessions" value={`${stats.totalTrainings}`} sub={`${stats.lH + stats.sH} tref celkem`} color="var(--text)" />
            </div>

            {best && worst && best.t.id !== worst.t.id && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="stat-card-best">
                  <div style={{ color: 'var(--green)', flexShrink: 0 }}>{Icon.trophy}</div>
                  <div>
                    <div className="stat-card-best-label">Nejlepší trénink / Best</div>
                    <div className="stat-card-best-val">{formatDateShort(best.t.date)}</div>
                    <div className="stat-card-sub">{best.pct} % přesnost</div>
                  </div>
                </div>
                <div className="stat-card-worst">
                  <div style={{ color: 'var(--orange)', flexShrink: 0 }}>{Icon.warning}</div>
                  <div>
                    <div className="stat-card-worst-label">Nejhorší trénink / Worst</div>
                    <div className="stat-card-worst-val">{formatDateShort(worst.t.date)}</div>
                    <div className="stat-card-sub">{worst.pct} % přesnost</div>
                  </div>
                </div>
              </div>
            )}

            {trainings.length > 1 && <TrendChart trainings={trainings} />}
            <HitsMissesChart trainings={trainings} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Trend Chart (line, % axis) ───────────────────────────────────────────────
function TrendChart({ trainings }: { trainings: Training[] }) {
  const sorted = [...trainings].sort((a, b) => a.date.localeCompare(b.date)).slice(-8)
  const n = sorted.length
  const W = 600, H = 240, padL = 40, padR = 18, padT = 14, padB = 36
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const xAt = (i: number) => padL + (n <= 1 ? plotW / 2 : (plotW * i) / (n - 1))
  const yAt = (p: number) => padT + plotH * (1 - p / 100)

  const points = sorted.map((t, i) => {
    const s = getTrainingStats(t)
    const d = new Date(t.date + 'T12:00:00')
    return {
      i, x: xAt(i),
      l: s.lT > 0 ? pct(s.lH, s.lT) : null,
      s: s.sT > 0 ? pct(s.sH, s.sT) : null,
      label: `${d.getDate()}.${d.getMonth() + 1}.`,
    }
  })
  const pathFor = (key: 'l' | 's') =>
    smoothPath(points.filter(p => p[key] != null).map(p => ({ x: p.x, y: yAt(p[key] as number) })))
  const grid = [0, 25, 50, 75, 100]

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        Vývoj přesnosti / Accuracy (%)
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="line-chart" preserveAspectRatio="xMidYMid meet">
        {grid.map(g => (
          <g key={g}>
            <line className="grid-line" x1={padL} y1={yAt(g)} x2={W - padR} y2={yAt(g)} />
            <text className="axis-label" x={padL - 8} y={yAt(g) + 3.5} textAnchor="end">{g}%</text>
          </g>
        ))}
        <path className="trend-line trend-lezka" d={pathFor('l')} />
        <path className="trend-line trend-stojka" d={pathFor('s')} />
        {points.map(p => p.l != null && <circle key={`l${p.i}`} className="trend-dot dot-lezka" cx={p.x} cy={yAt(p.l)} r={4} />)}
        {points.map(p => p.s != null && <circle key={`s${p.i}`} className="trend-dot dot-stojka" cx={p.x} cy={yAt(p.s)} r={4} />)}
        {points.map(p => <text key={`x${p.i}`} className="axis-label" x={p.x} y={H - 12} textAnchor="middle">{p.label}</text>)}
      </svg>
      <div className="chart-legend" style={{ justifyContent: 'center' }}>
        <span><span className="legend-dot" style={{ background: 'var(--blue)' }} />Ležka / Prone</span>
        <span><span className="legend-dot" style={{ background: 'var(--purple)' }} />Stojka / Standing</span>
      </div>
    </div>
  )
}

// ─── Hits vs misses chart (stacked bars) ──────────────────────────────────────
function HitsMissesChart({ trainings }: { trainings: Training[] }) {
  const sorted = [...trainings].sort((a, b) => a.date.localeCompare(b.date)).slice(-8)
  const n = sorted.length
  const W = 600, H = 240, padL = 36, padR = 18, padT = 14, padB = 36
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const data = sorted.map(t => {
    const s = getTrainingStats(t)
    const d = new Date(t.date + 'T12:00:00')
    return { lH: s.lH, lM: s.lT - s.lH, sH: s.sH, sM: s.sT - s.sH, lT: s.lT, sT: s.sT, label: `${d.getDate()}.${d.getMonth() + 1}.` }
  })

  const rawMax = Math.max(1, ...data.map(d => Math.max(d.lT, d.sT)))
  const maxVal = Math.max(4, Math.ceil(rawMax / 4) * 4)
  const yAt = (v: number) => padT + plotH * (1 - v / maxVal)
  const groupW = plotW / n
  const barW = Math.min(26, groupW * 0.3)
  const gap = barW * 0.35
  const grid = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(maxVal * f))

  const colors = { lH: 'var(--blue)', lM: '#BFD3FB', sH: 'var(--purple)', sM: '#E2C7F5' }

  return (
    <div className="card">
      <div style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
        Trefy vs minuté / Hits vs misses per session
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="line-chart" preserveAspectRatio="xMidYMid meet">
        {grid.map((g, gi) => (
          <g key={gi}>
            <line className="grid-line" x1={padL} y1={yAt(g)} x2={W - padR} y2={yAt(g)} />
            <text className="axis-label" x={padL - 8} y={yAt(g) + 3.5} textAnchor="end">{g}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + groupW * i + groupW / 2
          const lx = cx - gap / 2 - barW
          const sx = cx + gap / 2
          const bottom = yAt(0)
          const seg = (x: number, base: number, val: number, fill: string, key: string) =>
            val > 0 ? <rect key={key} x={x} y={yAt(base + val)} width={barW} height={yAt(base) - yAt(base + val)} fill={fill} rx={2} /> : null
          return (
            <g key={i}>
              {seg(lx, 0, d.lH, colors.lH, 'lH')}
              {seg(lx, d.lH, d.lM, colors.lM, 'lM')}
              {seg(sx, 0, d.sH, colors.sH, 'sH')}
              {seg(sx, d.sH, d.sM, colors.sM, 'sM')}
              <text className="axis-label" x={cx} y={bottom + 18} textAnchor="middle">{d.label}</text>
            </g>
          )
        })}
      </svg>
      <div className="chart-legend" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <span><span className="legend-dot" style={{ background: colors.lH }} />Ležka trefy</span>
        <span><span className="legend-dot" style={{ background: colors.lM }} />Ležka minuté</span>
        <span><span className="legend-dot" style={{ background: colors.sH }} />Stojka trefy</span>
        <span><span className="legend-dot" style={{ background: colors.sM }} />Stojka minuté</span>
      </div>
    </div>
  )
}

// ─── New Training page ────────────────────────────────────────────────────────
interface Slot { image: string; name: string; result: AnalysisResult | null }

function NewTarget({ onSaved }: { onSaved: () => void }) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [absent, setAbsent] = useState(false)
  const [lezka, setLezka] = useState<Slot | null>(null)
  const [stojka, setStojka] = useState<Slot | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [manual, setManual] = useState(false)
  const [error, setError] = useState('')
  const lezkaRef = useRef<HTMLInputElement>(null)
  const stojkaRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: ShootingType) => {
    const f = e.target.files?.[0]; if (!f) return
    readResizedImage(f, (dataUrl, name) => {
      const slot: Slot = { image: dataUrl, name, result: null }
      if (type === 'lezka') setLezka(slot); else setStojka(slot)
      setError(''); setManual(false)
    })
    e.target.value = ''
  }

  const removeSlot = (type: ShootingType) => {
    if (type === 'lezka') setLezka(null); else setStojka(null)
  }

  const analyze = async () => {
    setError(''); setManual(false); setAnalyzing(true)
    const jobs: { type: ShootingType; slot: Slot; set: (s: Slot) => void }[] = []
    if (lezka && !lezka.result) jobs.push({ type: 'lezka', slot: lezka, set: setLezka })
    if (stojka && !stojka.result) jobs.push({ type: 'stojka', slot: stojka, set: setStojka })
    try {
      for (const job of jobs) {
        const base64 = job.slot.image.split(',')[1]
        const mediaType = job.slot.image.split(';')[0].split(':')[1] || 'image/jpeg'
        const res = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType, shootingType: job.type }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
        job.set({ ...job.slot, result: data as AnalysisResult })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Neznámá chyba')
    }
    setAnalyzing(false)
  }

  const setManualResult = (type: ShootingType, hit: number, miss: number) => {
    const r: AnalysisResult = { hit, miss, total: hit + miss, confidence: 'manual', note: 'Zadáno ručně', details: '' }
    if (type === 'lezka') setLezka(s => s ? { ...s, result: r } : s)
    else setStojka(s => s ? { ...s, result: r } : s)
  }

  const hasPhoto = !!lezka || !!stojka
  const canSave = absent || !!lezka?.result || !!stojka?.result

  const saveTraining = () => {
    const photos: TargetPhoto[] = []
    const now = new Date().toISOString()
    if (lezka?.result) photos.push({ id: now + '-l', type: 'lezka', image: lezka.image, result: { hit: lezka.result.hit, miss: lezka.result.miss, total: lezka.result.total }, analyzedAt: now })
    if (stojka?.result) photos.push({ id: now + '-s', type: 'stojka', image: stojka.image, result: { hit: stojka.result.hit, miss: stojka.result.miss, total: stojka.result.total }, analyzedAt: now })
    if (!absent && photos.length === 0) return
    const db = loadDB()
    const existing = db.trainings.find(t => t.date === date)
    if (existing) {
      existing.photos = [...(existing.photos || []), ...photos]
      if (absent && photos.length === 0) existing.absence = true
    } else {
      db.trainings.push({ id: Date.now().toString(), date, note: '', absence: absent && photos.length === 0, photos, createdAt: now })
    }
    saveDB(db); onSaved()
  }

  const confLabel = (c: string) => ({ high: 'Vysoká jistota', medium: 'Střední jistota', manual: 'Ručně zadáno', low: 'Nízká jistota' }[c] || '')

  // Renders one shooting-type slot (button + uploaded photo + result/manual)
  const renderSlot = (type: ShootingType, slot: Slot | null, ref: React.RefObject<HTMLInputElement>) => {
    const isLezka = type === 'lezka'
    const color = isLezka ? 'var(--blue)' : 'var(--purple)'
    const label = isLezka ? 'Ležka / Prone' : 'Stojka / Standing'
    const r = slot?.result
    return (
      <div className="photo-slot">
        <button className={`upload-btn ${isLezka ? 'upload-lezka' : 'upload-stojka'} ${slot ? 'has-photo' : ''}`} onClick={() => ref.current?.click()}>
          {Icon.plus} {label}
        </button>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e, type)} />

        {slot && (
          <div className="slot-photo">
            <img src={slot.image} alt={isLezka ? 'Ležka' : 'Stojka'} />
            <button className="slot-remove" onClick={() => removeSlot(type)}>{Icon.x}</button>

            {manual ? (
              <div className="slot-manual">
                {[
                  { lbl: 'Trefy / Hits', val: r?.hit ?? 0, set: (n: number) => setManualResult(type, n, r?.miss ?? 0), c: color },
                  { lbl: 'Mimo / Miss', val: r?.miss ?? 0, set: (n: number) => setManualResult(type, r?.hit ?? 0, n), c: 'var(--red)' },
                ].map(({ lbl, val, set, c }) => (
                  <div key={lbl} className="counter-box">
                    <div className="counter-lbl" style={{ color: c }}>{lbl}</div>
                    <div className="counter">
                      <button onClick={() => set(Math.max(0, val - 1))}>−</button>
                      <span style={{ color: c }}>{val}</span>
                      <button onClick={() => set(val + 1)} style={{ color: c }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : r ? (
              <div className="slot-result">
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ {r.hit}</span>
                <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗ {r.miss}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 800, color: pctColor(pct(r.hit, r.total)) }}>{pct(r.hit, r.total)} %</span>
                {r.confidence !== 'manual' && <span className="slot-conf">{confLabel(r.confidence)}</span>}
              </div>
            ) : (
              <div className="slot-result"><span style={{ color: 'var(--muted)', fontSize: 12 }}>Neanalyzováno / Not analyzed</span></div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container">
        <div className="hero-center">
          <h1 className="intro-title"><TitleTarget /> Biathlon Shooting App</h1>
          <p className="intro-subtitle">Aplikace pro biatlonovou střelbu · Nový trénink / New training</p>
        </div>

        {/* Date (no card, centered) */}
        <div className="date-inline date-centered">
          <span className="date-cal">{Icon.calendar}</span>
          <span className="date-label">Datum tréninku / Training date:</span>
          <input type="date" className="date-input" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {/* Absence */}
        <div className="card absence-panel">
          <span className="absence-icon">{Icon.absence}</span>
          <div>
            <div className="absence-title">Absence na tréninku / Absent from training</div>
            <div className="absence-sub">Zaznamenat absenci bez výsledků střelby</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={absent} onChange={e => setAbsent(e.target.checked)} />
            <span className="switch-slider" />
          </label>
        </div>

        {/* Target photos */}
        {!absent && (
          <div className="card">
            <div className="card-head">{Icon.upload} Fotografie terčů / Target photos</div>

            <div className="photo-slots">
              {renderSlot('lezka', lezka, lezkaRef)}
              {renderSlot('stojka', stojka, stojkaRef)}
            </div>

            {error && <div className="error-box">{Icon.alert} {error}</div>}

            {analyzing && (
              <div className="analyzing-state">
                <div className="spinner" />
                <p>AI analyzuje terče…</p>
                <small>Přesná AI analýza terčů</small>
              </div>
            )}

            {hasPhoto && !analyzing && (
              <div className="flex-gap mt-16" style={{ justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={analyze}>{Icon.scan} Analyzovat pomocí AI / Analyze with AI</button>
                <button className={`btn ${manual ? 'btn-green' : ''}`} onClick={() => setManual(m => !m)}>{Icon.edit} Zadat ručně / Enter manually</button>
              </div>
            )}
          </div>
        )}

        {absent && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
            Trénink bude uložen jako absence (bez výsledků střelby).<br />Training will be saved as an absence.
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={saveTraining} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5 }}>
          {Icon.save} Uložit trénink / Save training
        </button>
      </div>
    </div>
  )
}

// ─── History row (accordion) ──────────────────────────────────────────────────
function HistoryRow({ training, onDelete, onEditPhoto, onDeletePhoto }: {
  training: Training
  onDelete: () => void
  onEditPhoto: (photoIndex: number) => void
  onDeletePhoto: (photoIndex: number) => void
}) {
  const [open, setOpen] = useState(false)
  const s = getTrainingStats(training)
  const totalShots = s.lT + s.sT
  const totalHit = s.lH + s.sH
  const overallPct = pct(totalHit, totalShots)
  const isAbsence = training.absence && totalShots === 0
  const lezkaPhotos = training.photos.map((p, i) => ({ p, i })).filter(x => x.p.type === 'lezka')
  const stojkaPhotos = training.photos.map((p, i) => ({ p, i })).filter(x => x.p.type === 'stojka')

  return (
    <div className="history-row">
      <div className="history-row-header">
        <div className="history-row-main" onClick={() => setOpen(o => !o)}>
          <div className="history-row-date">{formatDate(training.date)}</div>
          {isAbsence
            ? <div className="history-row-sub">Absence / Absent</div>
            : totalShots > 0 && <div className="history-row-sub">{totalShots} výstřelů · {totalHit} tref · přesnost {overallPct} %</div>}
          <div className="history-badges">
            {s.lT > 0 && <span className="badge badge-lezka">Ležka {s.lH}/{s.lT}</span>}
            {s.sT > 0 && <span className="badge badge-stojka">Stojka {s.sH}/{s.sT}</span>}
            {isAbsence && <span className="badge badge-absence">Absence</span>}
          </div>
        </div>
        <div className="history-actions">
          <button className="icon-btn" title="Rozbalit / Expand" onClick={() => setOpen(o => !o)}>{open ? Icon.chevronUp : Icon.chevronDown}</button>
          {training.photos.length > 0 && (
            <button className="icon-btn" title="Upravit / Edit" onClick={() => { setOpen(true); onEditPhoto(0) }}>{Icon.edit}</button>
          )}
          <button className="icon-btn danger" title="Smazat / Delete" onClick={onDelete}>{Icon.trash}</button>
        </div>
      </div>

      {open && (
        <div className="history-detail">
          {!isAbsence && (
            <div className="history-detail-grid">
              <div className="detail-card lezka">
                <div className="detail-card-title">Ležka / Prone</div>
                <div className="detail-card-stats">
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ {s.lH} tref</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗ {s.lT - s.lH} mimo</span>
                  {s.lT > 0 && <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{pct(s.lH, s.lT)} %</span>}
                </div>
              </div>
              <div className="detail-card stojka">
                <div className="detail-card-title">Stojka / Standing</div>
                <div className="detail-card-stats">
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓ {s.sH} tref</span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>✗ {s.sT - s.sH} mimo</span>
                  {s.sT > 0 && <span style={{ marginLeft: 'auto', fontWeight: 800 }}>{pct(s.sH, s.sT)} %</span>}
                </div>
              </div>
            </div>
          )}

          {training.note && <div className="training-note">{Icon.notes} {training.note}</div>}

          {training.photos.length > 0 && (
            <>
              <div className="history-photos">
                {[{ label: 'Ležka / Prone', items: lezkaPhotos }, { label: 'Stojka / Standing', items: stojkaPhotos }].map(group => (
                  <div key={group.label} className="history-photo-group">
                    <div className="history-photo-label">{group.label}</div>
                    {group.items.length === 0 ? (
                      <div className="history-photo-empty">—</div>
                    ) : group.items.map(({ p, i }) => (
                      <div key={i} className="history-photo-preview" onClick={() => onEditPhoto(i)}>
                        <img src={p.image} alt={`terč ${i + 1}`} />
                        <span className="photo-badge" style={{ background: p.type === 'lezka' ? 'var(--blue)' : 'var(--purple)', color: 'white' }}>
                          {p.type === 'lezka' ? 'L' : 'S'} {pct(p.result.hit, p.result.total)}%
                        </span>
                        <div className="photo-edit-tag">{Icon.edit}</div>
                        <button
                          className="photo-delete-tag"
                          title="Smazat fotku / Delete photo"
                          onClick={(e) => { e.stopPropagation(); onDeletePhoto(i) }}
                        >{Icon.trash}</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Klikněte na terč pro úpravu výsledku / Click a target to edit</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── History Page ─────────────────────────────────────────────────────────────
function History({ trainings, onDelete, onReload }: { trainings: Training[]; onDelete: (id: string) => void; onReload: () => void }) {
  const [editingPhoto, setEditingPhoto] = useState<{ trainingId: string; photoIndex: number } | null>(null)
  const sorted = [...trainings].sort((a, b) => b.date.localeCompare(a.date))

  const handleSavePhoto = (trainingId: string, photoIndex: number, hit: number, miss: number) => {
    const db = loadDB()
    const t = db.trainings.find(x => x.id === trainingId)
    if (t && t.photos[photoIndex]) { t.photos[photoIndex].result = { hit, miss, total: hit + miss }; saveDB(db); onReload() }
    setEditingPhoto(null)
  }

  const handleDeletePhoto = (trainingId: string, photoIndex: number) => {
    if (!confirm('Opravdu smazat tuto fotku terče? / Delete this target photo?')) return
    const db = loadDB()
    const t = db.trainings.find(x => x.id === trainingId)
    if (t && t.photos[photoIndex]) { t.photos.splice(photoIndex, 1); saveDB(db); onReload() }
    setEditingPhoto(null)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-title">Historie tréninků / Training History</div>

        {editingPhoto && (() => {
          const t = trainings.find(x => x.id === editingPhoto.trainingId)
          const p = t?.photos[editingPhoto.photoIndex]
          if (!p) return null
          return <PhotoEditModal photo={p} trainingId={editingPhoto.trainingId} photoIndex={editingPhoto.photoIndex} onSave={handleSavePhoto} onClose={() => setEditingPhoto(null)} />
        })()}

        {trainings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{Icon.target}</div>
            <p>Žádné tréninky k zobrazení.</p>
          </div>
        ) : (
          sorted.map(t => (
            <HistoryRow
              key={t.id}
              training={t}
              onDelete={() => onDelete(t.id)}
              onEditPhoto={(photoIndex) => setEditingPhoto({ trainingId: t.id, photoIndex })}
              onDeletePhoto={(photoIndex) => handleDeletePhoto(t.id, photoIndex)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('intro')
  const [trainings, setTrainings] = useState<Training[]>([])
  useEffect(() => { setTrainings(loadDB().trainings) }, [])
  const reload = () => setTrainings(loadDB().trainings)
  const deleteTraining = (id: string) => {
    if (!confirm('Opravdu smazat tento trénink? / Delete this training?')) return
    const db = loadDB(); db.trainings = db.trainings.filter(t => t.id !== id); saveDB(db); reload()
  }

  return (
    <>
      <Head>
        <title>Biathlon Shooting App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <nav className="topbar">
        <div className="container topbar-inner">
          <div className="logo" onClick={() => setPage('intro')} style={{ cursor: 'pointer' }}>
            <LogoIcon />
            <div>
              <span>Biathlon</span>
              <span className="logo-sub">Shooting App</span>
            </div>
          </div>
          {(['new', 'history', 'dashboard'] as const).map(p => (
            <button key={p} className={`nav-btn ${page === p ? 'active' : ''}`} onClick={() => { setPage(p); if (p !== 'new') reload() }}>
              {p === 'new' && <>{Icon.plus} Trénink / Training</>}
              {p === 'history' && <>{Icon.history} Historie / History</>}
              {p === 'dashboard' && <>{Icon.chart} Statistiky / Stats</>}
            </button>
          ))}
        </div>
      </nav>
      {page === 'intro' && <Intro trainings={trainings} />}
      {page === 'dashboard' && <Dashboard trainings={trainings} onNav={setPage} />}
      {page === 'new' && <NewTarget onSaved={() => { reload(); setPage('history') }} />}
      {page === 'history' && <History trainings={trainings} onDelete={deleteTraining} onReload={reload} />}
    </>
  )
}
