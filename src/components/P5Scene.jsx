import { useEffect, useRef } from 'react'
import p5 from 'p5'

function P5Scene({ scene, image }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const sketch = (p) => {
      const CANVAS_W = 900
      const CANVAS_H = 506

      let img = null
      let imgLoaded = false
      const particles = []
      const waves = []
      const butterflies = []

      p.setup = () => {
        p.createCanvas(CANVAS_W, CANVAS_H)

        const imagePath = image

        if (imagePath) {
          img = new Image()
          img.src = imagePath

          img.onload = () => {
            imgLoaded = true
            console.log('Imagen cargada:', imagePath)
          }

          img.onerror = () => {
            console.error('No se pudo cargar la imagen:', imagePath)
          }
        }

        for (let i = 0; i < 45; i++) {
          particles.push({
            x: p.random(0, CANVAS_W),
            y: p.random(60, CANVAS_H - 60),
            r: p.random(1.5, 4),
            speed: p.random(0.2, 0.8),
            phase: p.random(p.TWO_PI)
          })
        }

        for (let i = 0; i < 14; i++) {
          waves.push({
            x: p.random(120, 780),
            y: p.random(260, 430),
            r: p.random(8, 24),
            alpha: p.random(40, 100)
          })
        }

        for (let i = 0; i < 9; i++) {
          butterflies.push({
            x: p.random(80, 820),
            y: p.random(90, 330),
            phase: p.random(p.TWO_PI)
          })
        }
      }

      p.draw = () => {
        p.background(245)

        if (!imgLoaded || !img) {
          p.fill(40)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(18)
          p.text(`Cargando escena: ${scene}`, CANVAS_W / 2, CANVAS_H / 2)
          return
        }

        const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height)
        const drawW = img.width * scale
        const drawH = img.height * scale

        const x = CANVAS_W / 2 - drawW / 2
        const y = CANVAS_H / 2 - drawH / 2 + p.sin(p.frameCount * 0.015) * 3

        p.drawingContext.drawImage(img, x, y, drawW, drawH)

        drawSceneEffects()
      }

      function drawSceneEffects() {
        if (scene === 'escena_1A' || scene === 'escena_2A') {
          drawButterflies()
        }

        if (scene === 'escena_2' || scene === 'escena_2A' || scene === 'escena_2B') {
          drawWaves()
        }

        if (scene === 'escena_3' || scene === 'escena_3A' || scene === 'escena_3B') {
          drawWindParticles()
        }

        if (scene === 'escena_4' || scene === 'escena_4A' || scene === 'escena_4B') {
          drawSparkles()
        }

        if (scene === 'escena_5' || scene === 'escena_5A' || scene === 'escena_5B') {
          drawCalmGlow()
        }
      }

      function drawButterflies() {
        p.noStroke()

        butterflies.forEach((b) => {
          b.x += p.sin(p.frameCount * 0.012 + b.phase) * 0.8
          b.y += p.sin(p.frameCount * 0.035 + b.phase) * 0.4

          const flap = p.sin(p.frameCount * 0.25 + b.phase) * 4

          p.fill(255, 155, 65, 165)
          p.ellipse(b.x - 5, b.y, 12 + flap, 16)
          p.ellipse(b.x + 5, b.y, 12 + flap, 16)
        })
      }

      function drawWaves() {
        p.noFill()
        p.strokeWeight(2)

        waves.forEach((w) => {
          w.r += 0.45
          w.alpha -= 0.45

          p.stroke(255, 255, 255, w.alpha)
          p.ellipse(w.x, w.y, w.r * 2, w.r)

          if (w.alpha <= 5 || w.r > 70) {
            w.x = p.random(120, 780)
            w.y = p.random(260, 430)
            w.r = p.random(8, 24)
            w.alpha = p.random(40, 100)
          }
        })

        p.noStroke()
      }

      function drawWindParticles() {
        p.noStroke()
        p.fill(255, 255, 255, 75)

        particles.forEach((pt) => {
          pt.x += pt.speed
          pt.y += p.sin(p.frameCount * 0.025 + pt.phase) * 0.25

          p.ellipse(pt.x, pt.y, pt.r, pt.r)

          if (pt.x > CANVAS_W) {
            pt.x = 0
            pt.y = p.random(60, CANVAS_H - 60)
          }
        })
      }

      function drawSparkles() {
        p.noStroke()

        particles.forEach((pt) => {
          const glow = p.sin(p.frameCount * 0.04 + pt.phase) * 40 + 95
          p.fill(255, 245, 180, glow)
          p.ellipse(pt.x, pt.y, pt.r * 2.2, pt.r * 2.2)
        })
      }

      function drawCalmGlow() {
        p.noStroke()

        const alpha = 18 + p.sin(p.frameCount * 0.025) * 8
        p.fill(255, 245, 180, alpha)
        p.ellipse(CANVAS_W / 2, CANVAS_H / 2, 560, 280)

        drawSparkles()
      }
    }

    const instance = new p5(sketch, container)

    return () => {
      instance.remove()
    }
  }, [scene, image])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '1.5rem auto',
        borderRadius: '20px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)'
      }}
    />
  )
}

export default P5Scene