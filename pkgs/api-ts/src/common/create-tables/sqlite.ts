export const createAccountsStr = `
    CREATE TABLE accounts (
      id TEXT PRIMARY KEY,
      upstream_id TEXT,
      username TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      banned INTEGER NOT NULL DEFAULT 0,
      badge TEXT,
      banned_at INTEGER,
      banned_until INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER,
      extras TEXT NOT NULL DEFAULT '{}'
    )
  `;

export const createThreadsStr = `
    CREATE TABLE threads (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      upstream_id TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      allow_replies INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER,
      extras TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    )
  `;

export const createRepliesStr = `
    CREATE TABLE replies (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      body TEXT NOT NULL,
      reply_to_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER,
      extras TEXT NOT NULL DEFAULT '{}',
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      FOREIGN KEY (reply_to_id) REFERENCES replies(id)
    )
  `;

export const createVotesStr = `
    CREATE TABLE votes (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      reply_id TEXT,
      direction TEXT NOT NULL CHECK(direction IN ('up', 'down')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES threads(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id),
      FOREIGN KEY (reply_id) REFERENCES replies(id)
    )
  `;
