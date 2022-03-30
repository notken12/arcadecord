// InputHandler.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

function InputHandler(renderer, scene, game) {
  this.renderer = renderer
  this.scene = scene
  this.game = game

  renderer.domElement.addEventListener('mousedown', function (e) {
    if ('buttons' in e) {
      if (e.buttons == 1) {
        //left mouse down
      }
    }
  })
}

InputHandler.STICK_ROTATION_SPEED = (Math.PI * 2) / 3 // 1 rot every 3 seconds

InputHandler.prototype.tick = function (td) {
  // timeDelta, seconds since last frame
  if (key.isPressed('A')) {
    this.game.rotateStick(InputHandler.STICK_ROTATION_SPEED * td)
  }
  if (key.isPressed('D')) {
    this.game.rotateStick(InputHandler.STICK_ROTATION_SPEED * td * -1)
  }
}

export { InputHandler }
