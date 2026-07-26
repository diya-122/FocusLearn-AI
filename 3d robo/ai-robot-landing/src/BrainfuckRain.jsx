import { useEffect, useRef } from 'react'

const BF_CHARS = ['>', '<', '+', '-', '.', ',', '[', ']']

export default function BrainfuckRain() {
  const canvasRef = useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fontSize = 15
    const cols = Math.floor(canvas.width / fontSize)

    // Each column has a fixed stream of characters that don't change
    // Only the drop head position moves
    const streams = Array.from({ length: cols }, () => ({
      y: Math.random() * -200,                        // start above screen
      speed: Math.random() * 0.4 + 0.15,             // slow, steady fall
      chars: Array.from({ length: 60 }, () =>         // fixed chars per stream
        BF_CHARS[Math.floor(Math.random() * BF_CHARS.length)]
      ),
      opacity: Math.random() * 0.3 + 0.25,           // subtle, not bright
    }))

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    let animId
    let lastTime = 0
    const FPS = 20  // low fps = slower, calmer feel

    const draw = (timestamp) => {
      animId = requestAnimationFrame(draw)

      // Throttle to target FPS
      if (timestamp - lastTime < 1000 / FPS) return
      lastTime = timestamp

      // Dark overlay — strong fade so trail is short and clean
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < streams.length; i++) {
        const s = streams[i]
        const x = i * fontSize
        const headRow = Math.floor(s.y)

        // Draw a column of ~18 chars as the stream
        for (let j = 0; j < 18; j++) {
          const row = headRow - j
          if (row < 0) continue

          const y = row * fontSize
          if (y > canvas.height) continue

          const charIndex = (headRow - j + s.chars.length) % s.chars.length
          const char = s.chars[charIndex]

          if (j === 0) {
            // Head — brightest, slightly warm white
            ctx.fillStyle = `rgba(220, 235, 255, ${Math.min(s.opacity + 0.55, 1)})`
          } else if (j < 3) {
            // Near head — yellow
            ctx.fillStyle = `rgba(255, 210, 60, ${s.opacity + 0.2})`
          } else if (j < 8) {
            // Mid trail — dim yellow
            ctx.fillStyle = `rgba(200, 160, 20, ${s.opacity})`
          } else {
            // Tail — very dim, fades out
            const fade = 1 - (j - 8) / 10
            ctx.fillStyle = `rgba(140, 100, 0, ${s.opacity * fade * 0.5})`
          }

          ctx.fillText(char, x, y)
        }

        // Advance drop
        s.y += s.speed

        // Reset when fully off screen
        if ((headRow - 18) * fontSize > canvas.height) {
          s.y = Math.random() * -80
          s.speed = Math.random() * 0.4 + 0.15
          s.opacity = Math.random() * 0.3 + 0.25
          // Refresh chars on reset
          s.chars = Array.from({ length: 60 }, () =>
            BF_CHARS[Math.floor(Math.random() * BF_CHARS.length)]
          )
        }
      }
    }

    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
        zIndex: 0,
      }}
    />
  )
}
