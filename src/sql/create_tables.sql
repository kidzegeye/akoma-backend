PRAGMA foreign_keys = ON; 

CREATE TABLE IF NOT EXISTS users (
  id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  firstName    TEXT NOT NULL,
  lastName     TEXT NOT NULL,
  username     TEXT UNIQUE NOT NULL,
  email        TEXT NOT NULL,
  password     TEXT NOT NULL,
  phoneNumber  TEXT NOT NULL,
  region       TEXT NOT NULL,
  ghanaCardNum TEXT NOT NULL,
  businessName TEXT NOT NULL,
  industry     TEXT NOT NULL,
  address      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS  session (
  id           INTEGER PRIMARY KEY AUTOINCREMENT, 
  sessionToken TEXT NOT NULL,
  expiresAt    INTEGER NOT NULL,
  refreshToken TEXT NOT NULL,
  userID       INTEGER NOT NULL,
  FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS transactions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  username        TEXT NOT NULL,
  startDate       INTEGER NOT NULL,
  endDate         INTEGER NOT NULL,
  transactionType INTEGER NOT NULL,
  frequency       TEXT NOT NULL,
  transactionName TEXT NOT NULL,
  amount          TEXT NOT NULL,
  received        INTEGER NOT NULL,
  dueDate         INTEGER,
  FOREIGN KEY (username) REFERENCES users(username),
  FOREIGN KEY (transactionType) REFERENCES transactionType(id)
);

CREATE TABLE IF NOT EXISTS transactionType (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  transactionType TEXT NOT NULL
);

INSERT INTO transactionType (transactionType) VALUES ("Sales Data");
INSERT INTO transactionType (transactionType) VALUES ("Expense Data");
INSERT INTO transactionType (transactionType) VALUES ("Income Statement");