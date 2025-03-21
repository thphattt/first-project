const db = require('../config/database');

class Booking {
    static async create(userId, showtimeId, seatNumber, totalAmount) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Check seat availability
            const [showtime] = await connection.query(
                'SELECT available_seats FROM showtimes WHERE id = ? FOR UPDATE',
                [showtimeId]
            );

            if (showtime[0].available_seats <= 0) {
                throw new Error('No seats available');
            }

            // Create booking
            const [booking] = await connection.query(
                `INSERT INTO bookings (user_id, showtime_id, seat_number, total_amount) 
                 VALUES (?, ?, ?, ?)`,
                [userId, showtimeId, seatNumber, totalAmount]
            );

            // Update available seats
            await connection.query(
                'UPDATE showtimes SET available_seats = available_seats - 1 WHERE id = ?',
                [showtimeId]
            );

            // Generate ticket
            const ticketCode = `TIX${Date.now()}${Math.floor(Math.random() * 1000)}`;
            await connection.query(
                'INSERT INTO tickets (booking_id, ticket_code) VALUES (?, ?)',
                [booking.insertId, ticketCode]
            );

            await connection.commit();
            return booking.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getBookingDetails(bookingId) {
        const [rows] = await db.query(
            `SELECT b.*, t.ticket_code, m.title, s.show_date, s.show_time, s.theater_number
             FROM bookings b
             JOIN tickets t ON b.id = t.booking_id
             JOIN showtimes s ON b.showtime_id = s.id
             JOIN movies m ON s.movie_id = m.id
             WHERE b.id = ?`,
            [bookingId]
        );
        return rows[0];
    }

    static async getUserBookings(userId) {
        const [rows] = await db.query(
            `SELECT b.*, t.ticket_code, m.title, s.show_date, s.show_time
             FROM bookings b
             JOIN tickets t ON b.id = t.booking_id
             JOIN showtimes s ON b.showtime_id = s.id
             JOIN movies m ON s.movie_id = m.id
             WHERE b.user_id = ?
             ORDER BY b.booking_date DESC`,
            [userId]
        );
        return rows;
    }
}

module.exports = Booking; 