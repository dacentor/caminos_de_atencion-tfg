// Datos del cuento "Luna en el bosque".
// Aquí guardo la historia, las escenas, las imágenes, los sonidos y las decisiones.
// La idea es que App.jsx funcione como motor general y este archivo sea solo el contenido del cuento.

export const lunaBosque = {
  id: 'luna_bosque',
  title: 'Luna en el bosque',
  initialScene: 'escena_1',

  // Sonidos que puede usar el cuento.
  // Luego cada escena elige cuáles necesita y con qué volumen.
  audioAssets: {
    bosque: {
      path: '/audio/bosque.mp3',
      loop: true
    },
    agua: {
      path: '/audio/agua.mp3',
      loop: true
    },
    calma: {
      path: '/audio/calma.mp3',
      loop: true
    },
    silbido_viento: {
      path: '/audio/silbido_viento.mp3',
      loop: true
    },
    claro_entrada: {
      path: '/audio/claro_entrada.mp3',
      loop: false
    }
  },

  // El epílogo cambia según las decisiones del recorrido.
  // Así no hay un único cierre fijo, sino una pequeña respuesta al camino elegido.
  getEndingText: ({ calmaScore, impulsoScore }) => {
    if (calmaScore > impulsoScore) {
      return 'Hoy Luna ha encontrado muchas formas de estar tranquila. A lo largo del camino ha descubierto que detenerse, observar y respirar también forman parte de la aventura.'
    }

    if (impulsoScore > calmaScore) {
      return 'Hoy Luna ha seguido con curiosidad muchos estímulos del bosque. En su recorrido ha descubierto que explorar también puede enseñarle a escucharse y encontrar la calma.'
    }

    return 'Hoy Luna ha combinado curiosidad y calma durante el viaje. El bosque le ha mostrado que existen muchas formas de avanzar y que cada recorrido puede enseñarle algo distinto.'
  },

  scenes: {
    // Primera escena: presenta a Luna, Kiro y Mika de forma sencilla.
    escena_1: {
      title: 'Comienzo del viaje',
      text: 'Luna es una niña que entra en el bosque de las mil distracciones con Kiro, su amigo zorro, y Mika, un pequeño y travieso pájaro azul. A su alrededor hay mariposas de colores, flores, hojas que se mueven con el viento, luces entre los árboles y sonidos nuevos por todas partes.',
      image: '/assets/portada.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.16
        }
      },
      choices: [
        {
          label: 'A. Correr detrás de las mariposas',
          next: 'escena_1A',
          impact: {
            calma: 0,
            impulso: 1
          }
        },
        {
          label: 'B. Respirar y seguir el camino',
          next: 'escena_1B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    // Resultado si Luna corre detrás de las mariposas.
    escena_1A: {
      title: 'Resultado del comienzo',
      text: 'Luna corre detrás de las mariposas junto a Mika. Las mariposas vuelan rápido entre las flores y los árboles. Kiro se queda en el camino esperándola con una sonrisa.',
      image: '/assets/escena1A.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.16
        }
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

    // Resultado si Luna respira y continúa con más calma.
    escena_1B: {
      title: 'Resultado del comienzo',
      text: 'Luna respira hondo y mira el camino. Kiro camina a su lado y Mika vuela cerca de ellos. Juntos siguen avanzando por el bosque.',
      image: '/assets/escena1B.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.16
        }
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

    // Escena del río y el puente de ramas.
    // El sonido de agua está más bajo para que acompañe sin molestar.
    escena_2: {
      title: 'El puente de ramas',
      text: 'Luna, Kiro y Mika llegan a un río que corta el camino. Kiro empieza a hacer un puente con ramas. Mientras tanto, Mika ve mariposas de colores en la orilla y llama a Luna.',
      image: '/assets/rio.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.06
        },
        loops: [
          {
            key: 'agua',
            volume: 0.11
          }
        ]
      },
      choices: [
        {
          label: 'A. Ir con Mika hacia el río',
          next: 'escena_2A',
          impact: {
            calma: 0,
            impulso: 1
          }
        },
        {
          label: 'B. Ayudar a Kiro con el puente',
          next: 'escena_2B',
          impact: {
            calma: 1,
            impulso: 0
          }
        }
      ],
      isEnding: false
    },

    // Luna explora con Mika, pero después vuelve al camino principal.
    escena_2A: {
      title: 'Resultado del puente',
      text: 'Luna va con Mika hacia el río. En la orilla descubre mariposas volando de distintos colores. Después vuelve con Kiro para cruzar el puente.',
      image: '/assets/rioA.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.06
        },
        loops: [
          {
            key: 'agua',
            volume: 0.11
          }
        ]
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

    // Luna ayuda a Kiro y cruza el puente de forma más calmada.
    escena_2B: {
      title: 'Resultado del puente',
      text: 'Luna ayuda a Kiro a colocar las ramas. Poco a poco hacen un puente sencillo. Después cruzan el río juntos y Mika vuela sobre ellos.',
      image: '/assets/rioB.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.06
        },
        loops: [
          {
            key: 'agua',
            volume: 0.08
          }
        ]
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

    // Escena del silbido: introduce un estímulo auditivo que puede distraer a Luna.
    escena_3: {
      title: 'El sendero del silbido',
      text: 'Después del río, siguen su camino y el bosque se vuelve más tranquilo. De pronto, Luna oye un silbido extraño que aparece y desaparece con el viento.',
      image: '/assets/sendero.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.1
        },
        loops: [
          {
            key: 'calma',
            volume: 0.03
          },
          {
            key: 'silbido_viento',
            volume: 0.2
          }
        ]
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

    // Luna sigue el sonido y descubre de dónde viene.
    escena_3A: {
      title: 'Resultado del sendero del silbido',
      text: 'Luna sigue el sonido y descubre que viene del viento al pasar por una roca hueca. Mika revolotea a su alrededor mientras Kiro la espera en el camino.',
      image: '/assets/senderoA.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.1
        },
        loops: [
          {
            key: 'calma',
            volume: 0.03
          },
          {
            key: 'silbido_viento',
            volume: 0.2
          }
        ]
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

    // Luna se detiene y escucha antes de actuar.
    escena_3B: {
      title: 'Resultado del sendero del silbido',
      text: 'Luna se detiene, respira y escucha con atención. Poco a poco comprende que el silbido cambia con el viento y descubre de dónde viene sin necesidad de correr tras él.',
      image: '/assets/senderoB.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.1
        },
        loops: [
          {
            key: 'calma',
            volume: 0.03
          },
          {
            key: 'silbido_viento',
            volume: 0.2
          }
        ]
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

    // Escena del brillo: trabaja la atención visual y la observación.
    escena_4: {
      title: 'El brillo entre las ramas',
      text: 'Un poco más adelante, Luna ve un destello suave entre unas ramas bajas. Al mirar mejor, descubre varias telarañas finas que reflejan la luz como si fueran hilos de cristal.',
      image: '/assets/brillo.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.14
        },
        loops: [
          {
            key: 'calma',
            volume: 0.04
          }
        ]
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

    // Luna se acerca al brillo para explorarlo mejor.
    escena_4A: {
      title: 'Resultado del brillo entre las ramas',
      text: 'Luna se acerca despacio y descubre pequeños detalles en las telarañas brillantes. La luz cambia sobre los hilos y todo parece moverse con suavidad.',
      image: '/assets/brilloA.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.14
        },
        loops: [
          {
            key: 'calma',
            volume: 0.04
          }
        ]
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

    // Luna observa desde lejos y decide continuar.
    escena_4B: {
      title: 'Resultado del brillo entre las ramas',
      text: 'Luna se queda un momento observando desde donde está. Nota cómo la luz cambia sobre las telarañas y siente que no hace falta acercarse más para disfrutar del instante.',
      image: '/assets/brilloB.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.14
        },
        loops: [
          {
            key: 'calma',
            volume: 0.04
          }
        ]
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

    // Escena del claro: punto final de calma antes del epílogo.
    escena_5: {
      title: 'El claro de la calma',
      text: 'En el claro aparece la Flor de la Calma, brillando suavemente frente a Luna, Kiro y Mika.',
      image: '/assets/claro.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.06
        },
        loops: [
          {
            key: 'calma',
            volume: 0.18
          }
        ],
        oneShot: {
          key: 'claro_entrada',
          volume: 0.28
        }
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

    // Luna conecta con la calma abrazando la flor.
    escena_5A: {
      title: 'Resultado del claro',
      text: 'Luna abraza la flor luminosa. Siente la calma muy cerca, como un calor suave en su pecho.',
      image: '/assets/florA.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.06
        },
        loops: [
          {
            key: 'calma',
            volume: 0.18
          }
        ]
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

    // Luna conecta con la calma observando en silencio.
    escena_5B: {
      title: 'Resultado del claro',
      text: 'Luna se sienta junto a Kiro y Mika. Observan la flor brillar en silencio y sienten la calma',
      image: '/assets/FlorB.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.06
        },
        loops: [
          {
            key: 'calma',
            volume: 0.18
          }
        ]
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

    // Escena final. El texto adicional del epílogo se calcula según el recorrido.
    escena_6: {
      title: 'Epílogo',
      text: 'Luna regresa con Kiro y Mika. El bosque guarda el recuerdo de sus elecciones.',
      image: '/assets/epilogo.png',
      audio: {
        ambient: {
          key: 'bosque',
          volume: 0.04
        },
        loops: [
          {
            key: 'calma',
            volume: 0.16
          }
        ]
      },
      choices: [],
      isEnding: true
    }
  }
}