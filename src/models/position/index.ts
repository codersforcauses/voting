import tableQuery from './table.sql'
import seedQuery from './seed.sql'
import { VotingObject } from '..'

export function getAllPositions(this: VotingObject) {
    const cursor = this.sql.exec("SELECT * from position;")
    
    const positions = []
    for (let row of cursor) {
      positions.push(row)
    }

    return positions
} 

export function createPosition() {
  return 'test'
    // const cursor = this.sql.exec("SELECT * from position;")
} 

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
}