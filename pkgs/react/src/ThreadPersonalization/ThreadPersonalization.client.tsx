"use client";

import type { PersonalizedThread } from "@anythreads/api/accounts";
import type { Msg } from "@anythreads/api/msg";
import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

type ThreadPersonalizationClientContext = {
	msg: Msg<PersonalizedThread> | undefined;
};

const ThreadPersonalizationCtx =
	createContext<ThreadPersonalizationClientContext>({
		msg: undefined,
	});

export function useThreadPersonalization() {
	const ctx = useContext(ThreadPersonalizationCtx);
	return ctx;
}

export function Provider({
	children,
	msg,
}: PropsWithChildren<{ msg: Msg<PersonalizedThread> }>) {
	return (
		<ThreadPersonalizationCtx.Provider value={{ msg }}>
			{children}
		</ThreadPersonalizationCtx.Provider>
	);
}
