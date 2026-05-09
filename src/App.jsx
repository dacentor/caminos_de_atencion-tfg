import { useState } from 'react'
import { supabase } from './supabase'
import { lunaBosque } from './data/stories/lunaBosque'
import P5Scene from './components/P5Scene'

function App() {
  // Identificador del usuario creado en Supabase para la sesión actual.
  const [userId, setUserId] = useState(null)

  // Identificador de la sesión narrativa actual.
  const [sessionId, setSessionId] = useState(null)

  // Escena activa del cuento.
  const [scene, setScene] = useState('escena_1')

  // Mensaje de estado mostrado en la interfaz.
  const [status, setStatus] = useState('Pulsa "Iniciar cuento" para empezar.')

  // Historial simple del recorrido realizado dentro de la sesión actual.
  const [history, setHistory] = useState([])

  // Variables narrativas acumuladas durante el recorrido.
  const [calmaScore, setCalmaScore] = useState(0)
  const [impulsoScore, setImpulsoScore] = useState(0)

  // Obtiene los datos de la escena activa.
  const currentScene = lunaBosque[scene]

  async function iniciarCuento() {
    setStatus('Creando usuario...')

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ name: 'Usuario demo React' }])
      .select()
      .single()

    if (userError) {
      console.error(userError)
      setStatus('Error al crear usuario.')
      return
    }

    setUserId(userData.id)
    setStatus('Creando sesión...')

    const { data: sessionData, error: sessionError } = await supabase
      .from('story_sessions')
      .insert([
        {
          user_id: userData.id,
          story_id: 'luna_bosque'
        }
      ])
      .select()
      .single()

    if (sessionError) {
      console.error(sessionError)
      setStatus('Error al crear sesión.')
      return
    }

    setSessionId(sessionData.id)
    setScene('escena_1')
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Sesión iniciada correctamente.')
  }

  function calcularImpactoDecision(choiceLabel) {
    let calma = 0
    let impulso = 0

    if (
      choiceLabel.includes('Respira') ||
      choiceLabel.includes('Ayuda') ||
      choiceLabel.includes('escuchar con calma') ||
      choiceLabel.includes('Observar') ||
      choiceLabel.includes('Sentarse') ||
      choiceLabel.includes('Abrazar')
    ) {
      calma = 1
    }

    if (
      choiceLabel.includes('distrae') ||
      choiceLabel.includes('Sigue a Mika') ||
      choiceLabel.includes('Seguir el sonido') ||
      choiceLabel.includes('Acercarse')
    ) {
      impulso = 1
    }

    return { calma, impulso }
  }

  async function guardarDecision(choice) {
    if (!sessionId) {
      setStatus('Primero tienes que iniciar el cuento.')
      return
    }

    const { calma, impulso } = calcularImpactoDecision(choice.label)

    const { error } = await supabase
      .from('scene_decisions')
      .insert([
        {
          session_id: sessionId,
          scene_id: scene,
          decision_taken: choice.label
        }
      ])

    if (error) {
      console.error(error)
      setStatus('Error al guardar la decisión.')
      return
    }

    setHistory((prevHistory) => [...prevHistory, scene])
    setCalmaScore((prevCalma) => prevCalma + calma)
    setImpulsoScore((prevImpulso) => prevImpulso + impulso)
    setScene(choice.next)
    setStatus(`Decisión guardada: ${choice.label}`)
  }

  function volverAtras() {
    if (history.length === 0) {
      setStatus('No hay escenas anteriores en el recorrido actual.')
      return
    }

    const previousScene = history[history.length - 1]

    setScene(previousScene)
    setHistory((prevHistory) => prevHistory.slice(0, -1))
    setStatus('Has vuelto a la escena anterior.')
  }

  function reiniciarRecorrido() {
    setScene('escena_1')
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Recorrido reiniciado.')
  }

  function obtenerTextoEpilogo() {
    if (calmaScore > impulsoScore) {
      return 'Hoy Luna ha encontrado muchas formas de estar tranquila. A lo largo del camino ha descubierto que detenerse, observar y respirar también forman parte de la aventura.'
    }

    if (impulsoScore > calmaScore) {
      return 'Hoy Luna ha seguido con curiosidad muchos estímulos del bosque. En su recorrido ha descubierto que explorar también puede enseñarle a escucharse y encontrar la calma.'
    }

    return 'Hoy Luna ha combinado curiosidad y calma durante el viaje. El bosque le ha mostrado que existen muchas formas de avanzar y que cada recorrido puede enseñarle algo distinto.'
  }

  if (!currentScene) {
    return (
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Caminos de Atención</h1>
        <p>Escena no encontrada: {scene}</p>
        <button onClick={reiniciarRecorrido}>Volver al inicio</button>
      </main>
    )
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Caminos de Atención</h1>

      <section style={{ marginBottom: '1rem' }}>
        <p><strong>Estado:</strong> {status}</p>
        <p><strong>User ID:</strong> {userId || 'todavía no creado'}</p>
        <p><strong>Session ID:</strong> {sessionId || 'todavía no creada'}</p>
        <p><strong>Escena activa:</strong> {scene}</p>
        <p><strong>Calma:</strong> {calmaScore}</p>
        <p><strong>Impulso:</strong> {impulsoScore}</p>
      </section>

      <section style={{ marginBottom: '1rem' }}>
        <button onClick={iniciarCuento} style={{ marginRight: '1rem' }}>
          Iniciar cuento
        </button>

        <button onClick={volverAtras} disabled={history.length === 0}>
          Atrás
        </button>
      </section>

      <hr />

      {/* Componente visual p5.js.
          React mantiene la lógica narrativa y Supabase;
          p5 solo representa la imagen y las animaciones de la escena activa. */}
      <section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        <P5Scene scene={scene} image={currentScene.image} />
      </section>

      <section>
        <h2>{currentScene.title}</h2>
        <p>{currentScene.text}</p>

        {currentScene.isEnding && (
          <p style={{ marginTop: '1rem' }}>
            {obtenerTextoEpilogo()}
          </p>
        )}

        {currentScene.choices.map((choice) => (
          <button
            key={choice.label}
            onClick={() => guardarDecision(choice)}
            style={{ display: 'block', marginBottom: '1rem' }}
          >
            {choice.label}
          </button>
        ))}

        {currentScene.isEnding && (
          <button onClick={reiniciarRecorrido}>
            Volver al inicio
          </button>
        )}
      </section>
    </main>
  )
}

export default App