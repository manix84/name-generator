# 🤝 Contributing

Thanks for considering a contribution to Name Generator. ✨

## 🧰 Local Setup

Install dependencies: 📦

```sh
npm ci
```

Start the app: 🚀

```sh
npm start
```

Run checks before opening a pull request: ✅

```sh
npm test
npm run build
npm audit
```

## 🔀 Pull Requests

Keep pull requests focused. A small visual change, dependency update, or documentation fix is easier to review than a mixed bundle of unrelated work.

For code changes: 💻

- 🧭 Match the existing React and TypeScript style.
- ⚡ Keep the generated name flow simple and fast.
- 🪶 Avoid adding new dependencies unless they clearly reduce complexity.
- 🧪 Update tests when behavior changes.
- 🧹 Do not commit generated `dist/`, `build/`, or `node_modules/` output.

For design changes: 🎨

- 🎯 Keep the two generated words and the randomise button as the focus.
- ♿ Prefer accessible contrast and responsive layouts.
- 🙅 Avoid returning to the old novelty font/glossy-button style.

## 📝 Issues

Before opening an issue, check whether there is already a related one. Include enough detail for someone else to reproduce the problem or understand the requested improvement.
