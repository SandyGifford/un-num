export abstract class UnNumError extends Error {}
export abstract class UnEqError extends UnNumError {}
export class UnEqRecursiveError extends UnEqError {}
export class UnEqMismatchingUnitError extends UnEqError {}
