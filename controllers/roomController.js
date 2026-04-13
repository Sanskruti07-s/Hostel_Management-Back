const db = require('../db');

exports.getAllRooms = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rooms');
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.allocateRoom = async (req, res) => {
    const { student_id, room_id } = req.body;
    try {
        // Simple transaction logic for room allocation
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const [roomRows] = await connection.query('SELECT * FROM rooms WHERE room_id = ? FOR UPDATE', [room_id]);
            if (roomRows.length === 0) throw new Error('Room not found');
            const room = roomRows[0];
            
            if (room.occupied >= room.capacity) throw new Error('Room is full');

            // Update student
            await connection.query('UPDATE students SET room_no = ? WHERE student_id = ?', [room_id, student_id]);
            
            // Re-calculate occupancy (simplistic approach: just increment, or count from students table)
            const [occRows] = await connection.query('SELECT COUNT(*) as count FROM students WHERE room_no = ?', [room_id]);
            await connection.query('UPDATE rooms SET occupied = ? WHERE room_id = ?', [occRows[0].count, room_id]);

            await connection.commit();
            connection.release();
            
            res.json({ success: true, message: 'Room allocated successfully' });
        } catch (error) {
            await connection.rollback();
            connection.release();
            res.status(400).json({ success: false, message: error.message });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.autoAllocateRooms = async (req, res) => {
    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Get unassigned students
            const [unassigned] = await connection.query('SELECT student_id FROM students WHERE room_no IS NULL OR room_no = ""');
            
            if (unassigned.length === 0) {
                await connection.rollback();
                connection.release();
                return res.json({ success: true, message: 'No unassigned students found' });
            }

            // Get rooms with vacancy
            const [availableRooms] = await connection.query('SELECT room_id, capacity, occupied FROM rooms WHERE occupied < capacity');

            let studentIdx = 0;
            let roomsUpdated = 0;

            for (const room of availableRooms) {
                const vacancy = room.capacity - room.occupied;
                const studentsToAssign = Math.min(vacancy, unassigned.length - studentIdx);

                for (let i = 0; i < studentsToAssign; i++) {
                    const studentId = unassigned[studentIdx].student_id;
                    await connection.query('UPDATE students SET room_no = ? WHERE student_id = ?', [room.room_id, studentId]);
                    studentIdx++;
                }

                if (studentsToAssign > 0) {
                    await connection.query('UPDATE rooms SET occupied = occupied + ? WHERE room_id = ?', [studentsToAssign, room.room_id]);
                    roomsUpdated++;
                }

                if (studentIdx >= unassigned.length) break;
            }

            await connection.commit();
            connection.release();
            res.json({ 
                success: true, 
                message: `Successfully allocated ${studentIdx} students across ${roomsUpdated} rooms.` 
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error during auto-allocation' });
    }
};
