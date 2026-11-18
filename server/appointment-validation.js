function normalizeAppointmentSchedule(date, time) {
    if (typeof date !== 'string' || typeof time !== 'string') return null;

    const normalizedDate = date.trim();
    const normalizedTime = time.trim();
    const dateParts = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateParts || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalizedTime)) return null;

    const [year, month, day] = dateParts.slice(1).map(Number);
    if (year < 1) return null;

    const calendarDate = new Date(0);
    calendarDate.setUTCFullYear(year, month - 1, day);
    calendarDate.setUTCHours(0, 0, 0, 0);
    if (
        calendarDate.getUTCFullYear() !== year ||
        calendarDate.getUTCMonth() !== month - 1 ||
        calendarDate.getUTCDate() !== day
    ) {
        return null;
    }

    return { date: normalizedDate, time: normalizedTime };
}

module.exports = { normalizeAppointmentSchedule };
