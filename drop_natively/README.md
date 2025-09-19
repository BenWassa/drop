# Drop Natively

This Expo project mirrors the Drop presence logging experience on mobile. The tasks in `SPRINTS.md` assume the following local setup.

## Prerequisites

- Node.js 20 (LTS) and npm
- Expo CLI (`npm install --global expo`)
- Android Studio / Xcode simulators for native testing (optional but recommended)

## Installation

```bash
npm install
```

## Available scripts

| Script | Description |
| --- | --- |
| `npm run start` | Start the Expo development server in Metro web UI. |
| `npm run android` | Launch Expo in an Android emulator or connected device. |
| `npm run ios` | Launch Expo in an iOS simulator (macOS only). |
| `npm run web` | Run the project in a web browser. |
| `npm test` | Execute the Node.js test runner across `__tests__` files. |
| `npm run lint` | Run ESLint against the project. |

Each native command forwards to `expo start` with the appropriate platform flag. If you need to start without the Metro UI, append `--non-interactive`:

```bash
npm run start -- --non-interactive
```

## Testing and linting

```bash
npm test
npm run lint
```

Tests currently use Node's built-in test runner so that they work in offline environments. A minimal `jest.config.js` is provided for future parity with the web project once Jest can be installed.

## Running on device

1. Start the Metro server: `npm run start`.
2. Install the [Expo Go](https://expo.dev/client) app on your device or open an emulator.
3. Scan the QR code from the Metro web UI (or use the platform-specific script above).

## Troubleshooting

- **Port already in use** – add `--port <number>` when running `npm run start`.
- **Cache issues** – run `npm run start -- --clear` to reset Metro.
- **Stuck builds** – ensure Expo CLI is up to date (`npx expo upgrade` checks the current SDK version).
