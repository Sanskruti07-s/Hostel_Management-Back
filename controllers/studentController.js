const db = require('../db');

exports.getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT student_id, name, course, room_no, is_first_login FROM students');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT student_id, name, course, room_no, is_first_login FROM students WHERE student_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
