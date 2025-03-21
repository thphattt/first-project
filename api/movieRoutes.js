const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Tạo pool connection để tái sử dụng
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cgv_cinema',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Lấy danh sách suất chiếu theo movie ID
router.get('/movies/:movieId/showtimes', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [showtimes] = await connection.query(
            `SELECT s.*, m.title 
             FROM showtimes s 
             JOIN movies m ON s.movie_id = m.id 
             WHERE m.id = ? AND s.show_date >= CURDATE()
             ORDER BY s.show_date, s.show_time`,
            [req.params.movieId]
        );
        connection.release();

        res.json(showtimes);
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        res.status(500).json({ error: 'Failed to fetch showtimes' });
    }
});

// Lấy thông tin chi tiết phim
router.get('/movies/:movieId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [movie] = await connection.query(
            'SELECT * FROM movies WHERE id = ?',
            [req.params.movieId]
        );
        connection.release();

        if (movie.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.json(movie[0]);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

// Lấy danh sách phim đang chiếu
router.get('/movies', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [movies] = await connection.query(
            `SELECT * FROM movies 
             WHERE release_date <= CURDATE() 
             ORDER BY rank_order ASC`
        );
        connection.release();

        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

module.exports = router; 