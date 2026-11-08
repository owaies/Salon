# Service API validation

The admin-only `POST /api/services` and `PUT /api/services/:id` endpoints validate service details before writing to MySQL.

- `name` must be a non-empty trimmed string of at most 100 characters.
- `description` may be omitted or empty, but if supplied it must be text of at most 2,000 characters.
- `price` must be a finite positive number or a plain decimal numeric string. Zero, negative values, non-numeric text, infinity, and hexadecimal notation are rejected.
- `image` may be omitted or be a string no longer than 2,048 characters.

The shared validator is database-independent. Run `cd server && npm test` to exercise these boundaries without connecting to MySQL.


## Facility API validation

The admin-only `POST /api/facilities` and `PUT /api/facilities/:id` endpoints apply the same bounded-input approach:

- `name` must be non-empty trimmed text of at most 100 characters.
- `description` may be omitted or empty; supplied values must be text of at most 2,000 characters.
- `image` may be omitted or empty, or contain a URL/path of at most 2,048 characters. Only HTTP and HTTPS URL schemes are accepted; relative paths are supported.
- Invalid JSON shapes, non-text fields, and unsafe URL schemes are rejected with HTTP 400 before database writes.

The public facility renderer also validates image URL schemes and escapes image and alt attributes before inserting markup. Run `cd server && npm test` to exercise the validation and markup regression cases.
