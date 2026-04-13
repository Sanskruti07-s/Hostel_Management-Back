const db = require('../db');

exports.getAllFees = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT fees.*, students.name FROM fees JOIN students ON fees.student_id = students.student_id');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getFeeByStudent = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM fees WHERE student_id = ?', [req.params.id]);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.payFee = async (req, res) => {
    const { fee_id } = req.body;
    try {
        await db.query('UPDATE fees SET status = "Paid" WHERE fee_id = ?', [fee_id]);
        res.json({ success: true, message: 'Fee paid successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateFeeStatus = async (req, res) => {
    const { fee_id, status } = req.body;
    try {
        await db.query('UPDATE fees SET status = ? WHERE fee_id = ?', [status, fee_id]);
        res.json({ success: true, message: 'Fee status updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: 'Invalid status' });
    }
};
