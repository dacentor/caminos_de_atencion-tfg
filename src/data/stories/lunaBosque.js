// Datos narrativos del cuento "Luna en el bosque".
// La estructura sigue un modelo convergente:
// cada decisión genera una variación del recorrido,
// pero todas las rutas terminan confluyendo en un mismo epílogo.

export const lunaBosque = {
  escena_1: {
    title: 'Comienzo del viaje',
    text: 'Luna inicia su camino con Kiro y Mika hacia el Bosque de las Mil Distracciones. Todo es color, movimiento y estímulos a su alrededor.',
    choices: [
      {
        label: 'A. Se distrae con las mariposas',
        next: 'escena_1A'
      },
      {
        label: 'B. Respira y sigue el camino',
        next: 'escena_1B'
      }
    ],
    isEnding: false
  },

  escena_1A: {
    title: 'Resultado del comienzo',
    text: 'Luna se deja llevar por las mariposas junto a Mika. Kiro la espera en el camino con paciencia.',
    choices: [
      {
        label: 'Seguir adelante',
        next: 'escena_2'
      }
    ],
    isEnding: false
  },

  escena_1B: {
    title: 'Resultado del comienzo',
    text: 'Luna respira hondo y decide seguir el camino con Kiro. Mika los acompaña desde el aire.',
    choices: [
      {
        label: 'Seguir adelante',
        next: 'escena_2'
      }
    ],
    isEnding: false
  },

  escena_2: {
    title: 'El puente de ramas',
    text: 'Llegan a un río que corta el paso. Kiro empieza a construir un puente mientras Mika llama a Luna hacia algo brillante.',
    choices: [
      {
        label: 'A. Sigue a Mika',
        next: 'escena_2A'
      },
      {
        label: 'B. Ayuda a Kiro con el puente',
        next: 'escena_2B'
      }
    ],
    isEnding: false
  },

  escena_2A: {
    title: 'Resultado del puente',
    text: 'Luna sigue a Mika durante un momento, descubre la belleza del bosque y después regresa para cruzar el puente.',
    choices: [
      {
        label: 'Continuar por el sendero',
        next: 'escena_3'
      }
    ],
    isEnding: false
  },

  escena_2B: {
    title: 'Resultado del puente',
    text: 'Luna ayuda a Kiro. Juntos terminan el puente y cruzan con calma al otro lado.',
    choices: [
      {
        label: 'Continuar por el sendero',
        next: 'escena_3'
      }
    ],
    isEnding: false
  },

  escena_3: {
    title: 'El sendero del silbido',
    text: 'Después del río, el bosque se vuelve más tranquilo. De pronto, Luna oye un silbido extraño que aparece y desaparece entre el viento.',
    choices: [
      {
        label: 'A. Seguir el sonido del silbido',
        next: 'escena_3A'
      },
      {
        label: 'B. Pararse a escuchar con calma',
        next: 'escena_3B'
      }
    ],
    isEnding: false
  },

  escena_3A: {
    title: 'Resultado del sendero del silbido',
    text: 'Luna sigue el sonido y descubre que viene del viento al pasar por una roca hueca. Mika revolotea a su alrededor mientras Kiro la alcanza poco después.',
    choices: [
      {
        label: 'Seguir caminando',
        next: 'escena_4'
      }
    ],
    isEnding: false
  },

  escena_3B: {
    title: 'Resultado del sendero del silbido',
    text: 'Luna se detiene, respira y escucha con atención. Poco a poco comprende que el silbido cambia con el viento y descubre de dónde viene sin necesidad de correr tras él.',
    choices: [
      {
        label: 'Seguir caminando',
        next: 'escena_4'
      }
    ],
    isEnding: false
  },

  escena_4: {
    title: 'El brillo entre las ramas',
    text: 'Un poco más adelante, Luna ve un destello suave entre unas ramas bajas. Al mirar mejor, descubre varias telas finas que reflejan la luz como si fueran hilos de cristal.',
    choices: [
      {
        label: 'A. Acercarse para mirar de cerca',
        next: 'escena_4A'
      },
      {
        label: 'B. Observar un momento desde lejos y seguir',
        next: 'escena_4B'
      }
    ],
    isEnding: false
  },

  escena_4A: {
    title: 'Resultado del brillo entre las ramas',
    text: 'Luna se acerca despacio y descubre pequeños detalles en las telas brillantes. La luz cambia sobre los hilos y todo parece moverse con suavidad.',
    choices: [
      {
        label: 'Continuar hacia el claro',
        next: 'escena_5'
      }
    ],
    isEnding: false
  },

  escena_4B: {
    title: 'Resultado del brillo entre las ramas',
    text: 'Luna se queda un momento observando desde donde está. Nota cómo la luz cambia sobre las telas y siente que no hace falta acercarse más para disfrutar del instante.',
    choices: [
      {
        label: 'Continuar hacia el claro',
        next: 'escena_5'
      }
    ],
    isEnding: false
  },

  escena_5: {
    title: 'El claro de la calma',
    text: 'En el claro aparece la Flor de la Calma, brillando suavemente frente a Luna, Kiro y Mika.',
    choices: [
      {
        label: 'A. Abrazar la flor',
        next: 'escena_5A'
      },
      {
        label: 'B. Sentarse y observarla',
        next: 'escena_5B'
      }
    ],
    isEnding: false
  },

  escena_5A: {
    title: 'Resultado del claro',
    text: 'Luna abraza la flor luminosa. Siente la calma muy cerca, como un calor suave en el pecho.',
    choices: [
      {
        label: 'Ir al epílogo',
        next: 'escena_6'
      }
    ],
    isEnding: false
  },

  escena_5B: {
    title: 'Resultado del claro',
    text: 'Luna se sienta junto a Kiro y Mika. Observan la flor brillar en silencio.',
    choices: [
      {
        label: 'Ir al epílogo',
        next: 'escena_6'
      }
    ],
    isEnding: false
  },

  escena_6: {
    title: 'Epílogo',
    text: 'Luna regresa con Kiro y Mika. El bosque guarda el recuerdo de sus elecciones.',
    choices: [],
    isEnding: true
  }
}