Assessment & Plan

1. Map the current browser experience
The multi-page drop-app already expresses the product concepts you want on device: it loads persistent state from localStorage, checks onboarding completion, renders the four domain cards, and updates commitments/logs per domain with helper functions like setIdentity, logFitness, and logPresence.

Domain and identity metadata (wake/sleep targets, cardio/strength/skill tiers, mind/spirit roles) live in CONFIG/DOMAIN_IDENTITIES, giving you the canonical content that must be surfaced natively during onboarding, daily logging, and review flows.

2. Understand what the Expo project already provides
drop_natively is an Expo Router app with a home screen that reads domains and dailyLogs via an AsyncStorage-backed useStorage hook, calculates progress and streaks, and opens a logging sheet—so you already have a native scaffold for the “presence logging” loop.

The seed data mirrors only a slice of the web metadata (simplified domain list plus single-layer identities) and drives animated cards through DomainCard; this will need to be expanded to handle the richer tiered structures from the web app (e.g., cardio/strength/skills, meditation/stress).

useStorage already wraps AsyncStorage with validation/error handling, which is a good analogue to the browser’s localStorage state—perfect for persisting onboarding progress, commitments, and logs once the data model is extended.

3. Gap analysis & integration strategy
Data modeling

Expand types to capture the nested structures from CONFIG (e.g., fitness aspects, mind/spirit tier choices, commitments) so AsyncStorage can hold the same schema as dropState_v2. Mirror keys to ease migration and keep cross-platform parity.

Replace the current flat identities array with structured datasets keyed by domain/aspect, keeping iconography and descriptive text intact for continuity across platforms.

State & logic parity

Port the onboarding flow (identity selection, commitment capture, weekly targets) into Expo screens, persisting to AsyncStorage using the same flags (onboardingComplete, commitments, weeklyTargets, logs).

Recreate domain-specific logging logic: e.g., toggles like embodiedSleep, numeric cardio logging, meditation stress selections. Use the logging bottom sheet to host per-domain widgets, driven by the richer metadata.

Build a lightweight migration script that reads any existing AsyncStorage payload and upgrades it if schema changes (leveraging validateValue to protect against corruption).

UI/UX alignment

Evolve DomainCard to display commitment summaries (wake times, targets) and highlight active identities, matching the glassmorphism and card states from the web build.

Add dedicated screens for gratitude/review/settings like the browser’s multi-page version, reusing the same content flow and ensuring navigation hooks are wired via Expo Router.

Platform considerations

Replace any direct DOM logic (e.g., query selectors) with React Native components, using the metadata to generate buttons/sliders. Where the web app uses inline HTML (e.g., template literals), translate into FlatList/ScrollView layouts with touchable elements.

4. Implementation roadmap
Foundation

Define expanded TypeScript interfaces for commitments, logs, and onboarding preferences.

Import the full CONFIG data into the Expo project (possibly as JSON) and adapt the storage hook defaults to hydrate from that source.

Feature parity

Build onboarding wizard screens that map to the web flow (identity selection -> commitments -> confirmation).

Extend the home screen logging sheet to support toggles/numeric inputs per domain, writing back to AsyncStorage.

Add gratitude/review/settings screens, using existing Expo Router structure.

Experience polish

Implement streak/target visualizations similar to the web animations (can use react-native-reanimated that is already in use).

Integrate optional notifications (using expo-notifications) for reminders—aligns with reminderTime in types.

Testing

Unit-test storage adapters and data transformations.

Use Expo’s device preview and Pixel hardware for UX validation; consider Detox/E2E tests for onboarding + logging loops.

5. Pixel 8 deployment path
Local iteration – run npm install followed by npm run android (which calls expo start --android) to stream to a connected Pixel 8 via Expo Go during development.

Configure signing – set up an EAS account, log in with eas login, and configure Android credentials (either let EAS manage keystore or supply an existing one).

Build artifacts

For an internal QA build, run eas build --profile preview --platform android (profile defined as internal distribution).

For production, switch to --profile production to generate an AAB you can upload to the Play Console.

Device installation – download the generated APK/AAB from the EAS dashboard, sideload to the Pixel 8 (for internal) or publish via closed testing track.

OTA updates – optionally configure eas update to push JS bundle updates without rebuilding native binaries once the schema stabilizes.

6. Additional recommendations
Set up environment-specific configs (dev/preview/prod) for API endpoints if you later replace static data with backend services.

Plan for data export/import so existing browser users can migrate into the native app (e.g., share a QR code or file that the app can import into AsyncStorage).

Add analytics and crash reporting (e.g., Expo’s @expo/firebase-analytics or Sentry) once the UX stabilizes to monitor engagement.

Summary

Evaluated the browser-based drop-app state management and domain/identity metadata to identify the exact concepts that must be preserved in the native build.

Reviewed the Expo-powered drop_natively implementation, including its AsyncStorage-backed home screen, domain seeds, identity list, and animated cards, to map how the existing scaffold can absorb the richer drop-app flows.

Outlined the Pixel 8 delivery process using the provided Expo scripts and EAS build profiles for Android distribution.