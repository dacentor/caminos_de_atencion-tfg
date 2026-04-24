import { useState } from 'react'
import { supabase } from './supabase'
import { lunaBosque } from './data/stories/lunaBosque'

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
  // Se utiliza para habilitar el botón "Atrás" en escenas intermedias.
  const [history, setHistory] = useState([])

  // Variables narrativas acumuladas durante el recorrido.
  // Permiten reflejar el tipo de decisiones tomadas por el usuario.
  const [calmaScore, setCalmaScore] = useState(0)
  const [impulsoScore, setImpulsoScore] = useState(0)

  // Crea un usuario de prueba y una sesión nueva del cuento.
  async function iniciarCuento() {
    setStatus('Creando usuario...')

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ name: 'Usuario demo React' }])
      .select()
      .single()

    if (userError) {
      console.error('Error al crear usuario:', userError)
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
      console.error('Error al crear sesión:', sessionError)
      setStatus('Error al crear sesión.')
      return
    }

    // Reinicia el estado narrativo al comenzar una nueva sesión.
    setSessionId(sessionData.id)
    setScene('escena_1')
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Sesión iniciada correctamente.')
  }

  // Devuelve el impacto narrativo aproximado de una elección.
  // Esta lógica puede mejorarse más adelante trasladando estos valores
  // directamente al archivo de datos del cuento.
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

  // Guarda en Supabase la decisión tomada y actualiza el estado narrativo local.
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
      console.error('Error al guardar decisión:', error)
      setStatus('Error al guardar la decisión.')
      return
    }

    // Guarda la escena actual en el historial para permitir retroceder.
    setHistory((prevHistory) => [...prevHistory, scene])

    // Actualiza las variables narrativas acumuladas.
    setCalmaScore((prevCalma) => prevCalma + calma)
    setImpulsoScore((prevImpulso) => prevImpulso + impulso)

    // Avanza a la siguiente escena.
    setScene(choice.next)
    setStatus(`Decisión guardada: ${choice.label}`)
  }

  // Permite volver a la escena anterior dentro del recorrido actual.
  // En esta versión, retroceder solo afecta al estado local de la interfaz.
  function volverAtras() {
    if (history.length === 0) {
      setStatus('No hay escenas anteriores en el recorrido actual.')
      return
    }

    const previousScene = history[history.length - 1]
    const updatedHistory = history.slice(0, -1)

    setScene(previousScene)
    setHistory(updatedHistory)
    setStatus('Has vuelto a la escena anterior.')
  }

  // Reinicia la parte visual del cuento manteniendo la sesión ya creada.
  function reiniciarRecorrido() {
    setScene('escena_1')
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Recorrido reiniciado.')
  }

  // Genera el texto del epílogo según el tipo de recorrido realizado.
  // El final sigue siendo común, pero el cierre se adapta al balance
  // entre decisiones más impulsivas y decisiones más calmadas.
  function obtenerTextoEpílogo() {
    if (calmaScore > impulsoScore) {
      return 'Hoy Luna ha encontrado muchas formas de estar tranquila. A lo largo del camino ha descubierto que detenerse, observar y respirar también forman parte de la aventura.'
    }

    if (impulsoScore > calmaScore) {
      return 'Hoy Luna ha seguido con curiosidad muchos estímulos del bosque. En su recorrido ha descubierto que explorar también puede enseñarle a escucharse y encontrar la calma.'
    }

    return 'Hoy Luna ha combinado curiosidad y calma durante el viaje. El bosque le ha mostrado que existen muchas formas de avanzar y que cada recorrido puede enseñarle algo distinto.'
  }

  // Obtiene los datos de la escena activa.
  const currentScene = lunaBosque[scene]

  // Si la escena es el epílogo, se añade un texto dinámico complementario.
  const epilogueText =
    currentScene.isEnding ? obtenerTextoEpílogo() : null

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Caminos de Atención</h1>

      {/* Estado general de la aplicación */}
      <p><strong>Estado:</strong> {status}</p>
      <p><strong>User ID:</strong> {userId || 'todavía no creado'}</p>
      <p><strong>Session ID:</strong> {sessionId || 'todavía no creada'}</p>

      {/* Información simple de variables narrativas */}
      <p><strong>Calma:</strong> {calmaScore}</p>
      <p><strong>Impulso:</strong> {impulsoScore}</p>

      {/* Botón para crear usuario y sesión antes de empezar el cuento */}
      <button onClick={iniciarCuento} style={{ marginBottom: '2rem', marginRight: '1rem' }}>
        Iniciar cuento
      </button>

      {/* Botón para retroceder dentro del recorrido actual */}
      <button onClick={volverAtras} style={{ marginBottom: '2rem' }}>
        Atrás
      </button>

      <hr />

      {/* Contenido principal de la escena activa */}
      <h2>{currentScene.title}</h2>
      <p><strong>ID de escena:</strong> {scene}</p>
      <p>{currentScene.text}</p>

      {/* Texto adicional del epílogo según el recorrido realizado */}
      {currentScene.isEnding && (
        <p style={{ marginTop: '1rem' }}>{epilogueText}</p>
      )}

      {/* Botones de elección para las escenas que todavía no son finales */}
      {currentScene.choices.map((choice) => (
        <button
          key={choice.label}
          onClick={() => guardarDecision(choice)}
          style={{ display: 'block', marginBottom: '1rem' }}
        >
          {choice.label}
        </button>
      ))}

      {/* Si la escena es final, se muestra una opción para reiniciar */}
      {currentScene.isEnding && (
        <button onClick={reiniciarRecorrido} style={{ marginTop: '1rem' }}>
          Volver al inicio
        </button>
      )}
    </div>
  )
}

export default App