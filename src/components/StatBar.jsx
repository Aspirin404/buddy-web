export default function StatBar({ name, value }) {
  const pct   = value / 100
  const color = value >= 75 ? '#22c55e' : value >= 45 ? '#eab308' : '#ef4444'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem', color: '#22d3ee',
        width: 90, flexShrink: 0,
      }}>
        {name}
      </span>
      <div style={{
        flex: 1, height: 8, background: '#1f2937',
        borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct * 100}%`, height: '100%',
          background: color, borderRadius: 4,
          transition: 'width 0.8s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.72rem', color: '#e5e7eb', width: 28, textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}
