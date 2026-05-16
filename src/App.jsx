import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import { lunaBosque } from './data/stories/lunaBosque'
import P5Scene from './components/P5Scene'

function App() {
  // Historia activa. Ahora solo tenemos Luna, pero esto deja la puerta abierta a más cuentos.
  const selectedStory = lunaBosque

  // Detectamos tamaño de pantalla para ajustar la interfaz sin romper tablets, móviles o proyector.
  const [isCompact, setIsCompact] = useState(window.innerWidth < 768)

  // Usuario adulto autenticado con Supabase Auth.
  const [authUser, setAuthUser] = useState(null)

  // Campos del formulario de acceso.
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Sesiones guardadas del adulto.
  const [sessions, setSessions] = useState([])

  // Decisiones guardadas en Supabase para esas sesiones.
  const [adultDecisions, setAdultDecisions] = useState([])

  // Sesión narrativa actual.
  const [sessionId, setSessionId] = useState(null)

  // Escena actual del cuento.
  const [scene, setScene] = useState(selectedStory.initialScene)

  // Mensaje de estado para saber qué está pasando.
  const [status, setStatus] = useState('Inicia sesión o regístrate para empezar.')

  // Historial local para el botón Atrás.
  const [history, setHistory] = useState([])

  // Scores del recorrido actual.
  const [calmaScore, setCalmaScore] = useState(0)
  const [impulsoScore, setImpulsoScore] = useState(0)

  // Control del sonido.
  const [soundEnabled, setSoundEnabled] = useState(false)

  // Audios cargados dinámicamente desde la configuración del cuento.
  const audioRefs = useRef({})
  const playedOneShotsRef = useRef({})

  // Escena activa leída desde el archivo de datos del cuento.
  const currentScene = selectedStory.scenes[scene]

  // Escuchamos cambios de tamaño para que la interfaz se adapte si giran tablet/móvil.
  useEffect(() => {
    function handleResize() {
      setIsCompact(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Recuperamos usuario si ya había sesión iniciada.
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

  // Preparamos los audios que declara la historia.
  useEffect(() => {
    const audioEntries = Object.entries(selectedStory.audioAssets || {})

    audioEntries.forEach(([key, config]) => {
      const audio = new Audio(config.path)
      audio.loop = Boolean(config.loop)
      audio.volume = 0
      audioRefs.current[key] = audio
    })

    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.currentTime = 0
      })

      audioRefs.current = {}
      playedOneShotsRef.current = {}
    }
  }, [selectedStory])

  // Cambiamos el sonido según lo que diga cada escena.
  useEffect(() => {
    if (!soundEnabled || !currentScene) return

    Object.values(audioRefs.current).forEach((audio) => {
      if (audio.loop) {
        audio.play().catch(() => {})
        audio.volume = 0
      }
    })

    const ambient = currentScene.audio?.ambient
    const loops = currentScene.audio?.loops || []
    const oneShot = currentScene.audio?.oneShot

    if (ambient?.key && audioRefs.current[ambient.key]) {
      audioRefs.current[ambient.key].volume = ambient.volume || 0
    }

    loops.forEach((loopConfig) => {
      const audio = audioRefs.current[loopConfig.key]

      if (audio) {
        audio.volume = loopConfig.volume || 0
      }
    })

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

    Object.values(audioRefs.current).forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = 0
    })
  }

  // Cargamos sesiones y decisiones para montar el panel adulto.
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

    playedOneShotsRef.current = {}
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

    if (authUser) {
      await cargarSesionesUsuario(authUser.id)
    }
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
    playedOneShotsRef.current = {}
    setScene(selectedStory.initialScene)
    setHistory([])
    setCalmaScore(0)
    setImpulsoScore(0)
    setStatus('Recorrido reiniciado.')
  }

  // Calculamos estadísticas adultas leyendo los impactos definidos en el cuento.
  function obtenerImpactoDecisionGuardada(decision) {
    const escenaGuardada = selectedStory.scenes[decision.scene_id]

    if (!escenaGuardada) {
      return { calma: 0, impulso: 0 }
    }

    const decisionEncontrada = escenaGuardada.choices.find(
      (choice) => choice.label === decision.decision_taken
    )

    return decisionEncontrada?.impact || { calma: 0, impulso: 0 }
  }

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

  const endingText = selectedStory.getEndingText({
    calmaScore,
    impulsoScore
  })

  const ultimaSesion = sessions[0]
  const ultimasSesiones = sessions.slice(0, 5)

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
    margin: '0.5rem',
    padding: '0.85rem 1.15rem',
    borderRadius: '12px',
    backgroundColor: '#A8DADC',
    color: '#1D3557',
    border: 'none',
    cursor: 'pointer',
    fontSize: isCompact ? '0.95rem' : '1rem',
    touchAction: 'manipulation'
  }

  const neutralButtonStyle = {
    margin: '0.5rem',
    padding: '0.85rem 1.15rem',
    borderRadius: '12px',
    backgroundColor: '#F6C977',
    color: '#1D3557',
    border: 'none',
    cursor: 'pointer',
    fontSize: isCompact ? '0.95rem' : '1rem',
    touchAction: 'manipulation'
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
    padding: '0.9rem',
    borderRadius: '14px',
    backgroundColor: 'white',
    border: '1px solid #A8DADC',
    overflowWrap: 'anywhere'
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
          <h1 style={titleStyle}>
            Caminos de Atención
          </h1>
          <p style={{ margin: 0, color: '#457B9D', fontSize: isCompact ? '0.95rem' : '1rem' }}>{status}</p>
        </header>

        {!authUser && (
          <section style={formSectionStyle}>
            <h2 style={{ color: '#1D3557', marginTop: 0, fontSize: isCompact ? '1.25rem' : '1.5rem' }}>Acceso adulto</h2>
            <p style={{ color: '#457B9D', lineHeight: '1.5' }}>Inicia sesión para guardar el recorrido del cuento.</p>

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
            <details style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '16px', backgroundColor: '#F1FAEE', border: '1px solid #A8DADC' }}>
              <summary style={{ cursor: 'pointer', color: '#1D3557', fontWeight: 'bold' }}>
                Panel adulto
              </summary>

              <div style={{ marginTop: '1rem', color: '#1D3557' }}>
                <div style={gridStyle}>
                  <div style={statCardStyle}>
                    <strong>Cuenta</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>{authUser.email}</p>
                  </div>

                  <div style={statCardStyle}>
                    <strong>Sesiones guardadas</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>{sessions.length}</p>
                  </div>

                  <div style={statCardStyle}>
                    <strong>Decisiones registradas</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>{adultDecisions.length}</p>
                  </div>

                  <div style={statCardStyle}>
                    <strong>Sesión actual</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>{sessionId || 'todavía no creada'}</p>
                  </div>
                </div>

                <div style={scoreGridStyle}>
                  <div style={statCardStyle}>
                    <strong>Calma acumulada</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>{adultStats.calma}</p>
                    <div style={barOuterStyle}>
                      <div style={{ width: `${adultCalmaPercent}%`, height: '100%', backgroundColor: '#A8DADC' }} />
                    </div>
                    <small>{adultCalmaPercent}% global</small>
                  </div>

                  <div style={statCardStyle}>
                    <strong>Impulso acumulado</strong>
                    <p style={{ margin: '0.4rem 0 0 0' }}>{adultStats.impulso}</p>
                    <div style={barOuterStyle}>
                      <div style={{ width: `${adultImpulsoPercent}%`, height: '100%', backgroundColor: '#F6C977' }} />
                    </div>
                    <small>{adultImpulsoPercent}% global</small>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.9rem', borderRadius: '14px', backgroundColor: 'white', border: '1px solid #A8DADC' }}>
                  <strong>Tendencia general:</strong>
                  <p style={{ margin: '0.4rem 0 0 0' }}>{tendenciaAdulto}</p>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.9rem', borderRadius: '14px', backgroundColor: 'white', border: '1px solid #A8DADC' }}>
                  <strong>Última sesión:</strong>
                  <p style={{ margin: '0.4rem 0 0 0' }}>
                    {ultimaSesion ? new Date(ultimaSesion.started_at).toLocaleString() : 'sin sesiones previas'}
                  </p>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.9rem', borderRadius: '14px', backgroundColor: 'white', border: '1px solid #A8DADC' }}>
                  <strong>Últimas sesiones</strong>

                  {ultimasSesiones.length === 0 ? (
                    <p style={{ margin: '0.4rem 0 0 0' }}>Todavía no hay sesiones guardadas.</p>
                  ) : (
                    <ul style={{ marginBottom: 0, paddingLeft: '1.2rem' }}>
                      {ultimasSesiones.map((session) => (
                        <li key={session.id}>
                          {session.story_id} — {new Date(session.started_at).toLocaleString()}
                        </li>
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

        {!sessionId && (
          <section style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1D3557', fontSize: isCompact ? '1.45rem' : '1.8rem', marginBottom: '0.8rem' }}>
              {currentScene.title}
            </h2>

            <p style={textStyle}>
              {currentScene.text}
            </p>

            <p style={{ color: '#457B9D', fontStyle: 'italic', lineHeight: '1.5' }}>
              {authUser
                ? 'Pulsa “Iniciar cuento” para guardar el recorrido y comenzar la aventura.'
                : 'Inicia sesión con una cuenta adulta para guardar el recorrido del cuento.'}
            </p>
          </section>
        )}

        {sessionId && (
          <section style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <h2 style={{ color: '#1D3557', fontSize: isCompact ? '1.45rem' : '1.8rem', marginBottom: '0.8rem' }}>
              {currentScene.title}
            </h2>

            <p style={textStyle}>
              {currentScene.text}
            </p>

            {currentScene.isEnding && (
              <p style={textStyle}>
                {endingText}
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