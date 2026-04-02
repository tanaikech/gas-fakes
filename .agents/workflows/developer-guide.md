---
description: Developer guide for gas-fakes service implementation
---
### Dynamic Resources and Caching

Each class in `gas-fakes` typically interacts with a dynamic resource (e.g., `CalendarApp` uses a Google Calendar API resource).

- **The `__resource` property**: Always access the underlying API state via the dynamic `__resource` getter.
- **Stale State**: NEVER store the resource directly in a class instance variable. It will become stale when the cache is cleared.
- **Cache Invalidation**: Every time a destructive API call is made, the cache is cleared. Accessing `__resource` ensures you get the most up-to-date state from the API or the fresh cache.

### Environment Consistency
The goal is to exactly emulate the Google Workspace environment so that tests run identically in both local and live GAS environments.
