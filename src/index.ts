import { Vector3, Color4 } from '@dcl/sdk/math'
import { engine, GltfContainer, Transform, Entity, UiText } from '@dcl/sdk/ecs'
import { changeColorSystem, circularSystem } from './systems'
import { setupUi } from './ui'
import { Spinner } from './components'

// Definir una interfaz para los objetos recolectables
interface Collectible {
  id: string
  entity: Entity
}

// Lista de todos los objetos recolectables
let collectibles: Collectible[] = []

// Conjunto de identificadores de objetos recolectados
let collectedSet: Set<string> = new Set()

export function main() {
  // Definir comportamiento
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)

  // Función para crear objetos recolectables
  function createCollectible(id: string, model: string, position: Vector3) {
    const entity: Entity = engine.addEntity()

    GltfContainer.create(entity, {
      src: `models/${model}.glb`
    })

    Transform.create(entity, {
      position: position
    })

    Spinner.create(entity, { speed: 100 })

    // Agregar el objeto a la lista de recolectables
    collectibles.push({ id, entity })
  }

  // Crear tres objetos recolectables con identificadores únicos
  createCollectible('pc1', 'pc', Vector3.create(3, 1, 3))
  createCollectible('avocado', 'avocado', Vector3.create(6, 1, 3))
  createCollectible('pc2', 'pc', Vector3.create(9, 1, 3))

  // Sistema para manejar la recolección
  engine.addSystem(() => {
    // Obtener la posición del jugador
    const playerEntity = engine.PlayerEntity
    const playerTransform = Transform.get(playerEntity)
    const playerPosition = playerTransform.position

    // Iterar sobre los objetos recolectables
    for (const collectible of collectibles) {
      // Verificar si ya ha sido recolectado
      if (collectedSet.has(collectible.id)) {
        continue // Saltar si ya fue recolectado
      }

      const transform = Transform.get(collectible.entity)
      const distanceSquared = Vector3.distanceSquared(transform.position, playerPosition)

      // Umbral de distancia (por ejemplo, 2 unidades)
      const threshold = 2

      // Comparar con el cuadrado del umbral
      if (distanceSquared < threshold * threshold) {
        console.log(`Recolectado ${collectible.id} en`, transform.position)
        engine.removeEntity(collectible.entity)
        collectedSet.add(collectible.id)

        // Verificar si se han recolectado todos los objetos
        if (collectedSet.size === collectibles.length) {
          // Llamar a la función que spawnea algo y muestra un mensaje
          allCollectiblesCollected()
        }
      }
    }
  })

  function allCollectiblesCollected() {
    console.log('¡Has recolectado todos los objetos!')

    // Mostrar mensaje de felicitaciones en la UI
    const messageEntity = engine.addEntity()

    UiText.create(messageEntity, {
      value: `🎉 ¡Felicidades! Has recolectado todos los objetos. 🎉`,
      fontSize: 50,
      color: Color4.Yellow()
    })

    let elapsedTime = 0

    function removeMessageSystem(dt: number) {
      elapsedTime += dt
      if (elapsedTime >= 3) {
        // Cuando hayan pasado 3 segundos
        engine.removeEntity(messageEntity) // Eliminar el mensaje
        engine.removeSystem(removeMessageSystem) // Remover este sistema
      }
    }

    engine.addSystem(removeMessageSystem)

    // Añadir el aguacate encima del jugador
    addAvocadoHat()
  }

  function addAvocadoHat() {
    const playerEntity = engine.PlayerEntity

    // Crear una nueva entidad para el aguacate
    const avocadoHatEntity: Entity = engine.addEntity()

    // Agregar el modelo del aguacate
    GltfContainer.create(avocadoHatEntity, {
      src: 'models/avocado.glb',
      invisibleMeshesCollisionMask: 0
    })

    // Configurar la posición, escala y establecer el padre en el Transform
    Transform.create(avocadoHatEntity, {
      position: Vector3.create(0, 0.7, 0), // Ajusta la posición vertical según sea necesario
      scale: Vector3.create(0.65, 0.65, 0.65), // Ajusta la escala para que se vea bien
      parent: playerEntity // Establecer el jugador como entidad padre
    })
  }

  // Dibujar la interfaz de usuario si es necesario
  setupUi()
}

