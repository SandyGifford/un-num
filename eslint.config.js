import js from "@eslint/js";
import tseslint from "typescript-eslint";

// Relative imports must never reach across a workspace boundary; use package specifiers instead.
const CROSS_PACKAGE_PATTERNS = [
	"../../*/src",
	"../../*/src/**",
	"../../../*/src",
	"../../../*/src/**",
];

export default [
	{
		ignores: ["**/node_modules", "**/dist", "**/coverage"],
	},

	js.configs.recommended,
	...tseslint.configs.recommended,

	{
		files: ["**/*.{js,ts}"],
		languageOptions: {
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
		},
		rules: {
			"linebreak-style": ["error", "unix"],
			quotes: ["error", "double", { avoidEscape: true }],
			semi: ["error", "always"],
			"no-unused-vars": "off", // Handled by TypeScript
			"prefer-const": "error",
			"no-var": "error",
			eqeqeq: ["error", "always"],
			"no-nested-ternary": "warn",
			"no-console": "error",
			"no-restricted-imports": [
				"error",
				{
					patterns: [
						{
							group: CROSS_PACKAGE_PATTERNS,
							message: "Do not import across workspace boundaries; use package specifiers.",
						},
					],
				},
			],
		},
	},

	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: true,
			},
		},
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { args: "none", varsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/prefer-readonly": "error",
			"@typescript-eslint/consistent-type-imports": "error",
		},
	},
];
