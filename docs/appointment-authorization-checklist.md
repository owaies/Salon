## Appointment authorization checklist

Appointment updates are ownership-scoped for normal users, while staff and administrators can update appointments without the owner filter.

Test a customer updating their own appointment, the same customer attempting another customer's appointment, staff updating another customer's appointment, and unauthenticated mutation attempts. Keep authorization at the API boundary.