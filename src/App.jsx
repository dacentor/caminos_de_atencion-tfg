import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { lunaBosque } from './data/stories/lunaBosque'
import P5Scene from './components/P5Scene'

function App() {
  // Historia activa. Ahora solo hay un cuento, pero queda preparado para añadir más.
  const selectedStory = lunaBosque

  // Detecta si estamos en móvil/tablet para adaptar tamaños y distribución.
  const [isCompact, setIsCompact] = useState(window.innerWidth < 768)

  // Datos del adulto autenticado con Supabase.
  const [authUser, setAuthUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Datos guardados para el panel adulto.
  const [sessions, setSessions] = useState([])
  const [adultDecisions, setAdultDecisions] = useState([])

  // Estado del cuento actual.
  const [sessionId, setSessionId] = useState(null)
  const [scene, setScene] = useState(selectedStory.initialScene)
  const [status, setStatus] = useState('Inicia sesión o regístrate para empezar.')
  const [history, setHistory] = useState([])

  // Puntuaciones del recorrido. Sirven para el epílogo y para el panel adulto.
  const [calmaScore, setCalmaScore] = useState(0)
  const [impulsoScore, setImpulsoScore] = useState(0)

  // Control del sonido.
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Referencias de audio. Uso useRef porque no necesito redibujar la interfaz al cambiar el volumen.
  const audioRefs = useRef({})
  const audioFadeIntervalsRef = useRef({})
  const playedOneShotsRef = useRef({})

  // Escena actual leída desde el archivo de datos del cuento.
  const currentScene = selectedStory.scenes[scene]

  // Ajuste responsive cuando cambia el tamaño de la pantalla.
  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Recupera una sesión adulta si el usuario ya estaba logueado.
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

  // Carga los sonidos definidos en el cuento.
  // Así App.jsx no necesita saber nombres concretos de archivos de audio.
  useEffect(() => {
    const audioEntries = Object.entries(selectedStory.audioAssets || {})

    audioEntries.forEach(([key, config]) => {
      const audio = new Audio(config.path)
      audio.loop = Boolean(config.loop)
      audio.volume = 0
      audioRefs.current[key] = audio
    })

    return () => {
      Object.values(audioFadeIntervalsRef.current).forEach((intervalId) => {
        clearInterval(intervalId)
      })

      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })

      audioRefs.current = {}
      audioFadeIntervalsRef.current = {}
      playedOneShotsRef.current = {}
    }
  }, [selectedStory])

  // Cambia el volumen poco a poco para que el paso entre escenas no sea brusco.
  function ajustarVolumenSuave(audioKey, targetVolume) {
    const audio = audioRefs.current[audioKey]
    if (!audio) return

    if (audioFadeIntervalsRef.current[audioKey]) {
      clearInterval(audioFadeIntervalsRef.current[audioKey])
    }

    const startVolume = audio.volume
    const safeTargetVolume = Math.max(0, Math.min(1, targetVolume))
    const steps = 18
    let currentStep = 0

    audioFadeIntervalsRef.current[audioKey] = setInterval(() => {
      currentStep += 1

      const progress = currentStep / steps
      audio.volume = startVolume + (safeTargetVolume - startVolume) * progress

      if (currentStep >= steps) {
        audio.volume = safeTargetVolume
        clearInterval(audioFadeIntervalsRef.current[audioKey])
        delete audioFadeIntervalsRef.current[audioKey]
      }
    }, 45)
  }

  // Ajusta el sonido según la escena actual.
  // Primero baja todos los loops y luego sube solo los que esa escena necesita.
  useEffect(() => {
    if (!soundEnabled || !currentScene) return

    Object.entries(audioRefs.current).forEach(([audioKey, audio]) => {
      if (audio.loop) {
        audio.play().catch(() => {})
        ajustarVolumenSuave(audioKey, 0)
      }
    })

    const ambient = currentScene.audio?.ambient
    const loops = currentScene.audio?.loops || []
    const oneShot = currentScene.audio?.oneShot

    if (ambient?.key) {
      ajustarVolumenSuave(ambient.key, ambient.volume || 0)
    }

    loops.forEach((loopConfig) => {
      ajustarVolumenSuave(loopConfig.key, loopConfig.volume || 0)
    })

    // Los oneShot son efectos puntuales. Se reproducen una vez por escena.
    if (oneShot?.key && audioRefs.current[oneShot.key]) {
      const oneShotId = `${scene}_${oneShot.key}`

      if (!playedOneShotsRef.current[oneShotId]) {
        const audio = audioRefs.current[oneShot.key]
        audio.currentTime = 0
        audio.volume = oneShot.volume || 0.25
        audio.play().catch(() => {})
        playedOneShotsRef.current[oneShotId] = true
      }
    }
  }, [currentScene, scene, soundEnabled, selectedStory])

  async function activarSonido() {
    setSoundEnabled(true)
    setStatus('Sonido activado.')

    Object.values(audioRefs.current).forEach((audio) => {
      if (audio.loop) {
        audio.play().catch(() => {})
      }
    })
  }

  function desactivarSonido() {
    setSoundEnabled(false)
    setStatus('Sonido desactivado.')

    Object.values(audioFadeIntervalsRef.current).forEach((intervalId) => {
      clearInterval(intervalId)
    })

    audioFadeIntervalsRef.current = {}

    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = 0
    })
  }

  // Carga las sesiones y decisiones del adulto para mostrar el dashboard.
  async function cargarSesionesUsuario(userId) {
    if (!userId) return

    const { data: sessionsData, error: sessionsError } = await supabase
      .from('story_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (sessionsError) {
      console.error(sessionsError)
      setStatus('Error al cargar el historial de sesiones.')
      return
    }

    setSessions(sessionsData || [])

    if (!sessionsData || sessionsData.length === 0) {
      setAdultDecisions([])
      return
    }

    const sessionIds = sessionsData.map((session) => session.id)

    const { data: decisionsData, error: decisionsError } = await supabase
      .from('scene_decisions')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })

    if (decisionsError) {
      console.error(decisionsError)
      setStatus('Error al cargar las decisiones del panel adulto.')
      return
    }

    setAdultDecisions(decisionsData || [])
  }

  async function registrarse() {
    const { data, error } = await supabase.auth.signUp({ email, password })

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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

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
    setAdultDecisions([])
    setSessionId(null)
    setScene(selectedStory.initialScene)
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    playedOneShotsRef.current = {}
    desactivarSonido()
    setStatus('Sesión cerrada.')
  }

  // Asegura que también exista un perfil en la tabla users.
  // Supabase Auth gestiona el acceso, pero esta tabla sirve para relacionar datos del proyecto.
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

  // Crea una sesión nueva de cuento. A partir de aquí ya se guardan decisiones.
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

    playedOneShotsRef.current = {}
    setSessionId(sessionData.id)
    setScene(selectedStory.initialScene)
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Cuento iniciado correctamente.')

    await cargarSesionesUsuario(authUser.id)
  }

  // Guarda la decisión tomada, actualiza puntuaciones y avanza a la siguiente escena.
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

    if (authUser) {
      await cargarSesionesUsuario(authUser.id)
    }
  }

  // Permite volver una escena atrás dentro del recorrido actual.
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
    playedOneShotsRef.current = {}
    setScene(selectedStory.initialScene)
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Recorrido reiniciado.')
  }

  // Busca el impacto de una decisión ya guardada.
  // Esto permite calcular estadísticas adultas aunque solo guardemos el texto de la decisión.
  function obtenerImpactoDecisionGuardada(decision) {
    const escenaGuardada = selectedStory.scenes[decision.scene_id]
    if (!escenaGuardada) return { calma: 0, impulso: 0 }

    const decisionEncontrada = escenaGuardada.choices.find(
      (choice) => choice.label === decision.decision_taken
    )

    return decisionEncontrada?.impact || { calma: 0, impulso: 0 }
  }

  // Calcula la suma global de calma e impulso para el panel adulto.
  const adultStats = adultDecisions.reduce(
    (stats, decision) => {
      const impact = obtenerImpactoDecisionGuardada(decision)

      return {
        calma: stats.calma + impact.calma,
        impulso: stats.impulso + impact.impulso
      }
    },
    { calma: 0, impulso: 0 }
  )

  const totalAdultImpact = adultStats.calma + adultStats.impulso
  const adultCalmaPercent =
    totalAdultImpact > 0 ? Math.round((adultStats.calma / totalAdultImpact) * 100) : 0
  const adultImpulsoPercent =
    totalAdultImpact > 0 ? Math.round((adultStats.impulso / totalAdultImpact) * 100) : 0

  const tendenciaAdulto =
    adultStats.calma > adultStats.impulso
      ? 'Predominio de decisiones calmadas'
      : adultStats.impulso > adultStats.calma
        ? 'Predominio de decisiones exploratorias'
        : 'Equilibrio entre calma y exploración'

  const endingText = selectedStory.getEndingText({ calmaScore, impulsoScore })
  const ultimaSesion = sessions[0]
  const ultimasSesiones = sessions.slice(0, 5)

  // Estilos principales. Están aquí para mantener el prototipo en un solo archivo visual.
  const primaryButtonStyle = {
    margin: '0.5rem',
    padding: '0.85rem 1.15rem',
    borderRadius: '12px',
    backgroundColor: '#1D3557',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: isCompact ? '0.95rem' : '1rem',
    touchAction: 'manipulation'
  }

  const secondaryButtonStyle = {
    ...primaryButtonStyle,
    backgroundColor: '#A8DADC',
    color: '#1D3557'
  }

  const neutralButtonStyle = {
    ...primaryButtonStyle,
    backgroundColor: '#F6C977',
    color: '#1D3557'
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
    fontSize: isCompact ? '0.98rem' : '1rem',
    lineHeight: '1.4',
    touchAction: 'manipulation',
    boxSizing: 'border-box'
  }

  const disabledButtonStyle = {
    ...neutralButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed'
  }

  const inputStyle = {
    width: '100%',
    maxWidth: '320px',
    margin: '0.5rem auto',
    padding: '0.9rem',
    borderRadius: '10px',
    border: '1px solid #A8DADC',
    fontSize: '1rem',
    boxSizing: 'border-box',
    display: 'block'
  }

  const statCardStyle = {
    padding: '1rem',
    borderRadius: '16px',
    backgroundColor: 'white',
    border: '1px solid #A8DADC',
    overflowWrap: 'anywhere',
    boxShadow: '0 6px 18px rgba(29, 53, 87, 0.08)'
  }

  const barOuterStyle = {
    width: '100%',
    height: '12px',
    borderRadius: '999px',
    backgroundColor: '#E8F3F1',
    overflow: 'hidden',
    marginTop: '0.35rem'
  }

  const mainStyle = {
    minHeight: '100vh',
    backgroundColor: '#F1FAEE',
    padding: isCompact ? '0.75rem' : '2rem',
    fontFamily: 'Lexend Deca, Arial, sans-serif',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  }

  const appContainerStyle = {
    width: '100%',
    maxWidth: '960px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: isCompact ? '20px' : '24px',
    padding: isCompact ? '1rem' : '2rem',
    boxShadow: '0 12px 34px rgba(29, 53, 87, 0.14)',
    boxSizing: 'border-box'
  }

  const titleStyle = {
    marginBottom: '0.5rem',
    color: '#1D3557',
    fontSize: isCompact ? '2rem' : '2.4rem',
    lineHeight: '1.05'
  }

  const formSectionStyle = {
    margin: '1.5rem auto',
    padding: isCompact ? '1rem' : '1.2rem',
    borderRadius: '18px',
    backgroundColor: '#F1FAEE',
    border: '1px solid #A8DADC',
    textAlign: 'center',
    boxSizing: 'border-box'
  }

  const textStyle = {
    maxWidth: '760px',
    margin: '0 auto 1.2rem auto',
    color: '#1D3557',
    fontSize: isCompact ? '1rem' : '1.12rem',
    lineHeight: '1.7'
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '0.8rem'
  }

  const scoreGridStyle = {
    marginTop: '1rem',
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.8rem'
  }

  // Seguridad básica por si una escena no existe o se escribe mal su id.
  if (!currentScene) {
    return (
      <main style={mainStyle}>
        <div style={appContainerStyle}>
          <h1 style={{ textAlign: 'center', color: '#1D3557' }}>Caminos de Atención</h1>
          <p>Escena no encontrada: {scene}</p>
          <button onClick={reiniciarRecorrido} style={primaryButtonStyle}>Volver al inicio</button>
        </div>
      </main>
    )
  }

  return (
    <main style={mainStyle}>
      <div style={appContainerStyle}>
        <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 style={titleStyle}>Caminos de Atención</h1>
          <p style={{ margin: 0, color: '#457B9D', fontSize: isCompact ? '0.95rem' : '1rem' }}>
            {status}
          </p>
        </header>

        {!authUser && (
          <section style={formSectionStyle}>
            <h2 style={{ color: '#1D3557', marginTop: 0, fontSize: isCompact ? '1.25rem' : '1.5rem' }}>
              Acceso adulto
            </h2>
            <p style={{ color: '#457B9D', lineHeight: '1.5' }}>
              Inicia sesión para guardar el recorrido del cuento.
            </p>

            <input type="email" placeholder="Email del adulto" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.3rem' }}>
              <button onClick={registrarse} style={primaryButtonStyle}>Registrarse</button>
              <button onClick={iniciarSesion} style={secondaryButtonStyle}>Iniciar sesión</button>
            </div>
          </section>
        )}

        {authUser && (
          <>
            <details style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '18px', backgroundColor: '#F1FAEE', border: '1px solid #A8DADC' }}>
              <summary style={{ cursor: 'pointer', color: '#1D3557', fontWeight: 'bold' }}>
                Panel adulto
              </summary>

              <div style={{ marginTop: '1rem', color: '#1D3557' }}>
                <div style={gridStyle}>
                  <div style={statCardStyle}><strong>Cuenta</strong><p>{authUser.email}</p></div>
                  <div style={statCardStyle}><strong>Sesiones guardadas</strong><p>{sessions.length}</p></div>
                  <div style={statCardStyle}><strong>Decisiones registradas</strong><p>{adultDecisions.length}</p></div>
                  <div style={statCardStyle}><strong>Sesión actual</strong><p>{sessionId || 'todavía no creada'}</p></div>
                </div>

                <div style={scoreGridStyle}>
                  <div style={statCardStyle}>
                    <strong>Calma acumulada</strong>
                    <p>{adultStats.calma}</p>
                    <div style={barOuterStyle}>
                      <div style={{ width: `${adultCalmaPercent}%`, height: '100%', backgroundColor: '#A8DADC' }} />
                    </div>
                    <small>{adultCalmaPercent}% global</small>
                  </div>

                  <div style={statCardStyle}>
                    <strong>Impulso acumulado</strong>
                    <p>{adultStats.impulso}</p>
                    <div style={barOuterStyle}>
                      <div style={{ width: `${adultImpulsoPercent}%`, height: '100%', backgroundColor: '#F6C977' }} />
                    </div>
                    <small>{adultImpulsoPercent}% global</small>
                  </div>
                </div>

                <div style={{ ...statCardStyle, marginTop: '1rem' }}>
                  <strong>Tendencia general</strong>
                  <p>{tendenciaAdulto}</p>
                </div>

                <div style={{ ...statCardStyle, marginTop: '1rem' }}>
                  <strong>Última sesión</strong>
                  <p>{ultimaSesion ? new Date(ultimaSesion.started_at).toLocaleString() : 'sin sesiones previas'}</p>
                </div>

                <div style={{ ...statCardStyle, marginTop: '1rem' }}>
                  <strong>Últimas sesiones</strong>
                  {ultimasSesiones.length === 0 ? (
                    <p>Todavía no hay sesiones guardadas.</p>
                  ) : (
                    <ul style={{ marginBottom: 0, paddingLeft: '1.2rem' }}>
                      {ultimasSesiones.map((session) => (
                        <li key={session.id}>{session.story_id} — {new Date(session.started_at).toLocaleString()}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <p style={{ marginTop: '1rem', color: '#457B9D', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Este panel resume el recorrido del usuario adulto y ayuda a observar patrones generales entre calma y exploración.
                </p>
              </div>
            </details>

            <section style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.25rem' }}>
              <button onClick={iniciarCuento} style={secondaryButtonStyle}>Iniciar cuento</button>
              <button onClick={volverAtras} disabled={history.length === 0} style={history.length === 0 ? disabledButtonStyle : neutralButtonStyle}>Atrás</button>
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

        {/* Vista previa antes de iniciar una sesión narrativa. */}
        {!sessionId && (
          <section style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1D3557', fontSize: isCompact ? '1.45rem' : '1.8rem', marginBottom: '0.8rem' }}>
              {currentScene.title}
            </h2>
            <p style={textStyle}>{currentScene.text}</p>
            <p style={{ color: '#457B9D', fontStyle: 'italic', lineHeight: '1.5' }}>
              {authUser
                ? 'Pulsa “Iniciar cuento” para guardar el recorrido y comenzar la aventura.'
                : 'Inicia sesión con una cuenta adulta para guardar el recorrido del cuento.'}
            </p>
          </section>
        )}

        {/* Cuento activo: se muestran texto, epílogo si toca y botones de decisión. */}
        {sessionId && (
          <section style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1D3557', fontSize: isCompact ? '1.45rem' : '1.8rem', marginBottom: '0.8rem' }}>
              {currentScene.title}
            </h2>
            <p style={textStyle}>{currentScene.text}</p>

            {currentScene.isEnding && <p style={textStyle}>{endingText}</p>}

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