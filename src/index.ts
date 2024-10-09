// We define the empty imports so the auto-complete feature works as expected.
import { Vector3 } from '@dcl/sdk/math'
import { engine, GltfContainer, InputAction, pointerEventsSystem, Transform } from '@dcl/sdk/ecs'

import { changeColorSystem, circularSystem } from './systems'
import { setupUi } from './ui'
import { Spinner } from './components'

export function main() {
  // Defining behavior. See `src/systems.ts` file.
  engine.addSystem(circularSystem)
  engine.addSystem(changeColorSystem)

  let avocado = engine.addEntity()

  GltfContainer.create(avocado, {
    src: 'models/avocado.glb'
  })

  Transform.create(avocado, {
    position: Vector3.create(3, 1, 3)
  })

  Spinner.create(avocado, { speed: 100 })

  pointerEventsSystem.onPointerDown(
    {
      entity: avocado,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Collect' }
    },
    function () {
      console.log('CLICKED AVOCADO')
      engine.removeEntity(avocado)
    }
  )

  // draw UI. Here is the logic to spawn cubes.
  setupUi()
}
