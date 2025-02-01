import tableQuery from './table.sql'
import seedQuery from './seed.sql'
import { VotingObject } from '..'

export type Position = {
  positionId: string,
  title: string,
  priority: number
}

export function getAllPositions(this: VotingObject) {
    const cursor = this.sql.exec("SELECT * from position;")
    
    const positions= []
    for (let row of cursor) {
      positions.push(row)
    }

    return positions
} 

export function getPosition(this: VotingObject, id: Pick<Position, "positionId">) {
    this.sql.exec("SELECT * FROM position WHERE positionId = @0", id)
}

export function createPosition(this: VotingObject, { title, priority }: Omit<Position, "positionId">) {
    this.sql.exec("INSERT INTO position(title, priority) VALUES (@0, @1);", title, priority)
}

export function deletePosition(this: VotingObject, id: Pick<Position, "positionId">) {
    this.sql.exec("DELETE FROM positions WHERE positionId=@0", id)
}

export function updatePosition(
  this: VotingObject,
  id: Pick<Position, "positionId">,
  { title, priority }: Omit<Position, "positionId">
) {
  if (title && priority) {
    this.sql.exec("UPDATE positions SET title = @1, priority = @2 WHERE positionId=@0", id, title, priority)
  } else if (title) {
    this.sql.exec("UPDATE positions SET title = @1 WHERE positionId=@0", id, title)
  } else if (priority) {
    this.sql.exec("UPDATE positions SET priority = @1 WHERE positionId=@0", id, priority)
  }
}

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
}