// vue-event-bus.js - Arcadecord

// Copyright (C) 2022 Ken Zhou

// This file is part of Arcadecord.

// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import mitt from 'mitt'

const bus = mitt()
bus.manualMd = undefined

export default bus
