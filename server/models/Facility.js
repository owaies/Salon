class Facility {
    static async findAll(pool) {
        const [rows] = await pool.query('SELECT * FROM facilities');
        return rows;
    }

    static async findById(pool, id) {
        const [rows] = await pool.query('SELECT * FROM facilities WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(pool, { name, description, image }) {
        await pool.query(
            'INSERT INTO facilities (name, description, image) VALUES (?, ?, ?)',
            [name, description, image]
        );
    }

    static async update(pool, id, { name, description, image }) {
        await pool.query(
            'UPDATE facilities SET name = ?, description = ?, image = ? WHERE id = ?',
            [name, description, image, id]
        );
    }

    static async delete(pool, id) {
        await pool.query('DELETE FROM facilities WHERE id = ?', [id]);
    }
}

module.exports = Facility;