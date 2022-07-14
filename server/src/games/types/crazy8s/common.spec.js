// common.spec.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

import { expect, test, describe } from 'vitest';

// Import the main module for this game type
import main from './main.js';
// Import the Action class to make actions
import Action from '../../Action.js';

import Common from './common.js';
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js';

import Ajv from 'ajv';
const ajv = new Ajv();

describe.todo('write a test here', async () => {});
