const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const PriceCalculator = require('../models/PriceCalculator');
const PDFDocument = require('pdfkit');
const path = require('path');

// Get movie showtimes with pricing info
router.get('/movies/:movieId/showtimes', async (req, res) => {
    try {
        const showtimes = await Movie.getShowtimes(req.params.movieId);
        res.json(showtimes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Calculate ticket price
router.post('/calculate-price', async (req, res) => {
    try {
        const { showtimeId, seatNumber, promotionCodes } = req.body;
        const priceDetails = await PriceCalculator.calculateTicketPrice(
            showtimeId,
            seatNumber,
            promotionCodes
        );
        res.json(priceDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get available promotions
router.get('/promotions', async (req, res) => {
    try {
        const promotions = await PriceCalculator.getAvailablePromotions();
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new booking
router.post('/book', async (req, res) => {
    try {
        const { userId, showtimeId, seatNumber, promotionCodes } = req.body;
        
        // Calculate final price
        const priceDetails = await PriceCalculator.calculateTicketPrice(
            showtimeId,
            seatNumber,
            promotionCodes
        );

        // Create booking with calculated price
        const bookingId = await Booking.create(
            userId,
            showtimeId,
            seatNumber,
            priceDetails.finalPrice
        );

        const bookingDetails = await Booking.getBookingDetails(bookingId);
        res.json({
            ...bookingDetails,
            priceDetails
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's bookings
router.get('/user/:userId/bookings', async (req, res) => {
    try {
        const bookings = await Booking.getUserBookings(req.params.userId);
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate and download ticket
router.get('/ticket/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.getBookingDetails(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Create PDF document
        const doc = new PDFDocument();
        const filename = `ticket-${booking.ticket_code}.pdf`;

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add CGV logo
        doc.image(path.join(__dirname, '../public/images/cgv-logo.png'), 50, 50, { width: 100 });

        // Add ticket content
        doc.fontSize(25).text('Movie Ticket', 50, 200);
        doc.fontSize(15).text(`Ticket Code: ${booking.ticket_code}`, 50, 250);
        doc.text(`Movie: ${booking.title}`, 50, 280);
        doc.text(`Date: ${new Date(booking.show_date).toLocaleDateString()}`, 50, 310);
        doc.text(`Time: ${booking.show_time}`, 50, 340);
        doc.text(`Theater: ${booking.theater_number}`, 50, 370);
        doc.text(`Seat: ${booking.seat_number}`, 50, 400);
        doc.text(`Price: ${booking.total_amount.toLocaleString('vi-VN')} VND`, 50, 430);

        // Finalize the PDF
        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 