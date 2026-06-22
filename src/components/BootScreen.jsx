import { useEffect, useState } from 'react'
import Logo from './Logo'

const bootLines = ['Loading studio modules', 'Validating system interface', 'Mounting project index', 'GhostFrame OS ready']

export default function BootScreen({ onComplete }) {
  const [line, setLine] = useState(0)

  useEffect(() => {
    const lineTimer = window.setInterval(() => setLine((current) => Math.min(current + 1, bootLines.length - 1)), 480)
    const completeTimer = window.setTimeout(onComplete, 2500)
    return () => {
      window.clearInterval(lineTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div className="boot-screen" role="status" aria-live="polite">
      <div className="boot-screen__scan" />
      <div className="boot-screen__top"><span>GFS / BOOT SEQUENCE</span><span>BUILD 01.00</span></div>
      <div className="boot-screen__core">
        <Logo compact />
        <div><p>GhostFrame Studios</p><h1>Initializing<br />studio system</h1></div>
      </div>
      <div className="boot-screen__terminal">
        {bootLines.map((item, index) => (
          <div key={item} className={index <= line ? 'is-visible' : ''}>
            <span>{index < line || line === bootLines.length - 1 ? 'OK' : index === line ? '··' : '--'}</span>{item}
          </div>
        ))}
      </div>
      <div className="boot-screen__progress"><i /></div>
      <button type="button" onClick={onComplete}>Skip intro</button>
    </div>
  )
}
