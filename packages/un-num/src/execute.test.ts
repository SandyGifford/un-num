import { describe, expect, it } from "vitest";
import { UnEqMismatchingUnitError } from "./errors.js";
import { executeUnNumEq } from "./execute.js";
import type { UnNumEq } from "./types.js";

describe("executeUnNumEq", () => {
	it("wraps a number as a unitless UnNum", () => {
		expect(executeUnNumEq(4)).toEqual({ num: 4 });
	});

	it("simplifies an existing UnNum unit", () => {
		expect(executeUnNumEq({ num: 4, unit: { op: "*", l: "m", r: "m" } })).toEqual({
			num: 4,
			unit: { op: "^", u: "m", ex: 2 },
		});
	});

	it("evaluates multiplication and combines units", () => {
		const eq: UnNumEq = {
			op: "*",
			l: { num: 2, unit: "m" },
			r: { num: 3, unit: "s" },
		};

		expect(executeUnNumEq(eq)).toEqual({
			num: 6,
			unit: { op: "*", l: "m", r: "s" },
		});
	});

	it("evaluates division and simplifies unit cancellation", () => {
		const eq: UnNumEq = {
			op: "/",
			n: { num: 12, unit: { op: "*", l: "m", r: "s" } },
			d: { num: 3, unit: "s" },
		};

		expect(executeUnNumEq(eq)).toEqual({ num: 4, unit: "m" });
	});

	it("evaluates powers of numbers and units", () => {
		const eq: UnNumEq = {
			op: "^",
			v: { num: 3, unit: "m" },
			ex: 2,
		};

		expect(executeUnNumEq(eq)).toEqual({
			num: 9,
			unit: { op: "^", u: "m", ex: 2 },
		});
	});

	it("evaluates addition when units match", () => {
		const eq: UnNumEq = {
			op: "+",
			l: { num: 2, unit: "m" },
			r: { num: 3, unit: "m" },
		};

		expect(executeUnNumEq(eq)).toEqual({ num: 5, unit: "m" });
	});

	it("evaluates subtraction when equivalent unit expressions match", () => {
		const eq: UnNumEq = {
			op: "-",
			l: { num: 5, unit: { op: "*", l: "m", r: "s" } },
			r: { num: 2, unit: { op: "*", l: "s", r: "m" } },
		};

		expect(executeUnNumEq(eq)).toEqual({
			num: 3,
			unit: { op: "*", l: "m", r: "s" },
		});
	});

	it("keeps unitless arithmetic unitless", () => {
		const eq: UnNumEq = {
			op: "+",
			l: { op: "*", l: 2, r: 3 },
			r: 4,
		};

		expect(executeUnNumEq(eq)).toEqual({ num: 10, unit: undefined });
	});

	it.each(["+", "-"] as const)("rejects %s when operand units differ", (op) => {
		const eq: UnNumEq =
			op === "+"
				? { op, l: { num: 2, unit: "m" }, r: { num: 3, unit: "s" } }
				: { op, l: { num: 2, unit: "m" }, r: { num: 3, unit: "s" } };

		expect(() => executeUnNumEq(eq)).toThrow(UnEqMismatchingUnitError);
	});
});
