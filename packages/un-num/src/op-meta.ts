import { UnEqRecursiveError } from "./errors.js";
import type { UnEq, UnEqByOp, UnNumOp } from "./types.js";

export type UnExpMap<U extends string> = { readonly [UNIT in U]?: number };
export type UnExpEntries<U extends string> = [unit: U, exp: number][];
export type UnEqOpWalk<U extends string> = (unEq: UnEq<U> | U) => UnExpMap<U>;

type OpMetaNode<OP extends UnNumOp> = {
	readonly getUnExpMap: <U extends string>(
		unEq: UnEqByOp<OP, U>,
		walk: UnEqOpWalk<U>
	) => UnExpMap<U>;
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
	},
	"^": {
		getUnExpMap: <U extends string>({ u, ex }: UnEqByOp<"^", U>) => ({ [u]: ex }) as UnExpMap<U>,
	},
};

const getOpMeta = <OP extends UnNumOp>(op: OP): OpMetaNode<OP> => OP_META[op];

export const getUnExpMap = <U extends string>(
	unEq: UnEq<U> | U,
	found: Set<UnEq<U>> = new Set()
): UnExpMap<U> => {
	if (typeof unEq === "string") return { [unEq]: 1 } as UnExpMap<U>;

	if (found.has(unEq)) throw new UnEqRecursiveError("Found recursive structure in UnEq");
	found.add(unEq);

	return getOpMeta(unEq.op).getUnExpMap(unEq, (unEq) => getUnExpMap(unEq, found));
};
