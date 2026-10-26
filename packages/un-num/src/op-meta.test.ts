import { describe, expect, it } from "vitest";
import { UnEqRecursiveError } from "./errors.js";
import { getUnExpMap, getUnNumFromEq } from "./op-meta.js";
import type { UnEqOp, UnNumEq } from "./types.js";

describe("shared and cyclic structures", () => {
	it("allows a reused sub-object in getUnExpMap", () => {
		const x: UnEqOp = { op: "*", l: "m", r: "s" };
		expect(getUnExpMap({ op: "*", l: x, r: x })).toEqual({ m: 2, s: 2 });
	});

	it("allows a reused sub-object in getUnNumFromEq", () => {
		const x = { num: 3, unit: "m" };
		expect(getUnNumFromEq({ op: "*", l: x, r: x })).toEqual({
			num: 9,
			unit: { op: "*", l: "m", r: "m" },
		});
	});

	it("still throws on a genuine cycle", () => {
		const unEq = { op: "*", l: "m", r: "s" } as { op: "*"; l: unknown; r: unknown };
		unEq.r = unEq;
		expect(() => getUnExpMap(unEq as UnEqOp)).toThrow(UnEqRecursiveError);

		const numEq = { op: "*", l: 2, r: 3 } as { op: "*"; l: unknown; r: unknown };
		numEq.l = numEq;
		expect(() => getUnNumFromEq(numEq as UnNumEq)).toThrow(UnEqRecursiveError);
	});
});
