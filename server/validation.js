const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBcryptPasswordLengthValid(password) {
    return typeof password === 'string' && Buffer.byteLength(password, 'utf8') <= 72;
}

function normalizeLoginCredentials(email, password) {
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (
        !cleanEmail ||
        cleanEmail.length > 254 ||
        !EMAIL_PATTERN.test(cleanEmail) ||
        typeof password !== 'string' ||
        password.length === 0 ||
        !isBcryptPasswordLengthValid(password)
    ) {
        return null;
    }

    return { email: cleanEmail, password };
}

module.exports = {
    EMAIL_PATTERN,
    isBcryptPasswordLengthValid,
    normalizeLoginCredentials,
};
