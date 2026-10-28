# Salon Appointment System

A Node.js/Express appointment-booking application with a static client, session-based authentication, and a MySQL-backed API.

## Requirements

- Node.js 18 or newer
- MySQL
- npm

## Local development

1. Open the server directory and install its dependencies:

   ```bash
   cd server
   npm install
   ```

2. Copy `.env.example` to `.env` and configure the local database connection and session settings. Keep the local environment file out of source control.
3. Create the database configured for the application.
4. Start the server:

   ```bash
   npm start
   ```

The Express server serves the client from the repository's `client/` directory. The API health endpoint is `/api/health`; it returns HTTP 503 while the database is unavailable.

## Database smoke check

From `server/`, run:

```bash
npm run test:db
```

This check authenticates a database connection and closes it afterward. It does not create tables, alter schema, or modify application records.

## Input validation tests

From `server/`, run:

```bash
npm test
```

The focused Node test suite covers login email normalization, malformed addresses, and bcrypt's 72-byte password boundary, including multibyte UTF-8 passwords. It does not require a live MySQL database.

## Operational notes

- Use a unique, long session secret for deployments.
- Set the database credentials for the target environment rather than relying on local defaults.
- Review the `docs/` directory for focused maintenance notes before changing authentication, request limits, or deployment behavior.
