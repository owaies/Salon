const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');
const Appointment = require('./models/Appointment');
const Schedule = require('./models/Schedule');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

let pool;

async function initializeDatabase() {
    pool = await mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'owaies',
        database: 'salon',
        waitForConnections: true,
        connectionLimit: 10
    });
    console.log('Database connected');
}

initializeDatabase().catch(err => console.error('Database connection failed:', err));

app.get('/api/check-auth', async (req, res) => {
    if (req.session.user) {
        res.json({ role: req.session.user.role });
    } else {
        res.status(401).send('Not authenticated');
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email and password required');
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length === 0) return res.status(401).send('Invalid credentials');
        req.session.user = { id: rows[0].id, role: rows[0].role };
        res.send('Login successful');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).send('Name, email, and password required');
    try {
        await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, 'user']);
        res.send('Registration successful');
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.send('Logged out');
});

app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM services');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/services', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    const { name, description, price, image } = req.body;
    if (!name || !price) return res.status(400).send('Name and price required');
    try {
        await pool.query('INSERT INTO services (name, description, price, image) VALUES (?, ?, ?, ?)', [name, description, price, image]);
        res.send('Service added');
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).send('Server error');
    }
});

app.put('/api/services/:id', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    const { name, description, price, image } = req.body;
    if (!name || !price) return res.status(400).send('Name and price required');
    try {
        await pool.query('UPDATE services SET name = ?, description = ?, price = ?, image = ? WHERE id = ?', [name, description, price, image, req.params.id]);
        res.send('Service updated');
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).send('Server error');
    }
});

app.delete('/api/services/:id', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        await pool.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.send('Service deleted');
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/facilities', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM facilities');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching facilities:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/facilities', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    const { name, description, image } = req.body;
    if (!name) return res.status(400).send('Name required');
    try {
        await pool.query('INSERT INTO facilities (name, description, image) VALUES (?, ?, ?)', [name, description, image]);
        res.send('Facility added');
    } catch (error) {
        console.error('Error adding facility:', error);
        res.status(500).send('Server error');
    }
});

app.put('/api/facilities/:id', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    const { name, description, image } = req.body;
    if (!name) return res.status(400).send('Name required');
    try {
        await pool.query('UPDATE facilities SET name = ?, description = ?, image = ? WHERE id = ?', [name, description, image, req.params.id]);
        res.send('Facility updated');
    } catch (error) {
        console.error('Error updating facility:', error);
        res.status(500).send('Server error');
    }
});

app.delete('/api/facilities/:id', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        await pool.query('DELETE FROM facilities WHERE id = ?', [req.params.id]);
        res.send('Facility deleted');
    } catch (error) {
        console.error('Error deleting facility:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/appointments/user', async (req, res) => {
    if (!req.session.user) return res.status(403).send('Forbidden');
    try {
        const appointments = await Appointment.findByUser(pool, req.session.user.id);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/appointments', async (req, res) => {
    if (!req.session.user || !['staff', 'admin'].includes(req.session.user.role)) return res.status(403).send('Forbidden');
    try {
        const appointments = await Appointment.findAll(pool);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/appointments', async (req, res) => {
    if (!req.session.user) return res.status(403).send('Forbidden');
    const { serviceIds, date, time } = req.body;
    if (!serviceIds?.length || !date || !time) return res.status(400).send('Service IDs, date, and time are required');
    try {
        for (const serviceId of serviceIds) {
            await Appointment.create(pool, {
                user_id: req.session.user.id,
                service_id: serviceId,
                date,
                time
            });
        }
        res.status(201).send('Appointment created');
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).send('Error creating appointment');
    }
});

app.put('/api/appointments/:id', async (req, res) => {
    if (!req.session.user) return res.status(403).send('Forbidden');
    const { date, time } = req.body;
    if (!date || !time) return res.status(400).send('Date and time required');
    try {
        await Appointment.update(pool, req.params.id, { date, time });
        res.send('Appointment updated');
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).send('Server error');
    }
});

app.delete('/api/appointments/:id', async (req, res) => {
    if (!req.session.user) return res.status(403).send('Forbidden');
    const { reason } = req.body;
    if (!reason) return res.status(400).send('Cancellation reason required');
    try {
        await Appointment.cancel(pool, req.params.id, req.session.user.id, reason);
        res.send('Appointment cancelled');
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/statistics', async (req, res) => {
    if (!req.session.user || !['staff', 'admin'].includes(req.session.user.role)) return res.status(403).send('Forbidden');
    try {
        const stats = await Appointment.getStatistics(pool);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/users', async (req, res) => {
    if (!req.session.user || !['staff', 'admin'].includes(req.session.user.role)) return res.status(403).send('Forbidden');
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, active FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/users/staff', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE role = ?', ['staff']);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).send('Server error');
    }
});

app.put('/api/users/:id/status', async (req, res) => {
    if (req.session.user?.role !== 'staff') return res.status(403).send('Forbidden');
    const { active } = req.body;
    try {
        await pool.query('UPDATE users SET active = ? WHERE id = ?', [active, req.params.id]);
        res.send('User status updated');
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).send('Server error');
    }
});

app.delete('/api/users/:id', async (req, res) => {
    if (req.session.user?.role !== 'admin') return res.status(403).send('Forbidden');
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.send('User deleted');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/slots', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).send('Date is required');
    try {
        const slots = await Schedule.generateSlots(pool, date);
        res.json(slots);
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).send('Error fetching slots');
    }
});

app.post('/api/schedule', async (req, res) => {
    if (!req.session.user || !['staff', 'admin'].includes(req.session.user.role)) return res.status(403).send('Forbidden');
    const { date, startTime, endTime, isHoliday } = req.body;
    if (!date || !startTime || !endTime) return res.status(400).send('Date, start time, and end time required');
    try {
        await Schedule.create(pool, { date, start_time: startTime, end_time: endTime, is_holiday: isHoliday });
        res.send('Schedule created');
    } catch (error) {
        console.error('Error creating schedule:', error);
        res.status(500).send('Server error');
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'home.html'));
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});