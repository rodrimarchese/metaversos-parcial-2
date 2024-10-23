// main.ts
import { Vector3, Color4 } from '@dcl/sdk/math'
import {
  engine,
  GltfContainer,
  Transform,
  Entity,
  UiText,
  InputAction,
  PointerEvents,
  PointerEventType,
  PointerEventsResult,
  UiTransform,
  YGPositionType,
  MeshCollider
} from '@dcl/sdk/ecs'
import { changeColorSystem, circularSystem } from './systems'
import { setupUi, showDialogUI } from './ui' // Importamos showDialogUI
import { Spinner } from './components'
import { createCharacter, createCollectible } from './factory'

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
  // Variable para el personaje
  let characterEntity: Entity

  // Definir comportamiento
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)  

  // Crear el personaje
  characterEntity = createCharacter('robot2', Vector3.create(5, 1, 5))

  // Sistema para manejar la interacción con el personaje
  engine.addSystem(() => {
    for (const [entity] of engine.getEntitiesWith(PointerEventsResult)) {
      const pointerEvents = PointerEventsResult.get(entity)
      for (const event of pointerEvents) {
        if (
          event.button === InputAction.IA_POINTER &&
          event.state === PointerEventType.PET_DOWN &&
          entity === characterEntity
        ) {
          showDialogUI() // Mostrar el diálogo al interactuar con el personaje
        }
      }
    }
  })

  // Crear tres objetos recolectables con identificadores únicos
  collectibles.push(createCollectible('pc1', 'pc', Vector3.create(3, 1, 3)))
  collectibles.push(createCollectible('avocado', 'avocado', Vector3.create(6, 1, 3)))
  collectibles.push(createCollectible('pc2', 'pc', Vector3.create(9, 1, 3)))

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
      position: Vector3.create(0, 0.7, -0.25), // Ajusta la posición vertical según sea necesario
      scale: Vector3.create(0.5, 0.5, 0.5), // Ajusta la escala para que se vea bien
      parent: playerEntity // Establecer el jugador como entidad padre
    })
  }

  // Dibujar la interfaz de usuario
  setupUi()
}
