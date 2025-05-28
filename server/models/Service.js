class Service {
    static async findAll(pool) {
        const [rows] = await pool.query('SELECT * FROM services');
        return rows;
    }

    static async findById(pool, id) {
        const [rows] = await pool.query('SELECT * FROM services WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(pool, service) {
        await pool.query(
            'INSERT INTO services (name, description, price, image) VALUES (?, ?, ?, ?)',
            [service.name, service.description, service.price, service.image]
        );
    }

    static async update(pool, id, service) {
        await pool.query(
            'UPDATE services SET name = ?, description = ?, price = ?, image = ? WHERE id = ?',
            [service.name, service.description, service.price, service.image, id]
        );
    }

    static async delete(pool, id) {
        await pool.query('DELETE FROM services WHERE id = ?', [id]);
    }
}

module.exports = Service;