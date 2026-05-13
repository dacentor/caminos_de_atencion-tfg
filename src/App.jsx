import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { lunaBosque } from './data/stories/lunaBosque'
import P5Scene from './components/P5Scene'

function App() {
  // Historia seleccionada actualmente.
  // En esta PEC solo se implementa "Luna en el bosque", pero esta estructura
  // permite sustituirla por otro cuento sin modificar el motor principal.
  const selectedStory = lunaBosque

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
  const [scene, setScene] = useState(selectedStory.initialScene)

  // Mensaje de estado mostrado en la interfaz.
  const [status, setStatus] = useState('Inicia sesión o regístrate para empezar.')

  // Historial simple del recorrido realizado dentro de la sesión actual.
  const [history, setHistory] = useState([])

  // Variables narrativas acumuladas durante el recorrido.
  const [calmaScore, setCalmaScore] = useState(0)
  const [impulsoScore, setImpulsoScore] = useState(0)

  // Estado del sonido.
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Referencias de audio.
  const bosqueAudioRef = useRef(null)
  const aguaAudioRef = useRef(null)
  const calmaAudioRef = useRef(null)
  const silbidoVientoAudioRef = useRef(null)
  const claroEntradaAudioRef = useRef(null)
  const claroEntradaPlayedRef = useRef(false)

  // Obtiene los datos de la escena activa.
  const currentScene = selectedStory.scenes[scene]

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

  // Prepara los audios una sola vez.
  useEffect(() => {
    bosqueAudioRef.current = new Audio('/audio/bosque.mp3')
    aguaAudioRef.current = new Audio('/audio/agua.mp3')
    calmaAudioRef.current = new Audio('/audio/calma.mp3')
    silbidoVientoAudioRef.current = new Audio('/audio/silbido_viento.mp3')
    claroEntradaAudioRef.current = new Audio('/audio/claro_entrada.mp3')

    const loopAudios = [
      bosqueAudioRef.current,
      aguaAudioRef.current,
      calmaAudioRef.current,
      silbidoVientoAudioRef.current
    ]

    loopAudios.forEach((audio) => {
      audio.loop = true
      audio.volume = 0
    })

    if (claroEntradaAudioRef.current) {
      claroEntradaAudioRef.current.loop = false
      claroEntradaAudioRef.current.volume = 0.28
    }

    return () => {
      loopAudios.forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })

      if (claroEntradaAudioRef.current) {
        claroEntradaAudioRef.current.pause()
        claroEntradaAudioRef.current.currentTime = 0
      }
    }
  }, [])

  // Actualiza el ambiente sonoro según la configuración multimedia de cada escena.
  useEffect(() => {
    if (!soundEnabled || !currentScene) return

    const bosqueAudio = bosqueAudioRef.current
    const aguaAudio = aguaAudioRef.current
    const calmaAudio = calmaAudioRef.current
    const silbidoVientoAudio = silbidoVientoAudioRef.current

    if (!bosqueAudio || !aguaAudio || !calmaAudio || !silbidoVientoAudio) return

    bosqueAudio.play().catch(() => {})
    aguaAudio.play().catch(() => {})
    calmaAudio.play().catch(() => {})
    silbidoVientoAudio.play().catch(() => {})

    let bosqueVolume = 0
    let aguaVolume = 0
    let calmaVolume = 0
    let silbidoVientoVolume = 0

    const ambient = currentScene.audio?.ambient
    const effect = currentScene.audio?.effect

    if (ambient === 'bosque') {
      bosqueVolume = 0.16
    }

    if (ambient === 'agua') {
      bosqueVolume = 0.08
      aguaVolume = 0.22
    }

    if (ambient === 'calma') {
      bosqueVolume = 0.06
      calmaVolume = 0.18
    }

    if (effect === 'silbido_viento') {
      bosqueVolume = 0.1
      calmaVolume = 0.03
      silbidoVientoVolume = 0.2
    }

    if (effect === 'claro_entrada' && !claroEntradaPlayedRef.current && claroEntradaAudioRef.current) {
      claroEntradaAudioRef.current.currentTime = 0
      claroEntradaAudioRef.current.play().catch(() => {})
      claroEntradaPlayedRef.current = true
    }

    bosqueAudio.volume = bosqueVolume
    aguaAudio.volume = aguaVolume
    calmaAudio.volume = calmaVolume
    silbidoVientoAudio.volume = silbidoVientoVolume
  }, [currentScene, soundEnabled])

  async function activarSonido() {
    setSoundEnabled(true)
    setStatus('Sonido activado.')

    const audios = [
      bosqueAudioRef.current,
      aguaAudioRef.current,
      calmaAudioRef.current,
      silbidoVientoAudioRef.current
    ]

    for (const audio of audios) {
      if (audio) {
        audio.play().catch(() => {})
      }
    }
  }

  function desactivarSonido() {
    setSoundEnabled(false)
    setStatus('Sonido desactivado.')

    const audios = [
      bosqueAudioRef.current,
      aguaAudioRef.current,
      calmaAudioRef.current,
      silbidoVientoAudioRef.current,
      claroEntradaAudioRef.current
    ]

    audios.forEach((audio) => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })
  }

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
    setScene(selectedStory.initialScene)
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    desactivarSonido()
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
          story_id: selectedStory.id
        }
      ])
      .select()
      .single()

    if (sessionError) {
      console.error(sessionError)
      setStatus(`Error al crear sesión: ${sessionError.message}`)
      return
    }

    claroEntradaPlayedRef.current = false
    setSessionId(sessionData.id)
    setScene(selectedStory.initialScene)
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Cuento iniciado correctamente.')

    await cargarSesionesUsuario(authUser.id)
  }

  async function guardarDecision(choice) {
    if (!sessionId) {
      setStatus('Primero tienes que iniciar el cuento.')
      return
    }

    const calma = choice.impact?.calma || 0
    const impulso = choice.impact?.impulso || 0

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
    claroEntradaPlayedRef.current = false
    setScene(selectedStory.initialScene)
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

  const primaryButtonStyle = {
    margin: '0.5rem',
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    backgroundColor: '#1D3557',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  }

  const secondaryButtonStyle = {
    margin: '0.5rem',
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    backgroundColor: '#A8DADC',
    color: '#1D3557',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  }

  const neutralButtonStyle = {
    margin: '0.5rem',
    padding: '0.8rem 1.2rem',
    borderRadius: '12px',
    backgroundColor: '#F6C977',
    color: '#1D3557',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  }

  const choiceButtonStyle = {
    display: 'block',
    width: '100%',
    maxWidth: '460px',
    margin: '1rem auto',
    padding: '1rem 1.2rem',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#1D3557',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: '1.4'
  }

  const disabledButtonStyle = {
    ...neutralButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  }

  const inputStyle = {
    margin: '0.5rem',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #A8DADC',
    minWidth: '220px',
    fontSize: '1rem'
  }

  if (!currentScene) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#F1FAEE', padding: '2rem', fontFamily: 'Lexend Deca, Arial, sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)' }}>
          <h1 style={{ textAlign: 'center', color: '#1D3557' }}>Caminos de Atención</h1>
          <p>Escena no encontrada: {scene}</p>
          <button onClick={reiniciarRecorrido} style={primaryButtonStyle}>Volver al inicio</button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F1FAEE', padding: '2rem', fontFamily: 'Lexend Deca, Arial, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', backgroundColor: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 12px 34px rgba(29, 53, 87, 0.14)' }}>
        <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={{ marginBottom: '0.5rem', color: '#1D3557', fontSize: '2.4rem' }}>
            Caminos de Atención
          </h1>
          <p style={{ margin: 0, color: '#457B9D', fontSize: '1rem' }}>{status}</p>
        </header>

        {!authUser && (
          <section style={{ margin: '1.5rem auto', padding: '1.2rem', borderRadius: '18px', backgroundColor: '#F1FAEE', border: '1px solid #A8DADC', textAlign: 'center' }}>
            <h2 style={{ color: '#1D3557', marginTop: 0 }}>Acceso adulto</h2>
            <p style={{ color: '#457B9D' }}>Inicia sesión para guardar el recorrido del cuento.</p>

            <input type="email" placeholder="Email del adulto" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

            <div>
              <button onClick={registrarse} style={primaryButtonStyle}>Registrarse</button>
              <button onClick={iniciarSesion} style={secondaryButtonStyle}>Iniciar sesión</button>
            </div>
          </section>
        )}

        {authUser && (
          <>
            <details style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '16px', backgroundColor: '#F1FAEE', border: '1px solid #A8DADC' }}>
              <summary style={{ cursor: 'pointer', color: '#1D3557', fontWeight: 'bold' }}>Panel adulto</summary>

              <div style={{ marginTop: '0.8rem', display: 'grid', gap: '0.4rem', color: '#1D3557', fontSize: '0.95rem' }}>
                <span><strong>Cuenta:</strong> {authUser.email}</span>
                <span><strong>Sesiones guardadas:</strong> {sessions.length}</span>
                <span><strong>Sesión actual:</strong> {sessionId || 'todavía no creada'}</span>
                <span><strong>Calma actual:</strong> {calmaScore}</span>
                <span><strong>Impulso actual:</strong> {impulsoScore}</span>
                <span><strong>Sonido:</strong> {soundEnabled ? 'activado' : 'desactivado'}</span>
                <span><strong>Cuento:</strong> {selectedStory.title}</span>
                <span>
                  <strong>Última sesión:</strong>{' '}
                  {ultimaSesion ? new Date(ultimaSesion.started_at).toLocaleString() : 'sin sesiones previas'}
                </span>
              </div>
            </details>

            <section style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <button onClick={iniciarCuento} style={secondaryButtonStyle}>Iniciar cuento</button>

              <button onClick={volverAtras} disabled={history.length === 0} style={history.length === 0 ? disabledButtonStyle : neutralButtonStyle}>
                Atrás
              </button>

              {!soundEnabled ? (
                <button onClick={activarSonido} style={neutralButtonStyle}>Activar sonido</button>
              ) : (
                <button onClick={desactivarSonido} style={neutralButtonStyle}>Desactivar sonido</button>
              )}

              <button onClick={cerrarSesion} style={primaryButtonStyle}>Cerrar sesión</button>
            </section>
          </>
        )}

        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #A8DADC' }} />

        <section style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <P5Scene scene={scene} image={currentScene.image} />
        </section>

        {authUser && !sessionId && (
          <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#457B9D', fontSize: '1.05rem' }}>
            Pulsa “Iniciar cuento” para comenzar la aventura 🌿
          </p>
        )}

        {sessionId && (
          <section style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1D3557', fontSize: '1.8rem', marginBottom: '0.8rem' }}>
              {currentScene.title}
            </h2>

            <p style={{ maxWidth: '760px', margin: '0 auto 1.2rem auto', color: '#1D3557', fontSize: '1.12rem', lineHeight: '1.7' }}>
              {currentScene.text}
            </p>

            {currentScene.isEnding && (
              <p style={{ maxWidth: '760px', margin: '0 auto 1.2rem auto', color: '#1D3557', fontSize: '1.12rem', lineHeight: '1.7' }}>
                {obtenerTextoEpilogo()}
              </p>
            )}

            {currentScene.choices.map((choice) => (
              <button key={choice.label} onClick={() => guardarDecision(choice)} disabled={!sessionId} style={choiceButtonStyle}>
                {choice.label}
              </button>
            ))}

            {currentScene.isEnding && (
              <button onClick={reiniciarRecorrido} style={secondaryButtonStyle}>Volver al inicio</button>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

export default App