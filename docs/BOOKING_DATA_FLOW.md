# Salon Booking Data Flow

The repository separates the browser experience under `client/` from the server implementation under `server/`.

## Expected flow

Customer input begins in the client application, crosses the server API boundary, and is persisted through the server-side data layer. Booking validation belongs at the server boundary even when the client already has matching form checks.

## Change checklist

For a booking change, review the client form, the matching server route, the model used for persistence, and the server test file as one path. Keep customer-visible validation messages understandable while keeping server errors generic enough not to expose internal database details.

## Data handling

Only collect fields required to create and manage a booking. Avoid storing sensitive information in browser logs or debug output.


## Appointment date and time validation

The booking and appointment-update endpoints accept a calendar-valid date in `YYYY-MM-DD` format and a 24-hour time in `HH:MM` format. Both values are trimmed before persistence. Invalid dates (including impossible month/day combinations), malformed times, and non-string values are rejected with HTTP 400 before a database write. Past dates are not prohibited by this validation because staff may need to correct historical bookings.

Unit tests cover leap days, invalid calendar dates, malformed time values, and whitespace normalization. During API smoke tests, confirm the validator is applied to both booking and update requests.
