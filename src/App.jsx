import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { lunaBosque } from './data/stories/lunaBosque'
import P5Scene from './components/P5Scene'

function App() {
  // Usuario adulto autenticado mediante Supabase Auth.
  const [authUser, setAuthUser] = useState(null)

  // Campos del formulario de acceso.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Historial de sesiones asociadas al adulto autenticado.
  const [sessions, setSessions] = useState([])

  // Identificador de la sesión narrativa actual.
  const [sessionId, setSessionId] = useState(null)

  // Escena activa del cuento.
  const [scene, setScene] = useState('escena_1')

  // Mensaje de estado mostrado en la interfaz.
  const [status, setStatus] = useState('Inicia sesión o regístrate para empezar.')

  // Historial simple del recorrido realizado dentro de la sesión actual.
  const [history, setHistory] = useState([])

  // Variables narrativas acumuladas durante el recorrido.
  const [calmaScore, setCalmaScore] = useState(0)
  const [impulsoScore, setImpulsoScore] = useState(0)

  // Obtiene los datos de la escena activa.
  const currentScene = lunaBosque[scene]

  // Recupera una sesión activa si el usuario ya había iniciado sesión.
  useEffect(() => {
    async function obtenerSesionActual() {
      const { data } = await supabase.auth.getUser()

      if (data?.user) {
        setAuthUser(data.user)
        setStatus('Sesión de adulto recuperada correctamente.')
        await cargarSesionesUsuario(data.user.id)
      }
    }

    obtenerSesionActual()
  }, [])

  async function cargarSesionesUsuario(userId) {
    if (!userId) return

    const { data, error } = await supabase
      .from('story_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (error) {
      console.error(error)
      setStatus('Error al cargar el historial de sesiones.')
      return
    }

    setSessions(data || [])
  }

  async function registrarse() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error(error)
      setStatus(`Error al registrar el usuario: ${error.message}`)
      return
    }

    setAuthUser(data.user)
    setStatus('Usuario registrado correctamente.')

    if (data.user) {
      await cargarSesionesUsuario(data.user.id)
    }
  }

  async function iniciarSesion() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error(error)
      setStatus(`Error al iniciar sesión: ${error.message}`)
      return
    }

    setAuthUser(data.user)
    setStatus('Sesión iniciada correctamente.')

    if (data.user) {
      await cargarSesionesUsuario(data.user.id)
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()

    setAuthUser(null)
    setSessions([])
    setSessionId(null)
    setScene('escena_1')
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Sesión cerrada.')
  }

  async function asegurarPerfilPublico(user) {
    const { error } = await supabase
      .from('users')
      .upsert([
        {
          id: user.id,
          name: user.email
        }
      ])

    if (error) {
      console.error(error)
      setStatus(`Error al preparar el perfil del usuario: ${error.message}`)
      return false
    }

    return true
  }

  async function iniciarCuento() {
    if (!authUser) {
      setStatus('Primero debes iniciar sesión con una cuenta adulta.')
      return
    }

    setStatus('Preparando perfil...')

    const perfilCorrecto = await asegurarPerfilPublico(authUser)

    if (!perfilCorrecto) return

    setStatus('Creando sesión del cuento...')

    const { data: sessionData, error: sessionError } = await supabase
      .from('story_sessions')
      .insert([
        {
          user_id: authUser.id,
          story_id: 'luna_bosque'
        }
      ])
      .select()
      .single()

    if (sessionError) {
      console.error(sessionError)
      setStatus(`Error al crear sesión: ${sessionError.message}`)
      return
    }

    setSessionId(sessionData.id)
    setScene('escena_1')
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Cuento iniciado correctamente.')

    await cargarSesionesUsuario(authUser.id)
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
      setStatus(`Error al guardar la decisión: ${error.message}`)
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

  const ultimaSesion = sessions[0]

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
      </section>

      {!authUser && (
        <section style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            placeholder="Email del adulto"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginRight: '0.5rem' }}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginRight: '0.5rem' }}
          />

          <button onClick={registrarse} style={{ marginRight: '0.5rem' }}>
            Registrarse
          </button>

          <button onClick={iniciarSesion}>
            Iniciar sesión
          </button>
        </section>
      )}

      {authUser && (
        <>
          <details style={{ marginBottom: '1rem' }}>
            <summary>Panel adulto</summary>
            <p><strong>Cuenta:</strong> {authUser.email}</p>
            <p><strong>Sesiones guardadas:</strong> {sessions.length}</p>
            <p><strong>Sesión actual:</strong> {sessionId || 'todavía no creada'}</p>
            <p><strong>Calma actual:</strong> {calmaScore}</p>
            <p><strong>Impulso actual:</strong> {impulsoScore}</p>
            <p>
              <strong>Última sesión:</strong>{' '}
              {ultimaSesion
                ? new Date(ultimaSesion.started_at).toLocaleString()
                : 'sin sesiones previas'}
            </p>
          </details>

          <section style={{ marginBottom: '1rem' }}>
            <button onClick={iniciarCuento} style={{ marginRight: '1rem' }}>
              Iniciar cuento
            </button>

            <button
              onClick={volverAtras}
              disabled={history.length === 0}
              style={{ marginRight: '1rem' }}
            >
              Atrás
            </button>

            <button onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </section>
        </>
      )}

      <hr />

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
            disabled={!sessionId}
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