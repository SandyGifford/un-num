export type UnEq<U extends string = string> =
	| {
			readonly op: "*";
			readonly l: U | UnEq<U>;
			readonly r: U | UnEq<U>;
	  }
	| {
			readonly op: "/";
			readonly n: U | UnEq<U>;
			readonly d: U | UnEq<U>;
	  }
	| {
			readonly op: "^";
			readonly u: U;
			readonly ex: number;
	  };

export type UnNumOp = UnEq["op"];
export type UnEqByOp<OP extends UnNumOp, U extends string = string> = Extract<
	UnEq<U>,
	{ readonly op: OP }
>;

export type UnNum<U extends string = string> = {
	readonly num: number;
	readonly unit: string | UnEq<U>;
};
