CREATE TABLE IF NOT EXISTS race(
  raceId INTEGER PRIMARY KEY,
  positionId INTEGER,
  status TEXT CHECK(status IN ('OPEN', 'CLOSED', 'COMPLETE')) DEFAULT 'CLOSED',
  FOREIGN KEY(positionId) REFERENCES position(positionId)
);