/**
 * This module represents the output of each method on an adapter interface.
 *
 * The reason we are doing it this way is that if the fetch adapter were to return
 * a more FP-like <Result<Maybe<T>>, Err> we'd have a lot of complex implementing to do in the frontend.
 *
 * our solution..
 * 'emulate' using a tagged union "result_err" | "maybe_some" | "maybe_none"
 *
 * @module result-maybe
 */

type Err = { msg: string; metadata?: Record<string, any> };
type Reason = { reason: string } | null;

type ResultErr = { kind: "err"; value: Err };
type MaybeSome<T> = { kind: "some"; value: T };
type MaybeNone = { kind: "none"; value: Reason };

export type Msg<T> = MaybeSome<T> | MaybeNone | ResultErr;

const MsgKinds = {
	Err: "err",
	Some: "some",
	None: "none",
} as const;

/**
 * Create a `Result` that represents an `Err` value.
 *
 * @param msg - The error message.
 * @param metadata - Optional metadata to include with the error.
 * @returns A `Result` that represents an `Err` value.
 */
export function err(msg: string, metadata?: Record<string, any>): ResultErr {
	return { kind: MsgKinds.Err, value: { msg, metadata } };
}

/**
 * Create a `Maybe` that represents a `Some` value.
 *
 * @param value - The value to wrap in a `Some` `Maybe`.
 * @returns A `Maybe` that represents a `Some` value.
 *
 * @example
 * const rows = await db.query("SELECT * FROM users WHERE id = ?", id);
 * retun rows.length ? some(rows[0]) : none("User not found");
 *
 * import { isSome } from "@anythreads/api/result-maybe";
 * Helper function 'isSome()' for narrowing the type of the `Maybe` to a `Some` value
 */
export function some<T>(value: T): MaybeSome<T> {
	return { kind: MsgKinds.Some, value };
}

/**
 * Create a `Maybe` that represents a `None` value.
 *
 * @param reason - Optional reason for the `None` value.
 * @returns A `Maybe` that represents a `None` value.
 *
 * @example
 * const rows = await db.query("SELECT * FROM users WHERE id = ?", id);
 * retun rows.length ? some(rows[0]) : none("User not found");
 *
 * import { isNone } from "@anythreads/api/result-maybe";
 * Helper function 'isNone()' for narrowing the type of the `Maybe` to a `None` value
 */
export function none(reason?: string): MaybeNone {
	return { kind: MsgKinds.None, value: !reason ? null : { reason } };
}

/**
 * Check if a `Result` is an `Err` value.
 *
 * @param x - The `Result` to check.
 * @returns `true` if the `Result` is an `Err` value, `false` otherwise.
 */
export const isErr = <T>(x: Msg<T>): x is ResultErr => x.kind === MsgKinds.Err;

/**
 * Check if a `Maybe` is a `Some` value.
 *
 * @param x - The `Maybe` to check.
 * @returns `true` if the `Maybe` is a `Some` value, `false` otherwise.
 */
export const isSome = <T>(x: Msg<T>): x is MaybeSome<T> =>
	x.kind === MsgKinds.Some;

/**
 * Check if a `Maybe` is a `None` value.
 *
 * @param x - The `Maybe` to check.
 * @returns `true` if the `Maybe` is a `None` value, `false` otherwise.
 */
export const isNone = <T>(x: Msg<T>): x is MaybeNone =>
	x.kind === MsgKinds.None;
