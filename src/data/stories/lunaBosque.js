// Datos narrativos del cuento "Luna en el bosque".
// La estructura sigue un modelo convergente:
// cada decisión genera una variación del recorrido,
// pero todas las rutas terminan confluyendo en un mismo epílogo.
//
// La historia se define como un objeto autónomo para facilitar
// la incorporación futura de nuevos cuentos a la plataforma.

export const lunaBosque = {
  id: 'luna_bosque',
  title: 'Luna en el bosque',
  initialScene: 'escena_1',

  scenes: {
    escena_1: {
      title: 'Comienzo del viaje',
      text: 'Luna inicia su camino con Kiro y Mika hacia el Bosque de las Mil Distracciones. Todo es color, movimiento y estímulos a su alrededor.',
      image: '/assets/portada.png',
      audio: {
        ambient: 'bosque'
      },
      choices: [
        {
          label: 'A. Se distrae con las mariposas',
          next: 'escena_1A',
          impact: {
            calma: 0,
            impulso: 1
          }
        },
        {
          label: 'B. Respira y sigue el camino',
          next: 'escena_1B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_1A: {
      title: 'Resultado del comienzo',
      text: 'Luna se deja llevar por las mariposas junto a Mika. Kiro la espera en el camino con paciencia.',
      image: '/assets/escena1A.png',
      audio: {
        ambient: 'bosque'
      },
      choices: [
        {
          label: 'Seguir adelante',
          next: 'escena_2',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_1B: {
      title: 'Resultado del comienzo',
      text: 'Luna respira hondo y decide seguir el camino con Kiro. Mika los acompaña desde el aire.',
      image: '/assets/escena1B.png',
      audio: {
        ambient: 'bosque'
      },
      choices: [
        {
          label: 'Seguir adelante',
          next: 'escena_2',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_2: {
      title: 'El puente de ramas',
      text: 'Llegan a un río que corta el paso. Kiro empieza a construir un puente mientras Mika llama a Luna hacia algo brillante.',
      image: '/assets/rio.png',
      audio: {
        ambient: 'agua'
      },
      choices: [
        {
          label: 'A. Sigue a Mika',
          next: 'escena_2A',
          impact: {
            calma: 0,
            impulso: 1
          }
        },
        {
          label: 'B. Ayuda a Kiro con el puente',
          next: 'escena_2B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_2A: {
      title: 'Resultado del puente',
      text: 'Luna sigue a Mika durante un momento, descubre la belleza del bosque y después regresa para cruzar el puente.',
      image: '/assets/rioA.png',
      audio: {
        ambient: 'agua'
      },
      choices: [
        {
          label: 'Continuar por el sendero',
          next: 'escena_3',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_2B: {
      title: 'Resultado del puente',
      text: 'Luna ayuda a Kiro. Juntos terminan el puente y cruzan con calma al otro lado.',
      image: '/assets/rioB.png',
      audio: {
        ambient: 'agua'
      },
      choices: [
        {
          label: 'Continuar por el sendero',
          next: 'escena_3',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_3: {
      title: 'El sendero del silbido',
      text: 'Después del río, el bosque se vuelve más tranquilo. De pronto, Luna oye un silbido extraño que aparece y desaparece entre el viento.',
      image: '/assets/sendero.png',
      audio: {
        ambient: 'bosque',
        effect: 'silbido_viento'
      },
      choices: [
        {
          label: 'A. Seguir el sonido del silbido',
          next: 'escena_3A',
          impact: {
            calma: 0,
            impulso: 1
          }
        },
        {
          label: 'B. Pararse a escuchar con calma',
          next: 'escena_3B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_3A: {
      title: 'Resultado del sendero del silbido',
      text: 'Luna sigue el sonido y descubre que viene del viento al pasar por una roca hueca. Mika revolotea a su alrededor mientras Kiro la alcanza poco después.',
      image: '/assets/senderoA.png',
      audio: {
        ambient: 'bosque',
        effect: 'silbido_viento'
      },
      choices: [
        {
          label: 'Seguir caminando',
          next: 'escena_4',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_3B: {
      title: 'Resultado del sendero del silbido',
      text: 'Luna se detiene, respira y escucha con atención. Poco a poco comprende que el silbido cambia con el viento y descubre de dónde viene sin necesidad de correr tras él.',
      image: '/assets/senderoB.png',
      audio: {
        ambient: 'bosque',
        effect: 'silbido_viento'
      },
      choices: [
        {
          label: 'Seguir caminando',
          next: 'escena_4',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_4: {
      title: 'El brillo entre las ramas',
      text: 'Un poco más adelante, Luna ve un destello suave entre unas ramas bajas. Al mirar mejor, descubre varias telas finas que reflejan la luz como si fueran hilos de cristal.',
      image: '/assets/brillo.png',
      audio: {
        ambient: 'bosque'
      },
      choices: [
        {
          label: 'A. Acercarse para mirar de cerca',
          next: 'escena_4A',
          impact: {
            calma: 0,
            impulso: 1
          }
        },
        {
          label: 'B. Observar un momento desde lejos y seguir',
          next: 'escena_4B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_4A: {
      title: 'Resultado del brillo entre las ramas',
      text: 'Luna se acerca despacio y descubre pequeños detalles en las telas brillantes. La luz cambia sobre los hilos y todo parece moverse con suavidad.',
      image: '/assets/brilloA.png',
      audio: {
        ambient: 'bosque'
      },
      choices: [
        {
          label: 'Continuar hacia el claro',
          next: 'escena_5',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_4B: {
      title: 'Resultado del brillo entre las ramas',
      text: 'Luna se queda un momento observando desde donde está. Nota cómo la luz cambia sobre las telas y siente que no hace falta acercarse más para disfrutar del instante.',
      image: '/assets/brilloB.png',
      audio: {
        ambient: 'bosque'
      },
      choices: [
        {
          label: 'Continuar hacia el claro',
          next: 'escena_5',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_5: {
      title: 'El claro de la calma',
      text: 'En el claro aparece la Flor de la Calma, brillando suavemente frente a Luna, Kiro y Mika.',
      image: '/assets/claro.png',
      audio: {
        ambient: 'calma',
        effect: 'claro_entrada'
      },
      choices: [
        {
          label: 'A. Abrazar la flor',
          next: 'escena_5A',
          impact: {
            calma: 1,
            impulso: 0
          }
        },
        {
          label: 'B. Sentarse y observarla',
          next: 'escena_5B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_5A: {
      title: 'Resultado del claro',
      text: 'Luna abraza la flor luminosa. Siente la calma muy cerca, como un calor suave en el pecho.',
      image: '/assets/florA.png',
      audio: {
        ambient: 'calma'
      },
      choices: [
        {
          label: 'Ir al epílogo',
          next: 'escena_6',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_5B: {
      title: 'Resultado del claro',
      text: 'Luna se sienta junto a Kiro y Mika. Observan la flor brillar en silencio.',
      image: '/assets/FlorB.png',
      audio: {
        ambient: 'calma'
      },
      choices: [
        {
          label: 'Ir al epílogo',
          next: 'escena_6',
          impact: {
            calma: 0,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    escena_6: {
      title: 'Epílogo',
      text: 'Luna regresa con Kiro y Mika. El bosque guarda el recuerdo de sus elecciones.',
      image: '/assets/epilogo.png',
      audio: {
        ambient: 'calma'
      },
      choices: [],
      isEnding: true
    }
  }
}