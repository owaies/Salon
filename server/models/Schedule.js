class Schedule {
    static async create(pool, { date, start_time, end_time, is_holiday }) {
        await pool.query('INSERT INTO schedules (date, start_time, end_time, is_holiday) VALUES (?, ?, ?, ?)', [date, start_time, end_time, is_holiday]);
    }

    static async generateSlots(pool, date) {
        const [schedules] = await pool.query('SELECT start_time, end_time, is_holiday FROM schedules WHERE date = ?', [date]);
        if (!schedules.length || schedules[0].is_holiday) return [];

        const { start_time, end_time } = schedules[0];
        const slots = [];
        let current = new Date(`1970-01-01T${start_time}Z`);
        const end = new Date(`1970-01-01T${end_time}Z`);

        while (current < end) {
            const time = current.toISOString().slice(11, 16);
            slots.push(time);
            current.setMinutes(current.getMinutes() + 30);
        }

        const [rows] = await pool.query('SELECT time FROM appointments WHERE date = ? AND status IN (?, ?)', [date, 'booked', 'pending']);
        const bookedSlots = rows.map(row => row.time.slice(0, 5));
        return slots.filter(slot => !bookedSlots.includes(slot));
    }
}

module.exports = Schedule;