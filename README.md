# un-num

Monorepo for UnNum: numbers that carry units, where units are expressed as small equations.

## Packages

| Package                                | Description                                           |
| -------------------------------------- | ----------------------------------------------------- |
| [`@un-num/core`](./packages/un-num)    | Types, unit-equation simplification, and evaluation   |

## Usage

```ts
import { executeUnNumEq, simplifyUnEq } from "@un-num/core";

// Simplify a unit equation
simplifyUnEq({ op: "*", l: "m", r: "m" });
// => { op: "^", u: "m", ex: 2 }

// Evaluate an equation of numbers with units
executeUnNumEq({
	op: "*",
	l: { num: 3, unit: "m" },
	r: { num: 2, unit: "m" },
});
// => { num: 6, unit: { op: "^", u: "m", ex: 2 } }
```

Operators are `"*"`, `"/"` and `"^"`. A `UnNum` is `{ num, unit? }`, where `unit` is a unit name or a unit equation.

## Development

Requires Node and npm (workspaces).

```sh
npm install
npm run build       # build all packages
npm run typecheck
npm run lint
npm test
npm run format      # prettier
```
