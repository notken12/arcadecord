// common.spec.js - Arcadecord
// 
// Copyright (C) 2022 Ken Zhou 
// 
// This file is part of Arcadecord. 
// 
// Arcadecord can not be copied and/or distributed 
// without the express permission of Ken Zhou.

// Import the main module for this game type
import main from './main.js'
// Import the Action class to make actions
import Action from '../../Action.js'
// Import the GameFlow class to control game flow
import GameFlow from '../../GameFlow.js'

import Ajv from 'ajv'
const ajv = new Ajv()

const stateSchema = {
    type: 'object',
    properties: {
        answers: {
            type: 'array',
            items: {
                type: 'string',
            },
            maxItems: 2
        },
        guesses: {
            type: 'array',
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        hints: {
                            type: 'array',
                            items: {
                                type: 'number',
                            },
                            maxItems: 5
                        },
                        word: {
                            type: 'string',
                        },
                    },
                    required: ['hints', 'word']
                },
                maxItems: 6
            },
            maxItems: 2,
            minItems: 2
        }
    },
    required: ['answers', 'guesses']
}

const validateGameState = ajv.compile(stateSchema)

test.todo('initial game state', async () => {
    // Create a new game
    let game = new main.Game()
    // Activate testing mode
    game.test()
    // Add fake players
    game.mockPlayers(2)

    // Initialize the game
    game.init()

    const valid = validateGameState(game.data)
    expect(valid).toBe(true)
})

describe('Action: choose word', async () => {
    test.todo('choosing word ends turn for player 1 but not for player 0', async () => {
        // Create a new game
        let game = new main.Game()
        // Activate testing mode
        game.test()
        // Add fake players
        game.mockPlayers(2)

        // Initialize the game
        game.init()

        // Choose a word
        let action = new Action('chooseWord', {
            word: 'mango'
        }, 1)
        await game.handleAction(action)

        // Check that the word was chosen
        expect(game.data.answers[1]).toEqual('mango')
        // Check that the turn ended
        expect(GameFlow.isItUsersTurn(game, 1)).toEqual(false)

        let action2 = new Action('chooseWord', {
            word: 'apple'
        }, 0)

        await game.handleAction(action2)

        // Check that the word was chosen
        expect(game.data.answers[0]).toEqual('apple')
        // Check that the turn ended
        expect(GameFlow.isItUsersTurn(game, 0)).toEqual(false)
    })
})

describe('Action: guess', async() => {
    test.todo('player wins when guessing correctly')
    test.todo('player loses when they fail to guess correctly after 6 guesses')
    test.todo('turn ends after player guesses')
})