const db = require('../db');

exports.getAllStaff = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM staff');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addStaff = async (req, res) => {
    const { staff_id, name, role, contact } = req.body;
    try {
        await db.query('INSERT INTO staff (staff_id, name, role, contact) VALUES (?, ?, ?, ?)', [staff_id, name, role, contact]);
        res.json({ success: true, message: 'Staff added successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: 'Could not add staff (ID might already exist)' });
    }
};
