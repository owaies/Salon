# Database Readiness Verification

The API health endpoint checks whether the database pool is initialized and can execute a lightweight query. Use it to distinguish process availability from database readiness.

1. Start the API with the required session configuration and database environment values.
2. Request `/api/health` and confirm a ready database returns the healthy response.
3. Start the service with an unavailable database and confirm readiness reports unavailable rather than healthy.
4. While the database is unavailable, verify API routes return a controlled service-unavailable response.
5. Restore connectivity and verify the service can be restarted cleanly.
6. Run the non-destructive database smoke test with test credentials and confirm it closes the connection after completion.

Do not use destructive schema commands as a connectivity check.
