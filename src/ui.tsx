// ui.tsx
import { engine, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { Cube } from './components'
import { createCube } from './factory'

// Variables para manejar el estado del diálogo
let showDialog = false
let dialogText = ''
let options: { text: string; onClick: () => void }[] = []

// Variable de estado para forzar la re-renderización
let stateCounter = 0

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

const uiComponent = () => (
  <UiEntity>
    {/* Tu interfaz de usuario existente */}
    <UiEntity
      uiTransform={{
        width: 400,
        height: 150,
        margin: '16px 0 8px 270px',
        padding: 4
      }}
      uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        uiBackground={{ color: Color4.fromHexString('#70ac76ff') }}
      >
        {/* Elementos existentes o comentados que puedes utilizar */}
        <Label
          onMouseDown={() => {
            console.log('Player Position clicked!')
          }}
          value={`Player: ${getPlayerPosition()}`}
          fontSize={18}
          uiTransform={{ width: '100%', height: 30 }}
        />
        {/* Otros elementos de tu UI */}
      </UiEntity>
    </UiEntity>

    {/* Diálogo del NPC */}
    {true && (
      <UiEntity
        uiTransform={{
          width: '80%',
          height: '30%',
          margin: { top: 0, bottom: 0 },
          padding: 10,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        uiBackground={{ color: Color4.fromHexString('#000000AA') }}
      >
        <Label
          value={dialogText}
          fontSize={20}
          onMouseDown={() => {
            console.log('# Cubes clicked !')
          }}
        />
        {options.map((option, index) => (
          <Button
            key={`${option.text}-${stateCounter}`}
            value={option.text}
            uiTransform={{
              width: '80%',
              height: 40
            }}
            variant="primary"
            onMouseDown={() => {
              console.log(`Botón ${option.text} clickeado`)
              options[index].onClick()
            }}
          />
        ))}
      </UiEntity>
    )}
  </UiEntity>
)

function getPlayerPosition() {
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (!playerPosition) return 'no data yet'
  const { x, y, z } = playerPosition.position
  return `{X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, Z: ${z.toFixed(2)}}`
}

// Función para mostrar el diálogo
export function showDialogUI() {
  showDialog = true
  dialogText = '👋 ¡Hola! ¿Qué te gustaría saber?'
  options = [
    {
      text: '1. Cuéntame sobre este lugar.',
      onClick: () => {
        dialogText = '¡Este es un mundo virtual construido con Decentraland!'
        options = [
          {
            text: '¿Qué es Decentraland?',
            onClick: () => {
              dialogText = 'Decentraland es una plataforma de realidad virtual descentralizada.'
              options = []
            }
          },
          {
            text: '¿Qué puedo hacer aquí?',
            onClick: () => {
              dialogText = '¡Puedes hacer muchas cosas! Explorar, interactuar con otros jugadores, y más.'
              options = []
            }
          }
        ]
      }
    },
    {
      text: '2. ¿Quién eres?',
      onClick: () => {
        dialogText = 'Soy un NPC amigable aquí para ayudarte.'
        options = []
      }
    }
  ]
}

// Sistema para ocultar el diálogo tras 10 segundos
let dialogElapsedTime = 0

engine.addSystem(function dialogTimeoutSystem(dt: number) {
  if (showDialog) {
    dialogElapsedTime += dt
    if (dialogElapsedTime >= 10) {
      showDialog = false
      dialogElapsedTime = 0
    }
  } else {
    dialogElapsedTime = 0
  }
})
