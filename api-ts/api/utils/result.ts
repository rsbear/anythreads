type ErrTags =
  | "ACCOUNT_CREATE"
  | "ACCOUNT_UPDATE"
  | "ACCOUNT_BAN"
  | "ACCOUNT_UNBAN"
  | "ACCOUNT_DELETE"
  | "ACCOUNT_FIND_ONE"
  | "ACCOUNT_FIND_MANY"
  | "ACCOUNT_NOT_FOUND"
  | "THREAD_CREATE"
  | "THREAD_UPDATE"
  | "THREAD_DELETE"
  | "THREAD_COMPLETE"
  | "THREAD_FIND_ONE"
  | "THREAD_FIND_MANY"
  | "THREAD_NOT_FOUND"
  | "REPLY_CREATE"
  | "REPLY_UPDATE"
  | "REPLY_DELETE"
  | "REPLY_FIND_ONE"
  | "REPLY_FIND_MANY"
  | "REPLY_NOT_FOUND"
  | "VOTE_CREATE"
  | "VOTE_UPDATE"
  | "VOTE_DELETE"
  | "VOTE_FIND_ONE"
  | "VOTE_FIND_MANY"
  | "VOTE_NOT_FOUND"
  | "VOTE_UP"
  | "VOTE_DOWN"
  | "NOT_FOUND"
  | "EMPTY_LIST"
  | "DATABASE_INSTANCE_REQUIRED"
  | "FETCH_ERROR"
  | "NETWORK_ERROR";

interface ResultOk<T> {
  isOk: true;
  isErr: false;
  value: T;
  err: undefined;
}

interface ResultErr {
  isOk: false;
  isErr: true;
  value: undefined;
  err: {
    tag: ErrTags;
    msg: string;
    metadata?: Record<string, any>;
  };
}

export type Result<T> = ResultOk<T> | ResultErr;

export function resultOk<T>(value: T): ResultOk<T> {
  return {
    isOk: true,
    isErr: false,
    value,
    err: undefined,
  };
}

export function resultErr(tag: ErrTags, msg: string, metadata?: Record<string, any>): ResultErr {
  return {
    isOk: false,
    isErr: true,
    value: undefined,
    err: {
      tag,
      msg,
      metadata,
    },
  };
}
