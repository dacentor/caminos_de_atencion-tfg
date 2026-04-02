import { useState } from 'react'
import { supabase } from './supabase'

// Estructura básica del cuento interactivo.
// Cada escena contiene el texto que se muestra y las opciones disponibles.
const storyData = {
  escena_1: {
    text: 'Estás al inicio del cuento. ¿Qué quieres hacer?',
    choices: [
      { label: 'Seguir el camino A', next: 'escena_2' },
      { label: 'Seguir el camino B', next: 'escena_3' }
    ]
  },
  escena_2: {
    text: 'Has elegido el camino A.',
    choices: []
  },
  escena_3: {
    text: 'Has elegido el camino B.',
    choices: []
  }
}

function App() {
  // Estado del usuario creado en la base de datos.
  const [userId, setUserId] = useState(null)

  // Estado de la sesión activa del cuento.
  const [sessionId, setSessionId] = useState(null)

  // Estado de la escena actual mostrada en pantalla.
  const [scene, setScene] = useState('escena_1')

  // Estado del mensaje informativo mostrado al usuario.
  const [status, setStatus] = useState('Pulsa "Iniciar cuento" para empezar.')

  // Crea un usuario de prueba y una sesión de cuento en Supabase.
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
          story_id: 'cuento_1'
        }
      ])
      .select()
      .single()

    if (sessionError) {
      console.error('Error al crear sesión:', sessionError)
      setStatus('Error al crear sesión.')
      return
    }

    setSessionId(sessionData.id)
    setStatus('Sesión iniciada correctamente.')
  }

  // Registra en la base de datos la decisión tomada en la escena actual
  // y actualiza la interfaz con la siguiente escena.
  async function guardarDecision(choice) {
    if (!sessionId) {
      setStatus('Primero tienes que iniciar el cuento.')
      return
    }

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

    setScene(choice.next)
    setStatus(`Decisión guardada: ${choice.label}`)
  }

  // Obtiene la información de la escena actual para renderizarla.
  const currentScene = storyData[scene]

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Caminos de Atención</h1>

      {/* Estado actual de la aplicación */}
      <p><strong>Estado:</strong> {status}</p>
      <p><strong>User ID:</strong> {userId || 'todavía no creado'}</p>
      <p><strong>Session ID:</strong> {sessionId || 'todavía no creada'}</p>

      {/* Inicio de la sesión del cuento */}
      <button onClick={iniciarCuento} style={{ marginBottom: '2rem' }}>
        Iniciar cuento
      </button>

      <hr />

      {/* Escena activa del cuento */}
      <h2>{scene}</h2>
      <p>{currentScene.text}</p>

      {/* Opciones disponibles para la escena actual */}
      {currentScene.choices.map((choice) => (
        <button
          key={choice.label}
          onClick={() => guardarDecision(choice)}
          style={{ display: 'block', marginBottom: '1rem' }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

export default App