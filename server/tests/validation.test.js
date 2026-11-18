const test = require('node:test');
const assert = require('node:assert/strict');

const {
    isBcryptPasswordLengthValid,
    normalizeLoginCredentials,
    normalizeServicePayload,
    normalizeFacilityPayload,
} = require('../validation');
const { normalizeAppointmentSchedule } = require('../appointment-validation');

test('normalizes valid login email addresses', () => {
    assert.deepEqual(
        normalizeLoginCredentials('  User@Example.COM  ', 'correct horse'),
        { email: 'user@example.com', password: 'correct horse' },
    );
});

test('rejects malformed and overlong login email addresses', () => {
    for (const email of ['', 'not-an-email', 'user@', 'user name@example.com', 'a'.repeat(243) + '@example.com']) {
        assert.equal(normalizeLoginCredentials(email, 'valid-password'), null, email);
    }
});

test('rejects missing and overlong login passwords by UTF-8 byte length', () => {
    for (const password of [undefined, null, 123, '', 'a'.repeat(73), 'é'.repeat(37)]) {
        assert.equal(normalizeLoginCredentials('user@example.com', password), null);
    }
});

test('matches bcrypt password byte limits for ASCII and multibyte input', () => {
    assert.equal(isBcryptPasswordLengthValid('a'.repeat(72)), true);
    assert.equal(isBcryptPasswordLengthValid('a'.repeat(73)), false);
    assert.equal(isBcryptPasswordLengthValid('é'.repeat(36)), true);
    assert.equal(isBcryptPasswordLengthValid('é'.repeat(37)), false);
});

test('normalizes valid service details and numeric prices', () => {
    assert.deepEqual(
        normalizeServicePayload({
            name: '  Haircut  ',
            description: '  Classic cut  ',
            price: '25.50',
            image: 'haircut.jpg',
        }),
        { name: 'Haircut', description: 'Classic cut', price: 25.5, image: 'haircut.jpg' },
    );
});

test('rejects invalid service names, descriptions, images, and prices', () => {
    const invalidPayloads = [
        {},
        { name: '   ', price: 10 },
        { name: 'x'.repeat(101), price: 10 },
        { name: 'Haircut', price: 0 },
        { name: 'Haircut', price: -1 },
        { name: 'Haircut', price: 'not-a-price' },
        { name: 'Haircut', price: 'Infinity' },
        { name: 'Haircut', price: '0x10' },
        { name: 'Haircut', price: 10, description: 123 },
        { name: 'Haircut', price: 10, description: 'x'.repeat(2001) },
        { name: 'Haircut', price: 10, image: { path: 'x.jpg' } },
        { name: 'Haircut', price: 10, image: 'x'.repeat(2049) },
        [],
        null,
    ];

    for (const payload of invalidPayloads) {
        assert.equal(normalizeServicePayload(payload), null);
    }
});


test('normalizes valid facility details and trims an optional image URL', () => {
    assert.deepEqual(
        normalizeFacilityPayload({
            name: '  Steam Room  ',
            description: '  Private wellness space  ',
            image: '  /images/steam-room.jpg  ',
        }),
        { name: 'Steam Room', description: 'Private wellness space', image: '/images/steam-room.jpg' },
    );
});

test('allows omitted facility descriptions and images', () => {
    assert.deepEqual(
        normalizeFacilityPayload({ name: ' Sauna ' }),
        { name: 'Sauna', description: '', image: null },
    );
});

test('rejects invalid facility fields and unsafe image protocols', () => {
    const invalidPayloads = [
        null,
        [],
        {},
        { name: '   ' },
        { name: 'x'.repeat(101) },
        { name: 'Sauna', description: 123 },
        { name: 'Sauna', description: 'x'.repeat(2001) },
        { name: 'Sauna', image: { url: '/image.png' } },
        { name: 'Sauna', image: 'x'.repeat(2049) },
        { name: 'Sauna', image: 'javascript:alert(1)' },
        { name: 'Sauna', image: 'data:text/html,<script>alert(1)</script>' },
    ];

    for (const payload of invalidPayloads) {
        assert.equal(normalizeFacilityPayload(payload), null);
    }
});


test('normalizes valid appointment dates and times', () => {
    assert.deepEqual(
        normalizeAppointmentSchedule('  2024-02-29  ', '  09:30  '),
        { date: '2024-02-29', time: '09:30' },
    );
    assert.deepEqual(
        normalizeAppointmentSchedule('2026-12-31', '23:59'),
        { date: '2026-12-31', time: '23:59' },
    );
});

test('rejects malformed and impossible appointment dates', () => {
    for (const date of [
        '',
        '2026-2-01',
        '2026/02/01',
        '2026-02-29',
        '2026-04-31',
        '2026-00-01',
        '2026-13-01',
        '0000-01-01',
        null,
        20260201,
    ]) {
        assert.equal(normalizeAppointmentSchedule(date, '09:00'), null, String(date));
    }
});

test('rejects invalid appointment times', () => {
    for (const time of ['', '9:00', '24:00', '12:60', '12:00:00', 'noon', null, 900]) {
        assert.equal(normalizeAppointmentSchedule('2026-02-01', time), null, String(time));
    }
});
