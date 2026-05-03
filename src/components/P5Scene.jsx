import { useEffect, useRef } from 'react'
import p5 from 'p5'

p5.disableFriendlyErrors = true

const imageMap = {
  escena_1: '/assets/portada.png',
  escena_1A: '/assets/escena1A.png',
  escena_1B: '/assets/escena1B.png',

  escena_2: '/assets/rio.png',
  escena_2A: '/assets/rioA.png',
  escena_2B: '/assets/rioB.png',

  escena_3: '/assets/sendero.png',
  escena_3A: '/assets/senderoA.png',
  escena_3B: '/assets/senderoB.png',

  escena_4: '/assets/brillo.png',
  escena_4A: '/assets/brilloA.png',
  escena_4B: '/assets/brilloB.png',

  escena_5: '/assets/claro.png',
  escena_5A: '/assets/florA.png',
  escena_5B: '/assets/FlorB.png',

  escena_6: '/assets/epilogo.png'
}

function P5Scene({ scene }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    let instance = null

    const sketch = (p) => {
      const CANVAS_W = 900
      const CANVAS_H = 420

      let img = null
      let imgLoaded = false

      p.setup = () => {
        p.createCanvas(CANVAS_W, CANVAS_H)

        const imagePath = imageMap[scene]

        if (imagePath) {
          img = p.loadImage(
            imagePath,
            () => {
              imgLoaded = true
              console.log('Imagen cargada:', imagePath)
            },
            () => {
              console.error('No se pudo cargar:', imagePath)
            }
          )
        }
      }

      p.draw = () => {
        p.background(245)

        p.fill(40)
        p.textAlign(p.CENTER, p.TOP)
        p.textSize(16)
        p.text(`Escena visual: ${scene}`, CANVAS_W / 2, 12)

        if (!img || !imgLoaded) {
          p.text('Cargando imagen...', CANVAS_W / 2, CANVAS_H / 2)
          return
        }

        const scale = Math.min(
          CANVAS_W / img.width,
          (CANVAS_H - 50) / img.height
        )

        const drawW = img.width * scale
        const drawH = img.height * scale

        p.imageMode(p.CENTER)
        p.image(
          img,
          CANVAS_W / 2,
          CANVAS_H / 2 + 20,
          drawW,
          drawH
        )
      }
    }

    instance = new p5(sketch, container)

    return () => {
      if (instance) {
        instance.remove()
      }
    }
  }, [scene])

  return (
    <div
      ref={containerRef}
      style={{
        maxWidth: '900px',
        margin: '1rem auto',
        border: '2px solid #A8DADC',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}
    />
  )
}

export default P5Scene