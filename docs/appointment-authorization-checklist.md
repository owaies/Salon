## Appointment authorization checklist

Appointment updates are ownership-scoped for normal users, while staff and administrators can update appointments without the owner filter.

Test a customer updating their own appointment, the same customer attempting another customer's appointment, staff updating another customer's appointment, and unauthenticated mutation attempts. Keep authorization at the API boundary.

## Cancellation response checks

- Confirm a customer can cancel only an appointment owned by their account.
- Confirm a missing appointment and an appointment owned by another customer both return HTTP 404 without revealing ownership.
- Confirm a missing, non-string, or whitespace-only cancellation reason returns HTTP 400.
- Confirm a successful cancellation returns success only when the ownership-scoped update affects a row.
- Confirm only appointments whose current status is `booked` can be cancelled; repeat cancellation and cancellation after completion must not change the record.
