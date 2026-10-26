import { getUnNumFromEq } from "./op-meta.js";
import { simplifyUnEq } from "./simplify.js";
import type { UnNum, UnNumEq } from "./types.js";
import { isUD } from "./utils.js";

export const executeUnNumEq = <U extends string>(eq: UnNumEq<U> | UnNum<U> | number): UnNum<U> => {
	const num = getUnNumFromEq(eq);
	const unit = isUD(num.unit) ? undefined : simplifyUnEq(num.unit);
	return { ...num, unit };
};
