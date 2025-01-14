import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  [
    {
      ignores: [
        "node_modules/**",
        "lib/**",
        "**/*.js"
      ],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
  ],
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
);
