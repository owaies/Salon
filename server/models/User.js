class User {
    static async findAll(pool) {
        const [rows] = await pool.query('SELECT id, name, email, role, active FROM users');
        return rows;
    }
    static async findByEmail(pool, email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }
    static async findByRole(pool, role) {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE role = ?', [role]);
        return rows;
    }
    static async create(pool, { name, email, password, role }) {
        await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
    }
    static async updateStatus(pool, id, active) {
        await pool.query('UPDATE users SET active = ? WHERE id = ?', [active, id]);
    }
    static async delete(pool, id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
    }
    static async findByUser(pool, userId) {
        const [rows] = await pool.query(`
            SELECT a.id, s.name as service_name, a.date, a.time, a.status
            FROM appointments a
            JOIN services s ON a.service_id = s.id
            WHERE a.user_id = ?
        `, [userId]);
        return rows;
    }
}
module.exports = User;