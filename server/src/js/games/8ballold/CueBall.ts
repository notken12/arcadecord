// CueBall.ts - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { Scene3D } from 'enable3d'
import { Ball } from './Ball'
import { Table } from './Table'

export class CueBall extends Ball {
  constructor(scene: Scene3D, x: any, y: any, z: any) {
    super(
      scene,
      x || CueBall.DEFAULT_POSITION.x,
      y || CueBall.DEFAULT_POSITION.y,
      z || CueBall.DEFAULT_POSITION.z,
      'cueball',
      0xffffff
    )
  }

  static DEFAULT_POSITION = {
    x: 0,
    y: Ball.RADIUS,
    z: (Table.PLAY_AREA.LEN_Z / 4) * -1,
  }
}
