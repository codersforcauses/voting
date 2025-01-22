CREATE TABLE IF NOT EXISTS preference(
  voteId INTEGER,
  candidateId INTEGER,
  preference INTEGER,
  FOREIGN KEY(voteId) REFERENCES vote(voteId),
  FOREIGN KEY(candidateId) REFERENCES candidate(candidateId)
);