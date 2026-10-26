# Salon page QA checklist

Verify the five primary client surfaces independently:
- Home
- Services
- Bookings
- Contact
- Admin Staff

## Interaction checks
Confirm navigation works from every page, forms reject missing required values, and booking/contact feedback is visible after submission.

## Responsive checks
Test narrow mobile, tablet, and desktop widths. Confirm menus, cards, forms, and tables do not create horizontal overflow.

## Admin checks
Verify staff-management controls are not accidentally exposed through ordinary customer navigation.

## Release check
Open each page from a fresh session and verify there are no broken assets or console errors.

## Registration validation
- Submit a valid email address and confirm registration follows the normal success flow.
- Try an address without `@`, a missing domain suffix, and an address containing spaces; each must be rejected with a client error.
- Confirm invalid email input does not create a user record.