// import { Vector3, Color4 } from '@dcl/sdk/math'
// import { engine, GltfContainer, Transform, Entity, TextShape, Billboard, UiText } from '@dcl/sdk/ecs'
// import { changeColorSystem, circularSystem } from './systems'
// import { setupUi } from './ui'
// import { Spinner } from './components'

// // Definir una interfaz para los objetos recolectables
// interface Collectible {
//   id: string
//   entity: Entity
// }

// // Lista de todos los objetos recolectables
// let collectibles: Collectible[] = []

// // Conjunto de identificadores de objetos recolectados
// let collectedSet: Set<string> = new Set()

// export function main() {
//   // Definir comportamiento
//   engine.addSystem(circularSystem)
//   engine.addSystem(changeColorSystem)

//   // Función para crear objetos recolectables
//   function createCollectible(id: string, model: string, position: Vector3) {
//     const entity: Entity = engine.addEntity()

//     GltfContainer.create(entity, {
//       src: `models/${model}.glb`
//     })

//     Transform.create(entity, {
//       position: position
//     })

//     Spinner.create(entity, { speed: 100 })

//     // Agregar el objeto a la lista de recolectables
//     collectibles.push({ id, entity })
//   }

//   // Crear tres objetos recolectables con identificadores únicos
//   createCollectible('pc1', 'pc', Vector3.create(3, 1, 3))
//   createCollectible('avocado', 'avocado', Vector3.create(6, 1, 3))
//   createCollectible('pc2', 'pc', Vector3.create(9, 1, 3))

//   // Sistema para manejar la recolección
//   engine.addSystem(() => {
//     // Obtener la posición del jugador
//     const playerEntity = engine.PlayerEntity
//     const playerTransform = Transform.get(playerEntity)
//     const playerPosition = playerTransform.position

//     // Iterar sobre los objetos recolectables
//     for (const collectible of collectibles) {
//       // Verificar si ya ha sido recolectado
//       if (collectedSet.has(collectible.id)) {
//         continue // Saltar si ya fue recolectado
//       }

//       const transform = Transform.get(collectible.entity)
//       const distanceSquared = Vector3.distanceSquared(transform.position, playerPosition)

//       // Umbral de distancia (por ejemplo, 2 unidades)
//       const threshold = 2

//       // Comparar con el cuadrado del umbral
//       if (distanceSquared < threshold * threshold) {
//         console.log(`Recolectado ${collectible.id} en`, transform.position)
//         engine.removeEntity(collectible.entity)
//         collectedSet.add(collectible.id)

//         // Verificar si se han recolectado todos los objetos
//         if (collectedSet.size === collectibles.length) {
//           // Llamar a la función que spawnea algo y muestra un mensaje
//           allCollectiblesCollected()
//         }
//       }
//     }
//   })

//   function allCollectiblesCollected() {
//     console.log('¡Has recolectado todos los objetos!')

//     // Crear una entidad para el mensaje
//     const messageEntity = engine.addEntity()

//     // // Configurar la posición del mensaje en el mundo
//     // Transform.create(messageEntity, {
//     //   position: Vector3.create(8, 2, 8) // Ajusta las coordenadas según tu escena
//     // })

//     // // Hacer que el mensaje siempre mire hacia el jugador
//     // Billboard.create(messageEntity)

//     // // Agregar el componente TextShape con el mensaje de felicitaciones
//     // TextShape.create(messageEntity, {
//     //   text: '🎉 ¡Felicidades! Has recolectado todos los objetos. 🎉',
//     //   fontSize: 3,
//     //   textColor: Color4.Yellow(),
//     //   textWrapping: true,
//     //   width: 10
//     // })

//     UiText.create(messageEntity, {
//       value: `🎉 ¡Felicidades! Has recolectado todos los objetos. 🎉`,
//       fontSize: 50,
//       color: Color4.Yellow()
//     })

//     // Variable para rastrear el tiempo transcurrido
//     let elapsedTime = 0

//     // Sistema para eliminar el mensaje después de 3 segundos
//     function removeMessageSystem(dt: number) {
//       elapsedTime += dt
//       if (elapsedTime >= 3) {
//         // Cuando hayan pasado 3 segundos
//         engine.removeEntity(messageEntity) // Eliminar el mensaje
//         engine.removeSystem(removeMessageSystem) // Remover este sistema
//       }
//     }

//     // Agregar el sistema al motor
//     engine.addSystem(removeMessageSystem)
//   }

//   // Dibujar la interfaz de usuario si es necesario
//   setupUi()
// }
