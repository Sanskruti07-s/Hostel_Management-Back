const db = require('../db');
const bcrypt = require('bcrypt');

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'adminpassword'
};

exports.login = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        if (role === 'admin') {
            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                return res.json({ success: true, message: 'Admin login successful', role: 'admin' });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
            }
        } else if (role === 'student') {
            const [rows] = await db.query('SELECT * FROM students WHERE student_id = ?', [username]);
            if (rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Student not found' });
            }
            
            const student = rows[0];
            
            // For simplicity in schema generation, we stored "Hostel@123".
            // If it starts with $2b$ it means it was hashed by our change_password.
            let isMatch = false;
            if (student.password.startsWith('$2b$')) {
                isMatch = await bcrypt.compare(password, student.password);
            } else {
                // plain text check for initial default password
                isMatch = (password === student.password);
            }
            
            if (isMatch) {
                return res.json({ 
                    success: true, 
                    message: 'Login successful', 
                    role: 'student',
                    student_id: student.student_id,
                    is_first_login: !!student.is_first_login 
                });
            } else {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }
            
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { student_id, newPassword } = req.body;
        if (!student_id || !newPassword) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        await db.query('UPDATE students SET password = ?, is_first_login = false WHERE student_id = ?', [hashedPassword, student_id]);
        
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
