import { supabase } from './supabase'

function App() {
  async function crearUsuarioPrueba() {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name: 'Usuario desde React' }])
      .select()

    if (error) {
      console.error('Error al crear usuario:', error)
      return
    }

    console.log('Usuario creado:', data)
    alert('Usuario creado correctamente')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Caminos de Atención</h1>
      <p>Prueba de conexión con Supabase</p>
      <button onClick={crearUsuarioPrueba}>
        Crear usuario de prueba
      </button>
    </div>
  )
}

export default App