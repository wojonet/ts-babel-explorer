# Babel Typescript AST

This project is a local Babel plugin playground for TypeScript code.

It is designed to give you an `astexplorer.net`-style workflow on your machine:

- Write a Babel plugin in TypeScript
- Edit a TypeScript demo input file
- Rebuild and re-run transforms quickly
- Inspect transformed output files
- Debug plugin visitors with the VS Code debugger

## What This Project Uses

- Node.js
- TypeScript
- Babel (`@babel/core`)
- Babel TypeScript preset (`@babel/preset-typescript`)
- Babel AST types (`@babel/types`)
- Chokidar (file watching)
- VS Code launch configs for Node debugging

## Project Structure

- `src/plugin/index.ts`: Babel plugin source (visitor logic)
- `src/demo/input.ts`: TypeScript input file used for testing
- `scripts/run-transform.cjs`: Runs Babel transform with your plugin
- `scripts/dev-watch.cjs`: Watches files and triggers rebuild + transform
- `output/output.ts`: Transformed output that preserves TypeScript syntax
- `output/output.js`: Transformed output transpiled toward JavaScript

## Common Commands

- `npm run build`: Compile TypeScript sources to `dist/`
- `npm run transform`: Build and run one transform pass
- `npm run dev`: Start watch mode (auto rebuild + auto transform on save)
- `npm run debug:transform`: One-shot transform with source maps for debugging
- `npm run debug:dev`: Watch mode with source maps for debugging

## Typical Workflow

1. Start with `npm run dev` (or `npm run debug:dev` when debugging).
2. Edit `src/plugin/index.ts` or `src/demo/input.ts`.
3. Save the file.
4. Check output changes in `output/output.ts` and `output/output.js`.

## Why This Exists

This repo is for fast iteration on Babel AST transforms without needing a hosted UI.
It keeps plugin code, test input, generated output, and debugger support in one place.
