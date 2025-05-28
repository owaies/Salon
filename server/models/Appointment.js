class Appointment {
    static async create(pool, { user_id, service_id, date, time }) {
        await pool.query('INSERT INTO appointments (user_id, service_id, date, time, status) VALUES (?, ?, ?, ?, ?)', [user_id, service_id, date, time, 'booked']);
    }

    static async findAll(pool) {
        const [rows] = await pool.query(`
            SELECT a.*, u.name AS user_name, s.name AS service_name 
            FROM appointments a 
            JOIN users u ON a.user_id = u.id 
            JOIN services s ON a.service_id = s.id
        `);
        return rows;
    }

    static async findByUser(pool, user_id) {
        const [rows] = await pool.query(`
            SELECT a.*, s.name AS service_name 
            FROM appointments a 
            JOIN services s ON a.service_id = s.id 
            WHERE a.user_id = ?
        `, [user_id]);
        return rows;
    }

    static async update(pool, id, { date, time }) {
        await pool.query('UPDATE appointments SET date = ?, time = ? WHERE id = ?', [date, time, id]);
    }

    static async cancel(pool, id, user_id, reason) {
        await pool.query('UPDATE appointments SET status = ?, cancel_reason = ? WHERE id = ? AND user_id = ?', ['cancelled', reason, id, user_id]);
    }

    static async getStatistics(pool) {
        const [[{ totalBookings }]] = await pool.query('SELECT COUNT(*) AS totalBookings FROM appointments WHERE status = ?', ['booked']);
        const [[{ cancellations }]] = await pool.query('SELECT COUNT(*) AS cancellations FROM appointments WHERE status = ?', ['cancelled']);
        const [[popularService]] = await pool.query(`
            SELECT s.name AS popularService 
            FROM appointments a 
            JOIN services s ON a.service_id = s.id 
            WHERE a.status = ? 
            GROUP BY s.id 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        `, ['booked']);
        return { totalBookings, cancellations, popularService: popularService?.popularService || 'None' };
    }
}

module.exports = Appointment;