const db = require('../config/database');

class Movie {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM movies ORDER BY rank_order');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM movies WHERE id = ?', [id]);
        return rows[0];
    }

    static async getShowtimes(movieId) {
        const [rows] = await db.query(
            `SELECT s.*, m.title, m.poster_url 
             FROM showtimes s 
             JOIN movies m ON s.movie_id = m.id 
             WHERE m.id = ? AND s.show_date >= CURDATE()
             ORDER BY s.show_date, s.show_time`,
            [movieId]
        );
        return rows;
    }
}

module.exports = Movie; 