const express = require('express');
const cors = require('cors');
const sqlite3 = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new sqlite3('database.sqlite');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        genre TEXT NOT NULL,
        running_time INTEGER NOT NULL,
        release_date DATE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS showtimes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movie_id INTEGER NOT NULL,
        show_date DATE NOT NULL,
        show_time TIME NOT NULL,
        theater_number INTEGER NOT NULL,
        base_price INTEGER DEFAULT 100000,
        FOREIGN KEY (movie_id) REFERENCES movies (id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        showtime_id INTEGER NOT NULL,
        seat_number TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        ticket_code TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (showtime_id) REFERENCES showtimes (id)
    );
`);

// Insert sample data if tables are empty
const moviesCount = db.prepare('SELECT COUNT(*) as count FROM movies').get().count;
if (moviesCount === 0) {
    const sampleMovies = [
        ['QUỶ NHẬP TRÀNG', 'Horror', 121, '2025-03-07'],
        ['SNOW WHITE', 'Adventure, Family', 108, '2025-03-21'],
        ['YOU ARE THE APPLE OF MY EYE', 'Comedy, Drama, Romance', 102, '2025-03-21'],
        ['THE SNOW QUEEN AND THE PRINCESS', 'Adventure, Animation', 76, '2025-03-28']
    ];
    
    const insertMovie = db.prepare('INSERT INTO movies (title, genre, running_time, release_date) VALUES (?, ?, ?, ?)');
    sampleMovies.forEach(movie => insertMovie.run(movie));

    // Add sample showtimes for each movie
    const movies = db.prepare('SELECT id FROM movies').all();
    const insertShowtime = db.prepare(`
        INSERT INTO showtimes (movie_id, show_date, show_time, theater_number)
        VALUES (?, ?, ?, ?)
    `);

    movies.forEach(movie => {
        // Add multiple showtimes per movie
        const times = ['10:00', '13:00', '16:00', '19:00', '22:00'];
        times.forEach((time, index) => {
            insertShowtime.run(
                movie.id,
                new Date().toISOString().split('T')[0], // Today
                time,
                index + 1
            );
        });
    });
}

// API Routes
app.get('/api/movies/:movieId/showtimes', (req, res) => {
    try {
        const showtimes = db.prepare(`
            SELECT 
                s.id,
                s.show_date,
                s.show_time,
                s.theater_number,
                s.base_price,
                m.title as movie_title
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.id
            WHERE m.id = ?
            AND s.show_date >= date('now')
            ORDER BY s.show_date, s.show_time
        `).all(req.params.movieId);

        res.json(showtimes);
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        res.status(500).json({ error: 'Failed to fetch showtimes' });
    }
});

app.post('/api/calculate-price', (req, res) => {
    try {
        const { showtimeId, seatNumber, ticketType, dayOfWeek } = req.body;
        
        // Get base price from showtime
        const showtime = db.prepare('SELECT base_price FROM showtimes WHERE id = ?').get(showtimeId);
        let finalPrice = showtime.base_price;
        
        // Apply seat type adjustments
        const row = seatNumber.charAt(0);
        if (['G', 'H'].includes(row)) {
            finalPrice += 110000; // Sweetbox
        } else if (['E', 'F'].includes(row)) {
            finalPrice += 55000; // Deluxe
        }
        
        // Apply ticket type discounts (percentage based)
        const discounts = {
            'student': 0.10, // 10% discount
            'child': 0.20,   // 20% discount
            'senior': 0.15   // 15% discount
        };
        
        if (discounts[ticketType]) {
            const discountAmount = Math.floor(finalPrice * discounts[ticketType]);
            finalPrice -= discountAmount;
        }
        
        // Weekend surcharge
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            finalPrice += 10000;
        }
        
        res.json({ finalPrice });
    } catch (error) {
        console.error('Error calculating price:', error);
        res.status(500).json({ error: 'Failed to calculate price' });
    }
});

app.post('/api/book', (req, res) => {
    try {
        const { userId, showtimeId, seatNumber, ticketType, totalAmount } = req.body;
        
        // Generate ticket code
        const ticketCode = 'CGV' + Date.now().toString().slice(-6);
        
        // Insert booking
        const result = db.prepare(`
            INSERT INTO bookings (
                user_id, showtime_id, seat_number, 
                ticket_type, total_amount, ticket_code
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, showtimeId, seatNumber, ticketType, totalAmount, ticketCode);
        
        // Get booking details with theater_number
        const booking = db.prepare(`
            SELECT 
                b.*,
                m.title,
                s.show_date,
                s.show_time,
                s.theater_number
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.id
            JOIN movies m ON s.movie_id = m.id
            WHERE b.id = ?
        `).get(result.lastInsertRowid);
        
        res.json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Start server
const PORT = process.env.PORT || 5501;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 