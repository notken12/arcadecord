// CueBall.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { Ball } from './Ball'
import { Table } from './Table'

function CueBall(scene, x, y, z) {
  Ball.call(
    this,
    scene,
    x || CueBall.DEFAULT_POSITION.x,
    y || CueBall.DEFAULT_POSITION.y,
    z || CueBall.DEFAULT_POSITION.z,
    'cueball',
    0xffffff
  )
}

CueBall.DEFAULT_POSITION = {
  x: 0,
  y: Ball.RADIUS,
  z: (Table.LEN_Z / 4) * -1,
}

CueBall.prototype = Object.create(Ball.prototype)
CueBall.prototype.constructor = CueBall

export { CueBall }
