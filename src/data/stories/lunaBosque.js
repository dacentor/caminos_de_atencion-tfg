// Datos narrativos del cuento "Luna en el bosque".
// La estructura sigue un modelo convergente:
// cada decisión genera una variación del recorrido,
// pero todas las rutas terminan confluyendo en un mismo epílogo.

export const lunaBosque = {
  escena_1: {
    title: 'Escena 1',
    text: 'Escena 1',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_1A'
      },
      {
        label: 'Opción 2',
        next: 'escena_1B'
      }
    ],
    isEnding: false
  },

  escena_1A: {
    title: 'Escena 1 - Opción 1',
    text: 'Escena 1 - Opción 1',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_2'
      }
    ],
    isEnding: false
  },

  escena_1B: {
    title: 'Escena 1 - Opción 2',
    text: 'Escena 1 - Opción 2',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_2'
      }
    ],
    isEnding: false
  },

  escena_2: {
    title: 'Escena 2',
    text: 'Escena 2',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_2A'
      },
      {
        label: 'Opción 2',
        next: 'escena_2B'
      }
    ],
    isEnding: false
  },

  escena_2A: {
    title: 'Escena 2 - Opción 1',
    text: 'Escena 2 - Opción 1',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_3'
      }
    ],
    isEnding: false
  },

  escena_2B: {
    title: 'Escena 2 - Opción 2',
    text: 'Escena 2 - Opción 2',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_3'
      }
    ],
    isEnding: false
  },

  escena_3: {
    title: 'Escena 3',
    text: 'Escena 3',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_3A'
      },
      {
        label: 'Opción 2',
        next: 'escena_3B'
      }
    ],
    isEnding: false
  },

  escena_3A: {
    title: 'Escena 3 - Opción 1',
    text: 'Escena 3 - Opción 1',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_4'
      }
    ],
    isEnding: false
  },

  escena_3B: {
    title: 'Escena 3 - Opción 2',
    text: 'Escena 3 - Opción 2',
    choices: [
      {
        label: 'Opción 1',
        next: 'escena_4'
      }
    ],
    isEnding: false
  },

  escena_4: {
    title: 'Escena 4',
    text: 'Escena 4',
    choices: [],
    isEnding: true
  }
}