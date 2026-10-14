# Contributing to statsFM

Thanks for contributing.

## Development setup

```bash
git clone https://github.com/<your-username>/statsFM.git
cd statsFM
npm install
npm run dev
```

Open http://localhost:3000.

## Before opening a pull request

Run the same checks used in CI:

```bash
npm run lint
npm run build
```

## Contribution guidelines

- Keep changes focused and scoped to one concern.
- Preserve TypeScript strictness and existing behavior.
- Update docs when behavior, commands, or structure change.
- Prefer accessible, keyboard-friendly UI behavior for interactive elements.

## Pull requests

1. Create a feature/fix branch from `main`.
2. Make your changes with clear commit messages.
3. Ensure `npm run lint` and `npm run build` pass.
4. Open a pull request and complete the template.
