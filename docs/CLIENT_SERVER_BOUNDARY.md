# Salon Client/Server Boundary

The repository has an explicit two-part structure:

- `client/` contains the browser application.
- `server/` contains the Express application, models, environment template, and tests.

## Boundary rules

The client should send user-entered data to the server API and render the server's validated result. Business rules, persistence, and credentials remain server-side.

## Maintenance checks

When adding a field, update the client type/form, the server validation, the persistence model, and tests together. Do not copy database credentials into client-side configuration.

For deployment issues, first confirm the client API base URL and then verify the server environment variables rather than hard-coding production endpoints in components.
