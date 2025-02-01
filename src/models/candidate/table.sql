CREATE TABLE
  IF NOT EXISTS candidate (
    candidateId INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT,
    pic TEXT
  );