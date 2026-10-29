# Service API validation

The admin-only `POST /api/services` and `PUT /api/services/:id` endpoints validate service details before writing to MySQL.

- `name` must be a non-empty trimmed string of at most 100 characters.
- `description` may be omitted or empty, but if supplied it must be text of at most 2,000 characters.
- `price` must be a finite positive number or a plain decimal numeric string. Zero, negative values, non-numeric text, infinity, and hexadecimal notation are rejected.
- `image` may be omitted or be a string no longer than 2,048 characters.

The shared validator is database-independent. Run `cd server && npm test` to exercise these boundaries without connecting to MySQL.
