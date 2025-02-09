import { describe, test, expect, beforeEach, vitest, Mock } from 'vitest'
import { VotingObject } from '..'
import { getAllPositions } from '.'

describe('Position', () => {
  let votingObject: VotingObject
  let execMock: Mock

  beforeEach(() => {
    execMock = vitest.fn()
    votingObject = {
      sql: {
        exec: execMock
      }
    } as unknown as VotingObject
  })

  test('get all positions executes correct sql', () => {
    getAllPositions.call(votingObject)
    expect(execMock).toHaveBeenCalledWith("SELECT * from position;")
  })
})
