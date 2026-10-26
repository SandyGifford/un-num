import { getUnExpMap, type UnExpEntries } from "./op-meta.js";
import type { UnEqOp } from "./types.js";

const entriesToUnEq = <U extends string>(entries: UnExpEntries<U>): UnEqOp<U> | U | undefined => {
	if (!entries[0]) return undefined;

	const [unit, exp] = entries[0];

	const walk = (): UnEqOp<U> | U | undefined => {
		const newEntries = entries.slice(1);
		if (newEntries.length) return entriesToUnEq(newEntries);
		return undefined;
	};

	if (exp === 0) return walk();
	if (exp > 0) {
		const l: UnEqOp<U> | U = exp === 1 ? unit : { op: "^", u: unit, ex: exp };
		const r = walk();

		if (r) return { op: "*", l, r };
		return l;
	}
	if (exp < 0) {
		const n = walk();

		if (n)
			return {
				op: "/",
				n,
				d: exp === -1 ? unit : { op: "^", u: unit, ex: -exp },
			};
		return exp === -1 ? unit : { op: "^", u: unit, ex: exp };
	}

	return undefined;
};

const moveHigherExponentsToBack = <U extends string>(entries: UnExpEntries<U>): UnExpEntries<U> =>
	entries.sort(([, a], [, b]) => b - a);

export function simplifyUnEq<U extends string>(unEq: UnEqOp<U> | U): UnEqOp<U> | U | undefined {
	const map = getUnExpMap(unEq);

	const entries = Object.entries(map) as UnExpEntries<U>;
	const { numerator, denominator } = entries.reduce(
		(maps, [unit, exp]) => {
			if (exp === 0) return maps;

			let { numerator, denominator } = maps;
			if (exp > 0) numerator = [...numerator, [unit, exp]];
			else denominator = [...denominator, [unit, -exp]];

			return { numerator, denominator };
		},
		{ numerator: [], denominator: [] } as {
			numerator: UnExpEntries<U>;
			denominator: UnExpEntries<U>;
		}
	);

	const nEq = entriesToUnEq(moveHigherExponentsToBack(numerator));
	const dEq = entriesToUnEq(moveHigherExponentsToBack(denominator));

	if (dEq && nEq)
		return {
			op: "/",
			n: nEq,
			d: dEq,
		};

	if (dEq) {
		if (typeof dEq !== "string" && dEq.op === "^") return { op: "^", u: dEq.u, ex: -dEq.ex };
		return { op: "^", u: dEq, ex: -1 };
	}

	return nEq;
}
