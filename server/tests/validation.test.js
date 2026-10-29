const test = require('node:test');
const assert = require('node:assert/strict');

const {
    isBcryptPasswordLengthValid,
    normalizeLoginCredentials,
    normalizeServicePayload,
} = require('../validation');

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
