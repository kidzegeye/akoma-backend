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
CREATE TABLE session (
  id           INTEGER PRIMARY KEY, 
  sessionToken TEXT NOT NULL,
  expiresAt    INTEGER NOT NULL,
  refreshToken TEXT NOT NULL,
  userID       INTEGER NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(id)
);