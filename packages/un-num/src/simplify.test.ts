import { describe, expect, it } from "vitest";
import { UnEqMismatchingUnitError } from "./errors.js";
import { simplifyUnEq } from "./simplify.js";
import type { UnEq } from "./types.js";

describe("simplifyUnEq", () => {
	it("returns a simple unit unchanged", () => {
		expect(simplifyUnEq("m")).toBe("m");
	});

	it("converts multiplication of the same unit to a power", () => {
		expect(simplifyUnEq({ op: "*", l: "m", r: "m" })).toEqual({
			op: "^",
			u: "m",
			ex: 2,
		});
	});

	it("orders products by descending unit exponent", () => {
		const eq: UnEq = {
			op: "*",
			l: { op: "*", l: "m", r: "s" },
			r: { op: "^", u: "kg", ex: 3 },
		};

		expect(simplifyUnEq(eq)).toEqual({
			op: "*",
			l: { op: "^", u: "kg", ex: 3 },
			r: { op: "*", l: "m", r: "s" },
		});
	});

	it("cancels units in a quotient", () => {
		const eq: UnEq = {
			op: "/",
			n: { op: "*", l: "m", r: "s" },
			d: "s",
		};

		expect(simplifyUnEq(eq)).toBe("m");
	});

	it("represents a quotient with numerator and denominator", () => {
		const eq: UnEq = { op: "/", n: "m", d: "s" };

		expect(simplifyUnEq(eq)).toEqual({ op: "/", n: "m", d: "s" });
	});

	it("turns a negative exponent into a reciprocal power", () => {
		expect(simplifyUnEq({ op: "^", u: "s", ex: -1 })).toEqual({
			op: "^",
			u: "s",
			ex: -1,
		});
		expect(simplifyUnEq({ op: "^", u: "s", ex: -3 })).toEqual({
			op: "^",
			u: "s",
			ex: -3,
		});
	});

	it("reduces nested powers and removes zero exponents", () => {
		const nestedPower: UnEq = {
			op: "^",
			u: { op: "^", u: "m", ex: 2 },
			ex: 3,
		};
		expect(simplifyUnEq(nestedPower)).toEqual({ op: "^", u: "m", ex: 6 });
		expect(simplifyUnEq({ op: "^", u: "m", ex: 0 })).toBeUndefined();
	});

	it("combines repeated, positive, and negative exponents", () => {
		const eq: UnEq = {
			op: "/",
			n: { op: "*", l: { op: "^", u: "m", ex: 3 }, r: "m" },
			d: { op: "^", u: "m", ex: 3 },
		};

		expect(simplifyUnEq(eq)).toBe("m");
	});

	it("returns undefined when all unit exponents cancel", () => {
		const eq: UnEq = {
			op: "*",
			l: { op: "/", n: "m", d: "s" },
			r: { op: "/", n: "s", d: "m" },
		};

		expect(simplifyUnEq(eq)).toBeUndefined();
	});

	it("preserves equivalent units through addition and subtraction", () => {
		const equivalentUnits: UnEq = {
			op: "*",
			l: "m",
			r: "s",
		};

		expect(simplifyUnEq({ op: "+", l: equivalentUnits, r: { op: "*", l: "s", r: "m" } })).toEqual(
			{ op: "*", l: "m", r: "s" }
		);
		expect(simplifyUnEq({ op: "-", l: "m", r: "m" })).toBe("m");
	});

	it.each(["+", "-"] as const)("rejects %s when units differ", (op) => {
		const eq: UnEq = { op, l: "m", r: "s" };

		expect(() => simplifyUnEq(eq)).toThrow(UnEqMismatchingUnitError);
	});
});
