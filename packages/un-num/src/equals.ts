import { getUnExpMap, type UnExpMap } from "./op-meta.js";
import type { UnEq } from "./types.js";

export const unExpMapEquals = <U extends string>(am: UnExpMap<U>, bm: UnExpMap<U>): boolean => {
	const keys = new Set([...Object.keys(am), ...Object.keys(bm)]) as Set<U>;
	for (const k of keys) if ((am[k] || 0) !== (bm[k] || 0)) return false;
	return true;
};

/** Compares units by their exponent maps, so commutative forms (m*s vs s*m) are equal. */
export const unEqEquals = <U extends string>(
	a: UnEq<U> | U | undefined,
	b: UnEq<U> | U | undefined
): boolean => {
	if (a === b) return true;
	return unExpMapEquals(a === undefined ? {} : getUnExpMap(a), b === undefined ? {} : getUnExpMap(b));
};
