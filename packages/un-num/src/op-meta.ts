import { UnEqRecursiveError } from "./errors.js";
import type { UnEq, UnEqByOp, UnNum, UnNumEq, UnNumEqByOp, UnNumOp } from "./types.js";
import { isUD } from "./utils.js";

export type UnExpMap<U extends string> = { readonly [UNIT in U]?: number };
export type UnExpEntries<U extends string> = [unit: U, exp: number][];
export type UnEqOpWalk<U extends string> = (eq: UnEq<U> | U) => UnExpMap<U>;
export type UnNumEqOpWalk<U extends string> = (eq: UnNumEq<U> | UnNum<U> | number) => UnNum<U>;

type OpMetaNode<OP extends UnNumOp> = {
	readonly getUnExpMap: <U extends string>(
		eq: UnEqByOp<OP, U>,
		walk: UnEqOpWalk<U>
	) => UnExpMap<U>;
	readonly getUnNumFromEq: <U extends string>(
		eq: UnNumEqByOp<OP, U>,
		walk: UnNumEqOpWalk<U>
	) => UnNum<U>;
};

const OP_META: {
	readonly [OP in UnNumOp]: OpMetaNode<OP>;
} = {
	"*": {
		getUnExpMap: <U extends string>({ l, r }: UnEqByOp<"*", U>, walk: UnEqOpWalk<U>) => {
			const ls = walk(l);
			const rs = walk(r);

			return {
				...ls,
				...(Object.entries(rs) as UnExpEntries<U>).reduce(
					(map, [unit, exp]) => ({ ...map, [unit]: (ls[unit] || 0) + exp }),
					{} as UnExpMap<U>
				),
			};
		},
		getUnNumFromEq: <U extends string>({ l, r }: UnNumEqByOp<"*", U>, walk: UnNumEqOpWalk<U>) => {
			const wl = walk(l);
			const wr = walk(r);
			const unit = ((): UnEq<U> | U | undefined => {
				if (isUD(wl.unit)) return wr.unit;
				if (isUD(wr.unit)) return wl.unit;
				return { op: "*", l: wl.unit, r: wr.unit };
			})();
			return { num: wl.num * wr.num, unit };
		},
	},
	"/": {
		getUnExpMap: <U extends string>({ n, d }: UnEqByOp<"/", U>, walk: UnEqOpWalk<U>) => {
			const ns = walk(n);
			const ds = walk(d);

			return {
				...ns,
				...(Object.entries(ds) as UnExpEntries<U>).reduce(
					(map, [unit, exp]) => ({ ...map, [unit]: (ns[unit] || 0) - exp }),
					{} as UnExpMap<U>
				),
			};
		},
		getUnNumFromEq: <U extends string>({ n, d }: UnNumEqByOp<"/", U>, walk: UnNumEqOpWalk<U>) => {
			const wn = walk(n);
			const wd = walk(d);
			const unit = ((): UnEq<U> | U | undefined => {
				if (isUD(wd.unit)) return wn.unit;
				if (isUD(wn.unit)) return { op: "^", u: wd.unit, ex: -1 };
				return { op: "/", n: wn.unit, d: wd.unit };
			})();
			return { num: wn.num / wd.num, unit };
		},
	},
	"^": {
		getUnExpMap: <U extends string>({ u, ex }: UnEqByOp<"^", U>, walk: UnEqOpWalk<U>) =>
			typeof u === "string"
				? ({ [u]: ex } as UnExpMap<U>)
				: (Object.entries(walk(u)) as UnExpEntries<U>).reduce(
						(map, [unit, exp]) => ({ ...map, [unit]: exp * ex }),
						{} as UnExpMap<U>
					),
		getUnNumFromEq: <U extends string>({ v, ex }: UnNumEqByOp<"^", U>, walk: UnNumEqOpWalk<U>) => {
			const wv = walk(v);
			const unit: UnEq<U> | U | undefined = isUD(wv.unit)
				? undefined
				: { op: "^", u: wv.unit, ex };
			return { num: Math.pow(wv.num, ex), unit };
		},
	},
};

const getOpMeta = <OP extends UnNumOp>(op: OP): OpMetaNode<OP> => OP_META[op];

export const getUnExpMap = <U extends string>(
	eq: UnEq<U> | U,
	found: Set<UnEq<U>> = new Set()
): UnExpMap<U> => {
	if (typeof eq === "string") return { [eq]: 1 } as UnExpMap<U>;

	if (found.has(eq)) throw new UnEqRecursiveError("Found recursive structure in UnEq");
	found.add(eq);

	return getOpMeta(eq.op).getUnExpMap(eq, (eq) => getUnExpMap(eq, new Set(found)));
};

export const getUnNumFromEq = <U extends string>(
	eq: UnNumEq<U> | UnNum<U> | number,
	found: Set<UnNumEq<U> | UnNum<U>> = new Set()
): UnNum<U> => {
	if (typeof eq === "number") return { num: eq };

	if (!("op" in eq)) return eq;

	if (found.has(eq)) throw new UnEqRecursiveError("Found recursive structure in UnEq");
	found.add(eq);

	return getOpMeta(eq.op).getUnNumFromEq(eq, (eq) => getUnNumFromEq(eq, new Set(found)));
};
