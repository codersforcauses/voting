import tableQuery from './table.sql'
import seedQuery from './seed.sql'

const getAll = "SELECT * from position;"

export {
    tableQuery as positionTableQuery,
    seedQuery as positionSeedQuery,
    getAll as getAllPositionsQuery
}