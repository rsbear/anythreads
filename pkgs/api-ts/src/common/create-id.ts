import { customAlphabet } from "nanoid";

export const createId = customAlphabet(
	"1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	18,
);
