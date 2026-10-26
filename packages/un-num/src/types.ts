export type UnNumEq<U extends string = string> =
	| {
			readonly op: "*";
			readonly l: number | UnNum<U> | UnNumEq<U>;
			readonly r: number | UnNum<U> | UnNumEq<U>;
	  }
	| {
			readonly op: "/";
			readonly n: number | UnNum<U> | UnNumEq<U>;
			readonly d: number | UnNum<U> | UnNumEq<U>;
	  }
	| {
			readonly op: "^";
			readonly v: number | UnNum<U> | UnNumEq<U>;
			readonly ex: number;
	  };

export type UnNumOp = UnNumEq["op"];

export type UnEqOp<U extends string = string> =
	| {
			readonly op: "*";
			readonly l: U | UnEqOp<U>;
			readonly r: U | UnEqOp<U>;
	  }
	| {
			readonly op: "/";
			readonly n: U | UnEqOp<U>;
			readonly d: U | UnEqOp<U>;
	  }
	| {
			readonly op: "^";
			readonly u: U | UnEqOp<U>;
			readonly ex: number;
	  };

export type UnNumEqByOp<OP extends UnNumOp, U extends string = string> = Extract<
	UnNumEq<U>,
	{ readonly op: OP }
>;

export type UnEqOpByOp<OP extends UnNumOp, U extends string = string> = Extract<
	UnEqOp<U>,
	{ readonly op: OP }
>;

export type UnNum<U extends string = string> = {
	readonly num: number;
	readonly unit?: U | UnEqOp<U>;
};
