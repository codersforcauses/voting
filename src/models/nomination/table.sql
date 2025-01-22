CREATE TABLE IF NOT EXISTS nomination(
  candidateId TEXT NOT NULL,
  raceId TEXT NOT NULL,
  FOREIGN KEY(candidateId) REFERENCES candidate(candidateId),
  FOREIGN KEY(raceId) REFERENCES race(raceId)
);