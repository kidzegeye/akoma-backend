PRAGMA foreign_keys = ON; 

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  firstName    TEXT NOT NULL,
  lastName     TEXT NOT NULL,
  username     TEXT NOT NULL,
  email        TEXT NOT NULL,
  password     TEXT NOT NULL,
  phoneNumber  TEXT NOT NULL,
  region       TEXT NOT NULL,
  gid          TEXT NOT NULL,
  businessName TEXT NOT NULL,
  industry     TEXT NOT NULL,
  address      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS  session (
  id           INTEGER PRIMARY KEY, 
  sessionToken TEXT NOT NULL,
  expiresAt    INTEGER NOT NULL,
  refreshToken TEXT NOT NULL,
  userID       INTEGER NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS transactions (
  id              INTEGER PRIMARY KEY,
  startDate       TEXT NOT NULL,
  endDate         TEXT NOT NULL,
  transactionType TEXT NOT NULL,
  frequency       TEXT NOT NULL,
  transactionName TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  received        INTEGER NOT NULL,
  dueDate         TEXT NOT NULL
  );