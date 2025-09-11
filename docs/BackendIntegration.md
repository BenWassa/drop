```markdown
# Backend Integration Considerations

To support syncing data across devices or multiple users, the app could migrate state persistence from `localStorage` to a backend service such as **Supabase** or **Firebase**. Doing so would involve replacing the `saveState()` and `loadState()` functions in `state.js` with API calls to the chosen database.

Key considerations:

- **Authentication:** allow each user to sign in so their data is isolated.
- **Database schema:** mirror the `state` structure with tables for commitments, logs, and quarterly summaries.
- **Offline support:** queue updates locally and sync when connectivity is available.
- **Security rules:** ensure read/write access is restricted to authenticated users.

This architectural step is optional for the current project but outlines the path toward a multi-device or multi-user experience.

```
