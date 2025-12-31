import type { PersonalizedThread } from "@anythreads/api/accounts";
import type { Msg } from "@anythreads/api/msg";

export type ThreadPersonalizationContext = {
	msg: Msg<PersonalizedThread>;
};
