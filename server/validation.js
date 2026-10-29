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
    normalizeServicePayload,
};

function normalizeServicePayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;

    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const description = payload.description == null
        ? ''
        : typeof payload.description === 'string' ? payload.description.trim() : null;
    const rawPrice = typeof payload.price === 'string' ? payload.price.trim() : payload.price;
    const pricePattern = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
    const price = typeof rawPrice === 'number'
        ? rawPrice
        : typeof rawPrice === 'string' && pricePattern.test(rawPrice) ? Number(rawPrice) : Number.NaN;
    const image = payload.image == null || payload.image === ''
        ? null
        : typeof payload.image === 'string' && payload.image.length <= 2048 ? payload.image : undefined;

    if (
        !name ||
        name.length > 100 ||
        description === null ||
        description.length > 2000 ||
        !Number.isFinite(price) ||
        price <= 0 ||
        image === undefined
    ) {
        return null;
    }

    return { name, description, price, image };
}

