import type { Simplify } from "type-fest";

export type Satisfies<T, U extends T> = U;

export type UnNumOp = "*" | "/" | "^" | "-";

type OpMap<U extends string> = Satisfies<
	{
		readonly [OP in UnNumOp]: {
			readonly unitEq: unknown;
			readonly numEq: unknown;
		};
	},
	{
		readonly "*": {
			readonly numEq: {
				readonly l: number | UnNum<U> | UnNumEq<U>;
				readonly r: number | UnNum<U> | UnNumEq<U>;
			};
			readonly unitEq: {
				readonly l: U | UnEq<U>;
				readonly r: U | UnEq<U>;
			};
		};
		readonly "/": {
			readonly numEq: {
				readonly n: number | UnNum<U> | UnNumEq<U>;
				readonly d: number | UnNum<U> | UnNumEq<U>;
			};
			readonly unitEq: {
				readonly n: U | UnEq<U>;
				readonly d: U | UnEq<U>;
			};
		};
		readonly "^": {
			readonly numEq: {
				readonly v: number | UnNum<U> | UnNumEq<U>;
				readonly ex: number;
			};
			readonly unitEq: {
				readonly u: U | UnEq<U>;
				readonly ex: number;
			};
		};
		readonly "-": {
			readonly numEq: {
				readonly l: number | UnNum<U> | UnNumEq<U>;
				readonly r: number | UnNum<U> | UnNumEq<U>;
			};
			readonly unitEq: {
				readonly l: U | UnEq<U>;
				readonly r: U | UnEq<U>;
			};
		};
	}
>;

type OpMapWithOp<U extends string> = {
	readonly [OP in UnNumOp]: {
		readonly numEq: OpMap<U>[OP]["numEq"] & { readonly op: OP };
		readonly unitEq: OpMap<U>[OP]["unitEq"] & { readonly op: OP };
	};
};

export type UnNumEqByOp<OP extends UnNumOp, U extends string = string> = Simplify<
	OpMapWithOp<U>[OP]["numEq"]
>;
export type UnNumEq<U extends string = string> = Simplify<UnNumEqByOp<UnNumOp, U>>;

export type UnEqByOp<OP extends UnNumOp, U extends string = string> = Simplify<
	OpMapWithOp<U>[OP]["unitEq"]
>;
export type UnEq<U extends string = string> = Simplify<UnEqByOp<UnNumOp, U>>;

export type UnNum<U extends string = string> = {
	readonly num: number;
	readonly unit?: U | UnEq<U>;
};
