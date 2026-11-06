const test = require('node:test');
const assert = require('node:assert/strict');

const Appointment = require('../models/Appointment');

function createPool({ failOnQuery = 0 } = {}) {
    const events = [];
    let queryCount = 0;
    const connection = {
        async beginTransaction() {
            events.push('begin');
        },
        async query(sql, params) {
            queryCount += 1;
            events.push({ sql, params });
            if (queryCount === failOnQuery) throw new Error('insert failed');
            return [{ affectedRows: 1 }];
        },
        async commit() {
            events.push('commit');
        },
        async rollback() {
            events.push('rollback');
        },
        release() {
            events.push('release');
        },
    };

    return { events, pool: { getConnection: async () => connection } };
}

test('creates all requested services in one committed transaction', async () => {
    const { pool, events } = createPool();
    await Appointment.createMany(pool, [
        { user_id: 7, service_id: 2, date: '2026-11-04', time: '10:00' },
        { user_id: 7, service_id: 3, date: '2026-11-04', time: '10:00' },
    ]);

    assert.equal(events[0], 'begin');
    assert.equal(events.filter((event) => typeof event === 'object').length, 2);
    assert.equal(events.at(-2), 'commit');
    assert.equal(events.at(-1), 'release');
    assert.equal(events.includes('rollback'), false);
});

test('rolls back every service when one appointment insert fails', async () => {
    const { pool, events } = createPool({ failOnQuery: 2 });

    await assert.rejects(
        Appointment.createMany(pool, [
            { user_id: 7, service_id: 2, date: '2026-11-04', time: '10:00' },
            { user_id: 7, service_id: 3, date: '2026-11-04', time: '10:00' },
        ]),
        /insert failed/,
    );

    assert.equal(events.includes('commit'), false);
    assert.equal(events.includes('rollback'), true);
    assert.equal(events.at(-1), 'release');
});

test('rejects an empty appointment batch before opening a connection', async () => {
    let connectionRequested = false;
    const pool = {
        getConnection: async () => {
            connectionRequested = true;
            throw new Error('should not connect');
        },
    };

    await assert.rejects(Appointment.createMany(pool, []), /At least one appointment/);
    assert.equal(connectionRequested, false);
});


test('cancellation reports whether an owned appointment was updated', async () => {
    const calls = [];
    const pool = {
        query: async (sql, params) => {
            calls.push({ sql, params });
            return [{ affectedRows: 0 }];
        },
    };

    const missing = await Appointment.cancel(pool, 42, 7, 'No longer needed');
    assert.equal(missing, 0);
    assert.deepEqual(calls[0].params, ['cancelled', 'No longer needed', 42, 7]);
    assert.match(calls[0].sql, /WHERE id = \? AND user_id = \?/);

    pool.query = async () => [{ affectedRows: 1 }];
    assert.equal(await Appointment.cancel(pool, 42, 7, 'No longer needed'), 1);
});
