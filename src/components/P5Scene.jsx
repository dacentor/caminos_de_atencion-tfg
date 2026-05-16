import { useEffect, useRef } from 'react'
import p5 from 'p5'

function P5Scene({ scene, image }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const sketch = (p) => {
      const CANVAS_W = Math.min(900, Math.max(280, container.clientWidth || 900))
      const CANVAS_H = Math.round(CANVAS_W * 506 / 900)

      let img = null
      let imgLoaded = false

      const particles = []
      const waves = []
      const butterflies = []
      const musicNotes = []
      const sparkles = []

      let pointerActive = false
      let pointerX = CANVAS_W / 2
      let pointerY = CANVAS_H / 2

      p.setup = () => {
        const canvas = p.createCanvas(CANVAS_W, CANVAS_H)
        canvas.elt.style.width = '100%'
        canvas.elt.style.height = 'auto'
        canvas.elt.style.display = 'block'
        canvas.elt.style.touchAction = 'pan-y'

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
            x: p.random(CANVAS_W * 0.13, CANVAS_W * 0.87),
            y: p.random(CANVAS_H * 0.52, CANVAS_H * 0.85),
            r: p.random(8, 24),
            alpha: p.random(40, 100)
          })
        }

        for (let i = 0; i < 11; i++) {
          butterflies.push({
            x: p.random(CANVAS_W * 0.1, CANVAS_W * 0.9),
            y: p.random(CANVAS_H * 0.18, CANVAS_H * 0.65),
            homeX: p.random(CANVAS_W * 0.1, CANVAS_W * 0.9),
            homeY: p.random(CANVAS_H * 0.18, CANVAS_H * 0.65),
            phase: p.random(p.TWO_PI),
            speed: p.random(0.35, 0.9),
            orbit: p.random(18, 46),
            scatterX: p.random(-1.2, 1.2),
            scatterY: p.random(-0.7, 0.7)
          })
        }

        for (let i = 0; i < 10; i++) {
          musicNotes.push({
            x: p.random(CANVAS_W * 0.13, CANVAS_W * 0.85),
            y: p.random(CANVAS_H * 0.22, CANVAS_H * 0.72),
            size: p.random(20, 34),
            speed: p.random(0.25, 0.7),
            phase: p.random(p.TWO_PI)
          })
        }

        for (let i = 0; i < 26; i++) {
          sparkles.push({
            x: p.random(CANVAS_W * 0.13, CANVAS_W * 0.87),
            y: p.random(CANVAS_H * 0.2, CANVAS_H * 0.78),
            size: p.random(7, 18),
            phase: p.random(p.TWO_PI),
            pulse: p.random(0.02, 0.055)
          })
        }
      }

      p.draw = () => {
        p.background(245)

        if (!imgLoaded || !img) {
          p.fill(40)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(16)
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

      p.mouseMoved = () => {
        updatePointerFromMouse()
      }

      p.mousePressed = () => {
        updatePointerFromMouse()
        pointerActive = true
      }

      p.mouseReleased = () => {
        pointerActive = false
        scatterButterflies()
      }

      p.touchStarted = () => {
        updatePointerFromTouch()
        pointerActive = true
      }

      p.touchMoved = () => {
        updatePointerFromTouch()
        pointerActive = true
      }

      p.touchEnded = () => {
        pointerActive = false
        scatterButterflies()
      }

      function updatePointerFromMouse() {
        pointerX = p.constrain(p.mouseX, 0, CANVAS_W)
        pointerY = p.constrain(p.mouseY, 0, CANVAS_H)
      }

      function updatePointerFromTouch() {
        if (p.touches && p.touches.length > 0) {
          pointerX = p.constrain(p.touches[0].x, 0, CANVAS_W)
          pointerY = p.constrain(p.touches[0].y, 0, CANVAS_H)
        }
      }

      function scatterButterflies() {
        butterflies.forEach((b) => {
          b.homeX = p.random(CANVAS_W * 0.1, CANVAS_W * 0.9)
          b.homeY = p.random(CANVAS_H * 0.18, CANVAS_H * 0.68)
          b.scatterX = p.random(-1.4, 1.4)
          b.scatterY = p.random(-0.8, 0.8)
        })
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
          drawMusicNotes()
        }

        if (scene === 'escena_4' || scene === 'escena_4A' || scene === 'escena_4B') {
          drawFabricSparkles()
        }

        if (scene === 'escena_5' || scene === 'escena_5A' || scene === 'escena_5B') {
          drawCalmGlow()
        }
      }

      function drawButterflies() {
        p.noStroke()

        butterflies.forEach((b, index) => {
          if (pointerActive) {
            const angle = p.frameCount * 0.025 + b.phase + index * 0.55
            const targetX = pointerX + p.cos(angle) * b.orbit
            const targetY = pointerY + p.sin(angle) * b.orbit * 0.65

            b.x += (targetX - b.x) * 0.035
            b.y += (targetY - b.y) * 0.035
          } else {
            b.x += (b.homeX - b.x) * 0.01 + b.scatterX * 0.25
            b.y += (b.homeY - b.y) * 0.01 + b.scatterY * 0.18
          }

          b.x += p.sin(p.frameCount * 0.012 + b.phase) * 0.55
          b.y += p.sin(p.frameCount * 0.035 + b.phase) * 0.35

          b.x = p.constrain(b.x, 30, CANVAS_W - 30)
          b.y = p.constrain(b.y, 35, CANVAS_H - 35)

          const flap = p.sin(p.frameCount * 0.25 + b.phase) * 4
          const alpha = pointerActive ? 190 : 155
          const sizeScale = CANVAS_W < 500 ? 0.8 : 1

          p.fill(255, 155, 65, alpha)
          p.ellipse(b.x - 5 * sizeScale, b.y, (12 + flap) * sizeScale, 16 * sizeScale)
          p.ellipse(b.x + 5 * sizeScale, b.y, (12 + flap) * sizeScale, 16 * sizeScale)

          p.fill(90, 80, 70, alpha)
          p.ellipse(b.x, b.y, 3 * sizeScale, 10 * sizeScale)
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
            w.x = p.random(CANVAS_W * 0.13, CANVAS_W * 0.87)
            w.y = p.random(CANVAS_H * 0.52, CANVAS_H * 0.85)
            w.r = p.random(8, 24)
            w.alpha = p.random(40, 100)
          }
        })

        p.noStroke()
      }

      function drawWindParticles() {
        p.noStroke()
        p.fill(255, 255, 255, 65)

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

      function drawMusicNotes() {
        musicNotes.forEach((note) => {
          note.x += note.speed
          note.y += p.sin(p.frameCount * 0.025 + note.phase) * 0.45

          const alpha = 65 + p.sin(p.frameCount * 0.035 + note.phase) * 35
          const size = note.size * (CANVAS_W < 500 ? 0.55 : 0.75)

          p.push()
          p.translate(note.x, note.y)
          p.rotate(p.sin(p.frameCount * 0.02 + note.phase) * 0.25)

          p.stroke(245, 255, 255, alpha)
          p.strokeWeight(CANVAS_W < 500 ? 1.5 : 2)
          p.noFill()

          p.line(0, 0, 0, -size * 1.4)

          p.fill(245, 255, 255, alpha)
          p.ellipse(-5, 0, size * 0.75, size * 0.55)

          p.noFill()
          p.arc(size * 0.25, -size * 1.35, size * 0.9, size * 0.55, p.PI, p.TWO_PI)

          p.pop()

          if (note.x > CANVAS_W + 40) {
            note.x = -40
            note.y = p.random(CANVAS_H * 0.22, CANVAS_H * 0.72)
            note.size = p.random(20, 34)
            note.speed = p.random(0.25, 0.7)
            note.phase = p.random(p.TWO_PI)
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

      function drawFabricSparkles() {
        sparkles.forEach((sp) => {
          const alpha = 80 + p.sin(p.frameCount * sp.pulse + sp.phase) * 70
          const size = sp.size + p.sin(p.frameCount * sp.pulse + sp.phase) * 5

          p.push()
          p.translate(sp.x, sp.y)
          p.rotate(p.frameCount * 0.01 + sp.phase)

          p.stroke(255, 245, 190, alpha)
          p.strokeWeight(CANVAS_W < 500 ? 1.3 : 1.8)
          p.noFill()

          p.line(-size, 0, size, 0)
          p.line(0, -size, 0, size)

          p.strokeWeight(1)
          p.line(-size * 0.45, -size * 0.45, size * 0.45, size * 0.45)
          p.line(-size * 0.45, size * 0.45, size * 0.45, -size * 0.45)

          p.noStroke()
          p.fill(255, 248, 210, alpha)
          p.ellipse(0, 0, size * 0.28, size * 0.28)

          p.pop()
        })
      }

      function drawCalmGlow() {
        p.noStroke()

        const alpha = 18 + p.sin(p.frameCount * 0.025) * 8
        p.fill(255, 245, 180, alpha)
        p.ellipse(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.62, CANVAS_H * 0.55)

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
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
        touchAction: 'pan-y',
        boxSizing: 'border-box'
      }}
    />
  )
}

export default P5Scene