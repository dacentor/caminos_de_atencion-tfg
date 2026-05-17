import { useEffect, useRef } from 'react'
import p5 from 'p5'

function P5Scene({ scene, image }) {
  // Referencia al contenedor donde p5 va a crear el canvas.
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Limpio el contenedor antes de crear un nuevo canvas.
    // Esto evita que se acumulen varios canvas al cambiar de escena.
    container.innerHTML = ''

    const sketch = (p) => {
      // Canvas responsive: mantiene la proporción de las imágenes,
      // pero se adapta al ancho disponible en móvil, tablet o escritorio.
      const CANVAS_W = Math.min(900, Math.max(280, container.clientWidth || 900))
      const CANVAS_H = Math.round(CANVAS_W * 506 / 900)

      let img = null
      let imgLoaded = false

      // Arrays para guardar los elementos animados de cada tipo de escena.
      const particles = []
      const waves = []
      const butterflies = []
      const musicNotes = []
      const sparkles = []

      // Variables para saber si el usuario está tocando o pulsando la escena.
      let pointerActive = false
      let pointerX = CANVAS_W / 2
      let pointerY = CANVAS_H / 2

      p.setup = () => {
        const canvas = p.createCanvas(CANVAS_W, CANVAS_H)

        // Ajustes para que el canvas se vea bien dentro del layout responsive.
        canvas.elt.style.width = '100%'
        canvas.elt.style.height = 'auto'
        canvas.elt.style.display = 'block'
        canvas.elt.style.touchAction = 'pan-y'

        // Carga de la imagen base de la escena.
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

        // Partículas generales: se reutilizan para viento y brillos suaves.
        for (let i = 0; i < 45; i++) {
          particles.push({
            x: p.random(0, CANVAS_W),
            y: p.random(60, CANVAS_H - 60),
            r: p.random(1.5, 4),
            speed: p.random(0.2, 0.8),
            phase: p.random(p.TWO_PI)
          })
        }

        // Ondas del río para las escenas del puente.
        for (let i = 0; i < 14; i++) {
          waves.push({
            x: p.random(CANVAS_W * 0.13, CANVAS_W * 0.87),
            y: p.random(CANVAS_H * 0.52, CANVAS_H * 0.85),
            r: p.random(8, 24),
            alpha: p.random(40, 100)
          })
        }

        // Mariposas interactivas.
        // Cada una recibe un color suave diferente para que la escena sea más rica visualmente.
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
            scatterY: p.random(-0.7, 0.7),
            color: getRandomButterflyColor()
          })
        }

        // Notas musicales para reforzar visualmente las escenas del silbido.
        for (let i = 0; i < 10; i++) {
          musicNotes.push({
            x: p.random(CANVAS_W * 0.13, CANVAS_W * 0.85),
            y: p.random(CANVAS_H * 0.22, CANVAS_H * 0.72),
            size: p.random(20, 34),
            speed: p.random(0.25, 0.7),
            phase: p.random(p.TWO_PI)
          })
        }

        // Destellos específicos para la escena del brillo entre ramas.
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

        // Mientras la imagen no carga, mostramos un mensaje sencillo.
        if (!imgLoaded || !img) {
          p.fill(40)
          p.textAlign(p.CENTER, p.CENTER)
          p.textSize(16)
          p.text(`Cargando escena: ${scene}`, CANVAS_W / 2, CANVAS_H / 2)
          return
        }

        // Ajusto la imagen al canvas sin deformarla.
        const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height)
        const drawW = img.width * scale
        const drawH = img.height * scale

        const x = CANVAS_W / 2 - drawW / 2

        // Pequeño movimiento vertical para que la escena no parezca totalmente estática.
        const y = CANVAS_H / 2 - drawH / 2 + p.sin(p.frameCount * 0.015) * 3

        p.drawingContext.drawImage(img, x, y, drawW, drawH)

        drawSceneEffects()
      }

      // Paleta sencilla para las mariposas.
      // Son colores vivos pero no demasiado agresivos para mantener el tono amable del cuento.
      function getRandomButterflyColor() {
        const palette = [
          { r: 255, g: 155, b: 65 },
          { r: 255, g: 204, b: 92 },
          { r: 168, g: 218, b: 220 },
          { r: 120, g: 190, b: 255 },
          { r: 210, g: 150, b: 255 },
          { r: 255, g: 145, b: 180 },
          { r: 145, g: 220, b: 155 }
        ]

        return p.random(palette)
      }

      // Interacción con ratón para ordenador.
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

      // Interacción táctil para móvil o tablet.
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

      // Cuando el usuario deja de tocar, las mariposas vuelven a repartirse.
      function scatterButterflies() {
        butterflies.forEach((b) => {
          b.homeX = p.random(CANVAS_W * 0.1, CANVAS_W * 0.9)
          b.homeY = p.random(CANVAS_H * 0.18, CANVAS_H * 0.68)
          b.scatterX = p.random(-1.4, 1.4)
          b.scatterY = p.random(-0.8, 0.8)
        })
      }

      // Según la escena activa, dibujamos un efecto visual distinto.
      // Así el mismo componente p5 sirve para todo el cuento.
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
            // Si el usuario toca la escena, las mariposas se acercan al dedo/ratón.
            const angle = p.frameCount * 0.025 + b.phase + index * 0.55
            const targetX = pointerX + p.cos(angle) * b.orbit
            const targetY = pointerY + p.sin(angle) * b.orbit * 0.65

            b.x += (targetX - b.x) * 0.035
            b.y += (targetY - b.y) * 0.035
          } else {
            // Si no se está tocando, vuelven poco a poco a una zona aleatoria.
            b.x += (b.homeX - b.x) * 0.01 + b.scatterX * 0.25
            b.y += (b.homeY - b.y) * 0.01 + b.scatterY * 0.18
          }

          // Movimiento suave para que parezcan vivas.
          b.x += p.sin(p.frameCount * 0.012 + b.phase) * 0.55
          b.y += p.sin(p.frameCount * 0.035 + b.phase) * 0.35

          b.x = p.constrain(b.x, 30, CANVAS_W - 30)
          b.y = p.constrain(b.y, 35, CANVAS_H - 35)

          const flap = p.sin(p.frameCount * 0.25 + b.phase) * 4
          const alpha = pointerActive ? 205 : 170
          const sizeScale = CANVAS_W < 500 ? 0.8 : 1

          // Alas con color propio de cada mariposa.
          p.fill(b.color.r, b.color.g, b.color.b, alpha)
          p.ellipse(b.x - 5 * sizeScale, b.y, (12 + flap) * sizeScale, 16 * sizeScale)
          p.ellipse(b.x + 5 * sizeScale, b.y, (12 + flap) * sizeScale, 16 * sizeScale)

          // Un brillo suave encima para que no queden planas.
          p.fill(255, 255, 255, 45)
          p.ellipse(b.x - 6 * sizeScale, b.y - 2 * sizeScale, 5 * sizeScale, 7 * sizeScale)
          p.ellipse(b.x + 6 * sizeScale, b.y - 2 * sizeScale, 5 * sizeScale, 7 * sizeScale)

          // Cuerpo.
          p.fill(90, 80, 70, alpha)
          p.ellipse(b.x, b.y, 3 * sizeScale, 10 * sizeScale)
        })
      }

      function drawWaves() {
        p.noFill()
        p.strokeWeight(2)

        waves.forEach((w) => {
          // Las ondas se expanden y se vuelven más transparentes.
          w.r += 0.45
          w.alpha -= 0.45

          p.stroke(255, 255, 255, w.alpha)
          p.ellipse(w.x, w.y, w.r * 2, w.r)

          // Cuando una onda desaparece, la reciclamos en otra posición.
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
          // Partículas pequeñas que cruzan la escena como viento.
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
          // Las notas se desplazan suavemente para acompañar el silbido.
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

          // Dibujo simple de una nota musical.
          p.line(0, 0, 0, -size * 1.4)

          p.fill(245, 255, 255, alpha)
          p.ellipse(-5, 0, size * 0.75, size * 0.55)

          p.noFill()
          p.arc(size * 0.25, -size * 1.35, size * 0.9, size * 0.55, p.PI, p.TWO_PI)

          p.pop()

          // Cuando sale por la derecha, vuelve a entrar por la izquierda.
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

          // Destello en forma de estrella sencilla.
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

        // Resplandor central para reforzar la sensación de calma.
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