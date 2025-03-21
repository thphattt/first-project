const db = require('../config/database');

class PriceCalculator {
    static async calculateTicketPrice(showtimeId, seatNumber, promotionCodes = []) {
        try {
            // Get base price and showtime details
            const [showtime] = await db.query(
                'SELECT s.*, m.title FROM showtimes s JOIN movies m ON s.movie_id = m.id WHERE s.id = ?',
                [showtimeId]
            );

            if (!showtime.length) {
                throw new Error('Showtime not found');
            }

            let finalPrice = showtime[0].base_price;
            const adjustments = [];

            // Get seat type
            const row = seatNumber.charAt(0);
            const [seatType] = await db.query('SELECT seat_type FROM seat_types WHERE row_name = ?', [row]);
            
            // Get all active price rules
            const [rules] = await db.query(
                `SELECT * FROM price_rules 
                 WHERE active = true 
                 AND (start_date IS NULL OR start_date <= CURDATE())
                 AND (end_date IS NULL OR end_date >= CURDATE())
                 ORDER BY priority`
            );

            // Apply day of week rules
            const showDate = new Date(showtime[0].show_date);
            const dayOfWeek = showDate.getDay(); // 0 = Sunday, 1 = Monday, ...

            // Apply time slot rules
            const showTime = showtime[0].show_time;

            for (const rule of rules) {
                let shouldApply = false;
                let adjustment = 0;

                switch (rule.rule_type) {
                    case 'day_of_week':
                        const applicableDays = rule.condition_value.split(',').map(Number);
                        shouldApply = applicableDays.includes(dayOfWeek);
                        break;

                    case 'time_slot':
                        const timeSlot = JSON.parse(rule.condition_value);
                        shouldApply = showTime >= timeSlot.start && showTime <= timeSlot.end;
                        break;

                    case 'seat_type':
                        shouldApply = seatType[0].seat_type === rule.condition_value;
                        break;

                    case 'promotion':
                        shouldApply = promotionCodes.includes(rule.condition_value);
                        break;
                }

                if (shouldApply) {
                    if (rule.adjustment_type === 'percentage') {
                        adjustment = (finalPrice * rule.adjustment_value) / 100;
                    } else {
                        adjustment = rule.adjustment_value;
                    }

                    finalPrice += adjustment;

                    adjustments.push({
                        ruleName: rule.name,
                        adjustment: adjustment
                    });
                }
            }

            return {
                basePrice: showtime[0].base_price,
                finalPrice: Math.max(0, finalPrice), // Ensure price doesn't go below 0
                adjustments: adjustments,
                movieTitle: showtime[0].title,
                showDate: showtime[0].show_date,
                showTime: showtime[0].show_time,
                seatType: seatType[0].seat_type,
                seatNumber: seatNumber
            };
        } catch (error) {
            throw error;
        }
    }

    static async getAvailablePromotions() {
        const [promotions] = await db.query(
            `SELECT name, condition_value as code, adjustment_value, adjustment_type 
             FROM price_rules 
             WHERE rule_type = 'promotion' 
             AND active = true
             AND (start_date IS NULL OR start_date <= CURDATE())
             AND (end_date IS NULL OR end_date >= CURDATE())`
        );
        return promotions;
    }
}

module.exports = PriceCalculator; 