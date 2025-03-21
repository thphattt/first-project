document.addEventListener('DOMContentLoaded', function() {
    // Attach click event listeners to all booking buttons
    const bookingButtons = document.querySelectorAll('.btn-booking');
    bookingButtons.forEach(button => {
        button.addEventListener('click', handleBooking);
    });
});

async function handleBooking(event) {
    const movieId = event.target.getAttribute('data-movie-id');
    
    try {
        // Fetch showtimes for the selected movie
        const response = await fetch(`http://localhost:5501/api/movies/${movieId}/showtimes`);
        const showtimes = await response.json();
        
        if (showtimes.length === 0) {
            alert('Không có suất chiếu nào cho phim này.');
            return;
        }
        
        showBookingModal(movieId, showtimes);
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        alert('Không thể tải thông tin suất chiếu. Vui lòng thử lại sau.');
    }
}

function showBookingModal(movieId, showtimes) {
    // Group showtimes by date
    const showtimesByDate = {};
    showtimes.forEach(showtime => {
        const date = showtime.show_date;
        if (!showtimesByDate[date]) {
            showtimesByDate[date] = [];
        }
        showtimesByDate[date].push(showtime);
    });

    const modalHtml = `
        <div class="modal fade" id="bookingModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-cgv text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-ticket-alt me-2"></i>Đặt Vé Xem Phim
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0">
                        <div class="booking-steps">
                            <div class="step-indicators">
                                <div class="step active" data-step="1">
                                    <div class="step-number">1</div>
                                    <div class="step-title">Chọn Suất Chiếu</div>
                                </div>
                                <div class="step" data-step="2">
                                    <div class="step-number">2</div>
                                    <div class="step-title">Chọn Ghế</div>
                                </div>
                                <div class="step" data-step="3">
                                    <div class="step-number">3</div>
                                    <div class="step-title">Chọn Loại Vé</div>
                                </div>
                            </div>

                            <form id="bookingForm" class="booking-form">
                                <div class="step-content active" data-step="1">
                                    <div class="step-body">
                                        <h3 class="step-heading">Chọn Suất Chiếu</h3>
                                        
                                        <div class="date-selection mb-4">
                                            <h4 class="date-heading">Chọn Ngày</h4>
                                            <div class="date-list">
                                                ${Object.keys(showtimesByDate).map((date, index) => `
                                                    <div class="date-item">
                                                        <input type="radio" class="btn-check" name="selectedDate" 
                                                            id="date-${index}" value="${date}" 
                                                            ${index === 0 ? 'checked' : ''}>
                                                        <label class="btn btn-outline-cgv" for="date-${index}">
                                                            <div class="date-day">
                                                                ${new Date(date).toLocaleDateString('vi-VN', {weekday: 'short'})}
                                                            </div>
                                                            <div class="date-number">
                                                                ${new Date(date).getDate()}
                                                            </div>
                                                            <div class="date-month">
                                                                Tháng ${new Date(date).getMonth() + 1}
                                                            </div>
                                                        </label>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>

                                        <div class="time-selection">
                                            <h4 class="time-heading">Chọn Giờ</h4>
                                            ${Object.entries(showtimesByDate).map(([date, times]) => `
                                                <div class="time-list" data-date="${date}">
                                                    ${times.map(time => `
                                                        <div class="time-item">
                                                            <input type="radio" class="btn-check" name="showtime" 
                                                                id="showtime-${time.id}" value="${time.id}"
                                                                data-date="${date}">
                                                            <label class="btn btn-outline-cgv" for="showtime-${time.id}">
                                                                <div class="time-value">
                                                                    <i class="far fa-clock me-2"></i>${time.show_time}
                                                                </div>
                                                                <div class="theater-number">
                                                                    <i class="fas fa-film me-2"></i>Rạp ${time.theater_number}
                                                                </div>
                                                            </label>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>

                                <div class="step-content" data-step="2">
                                    <div class="step-body">
                                        <h3 class="step-heading">Chọn Ghế</h3>
                                        <div class="seat-selection">
                                            <div class="seat-map">
                                                <div class="screen">Màn hình</div>
                                                ${generateSeatMap()}
                                            </div>
                                            <div class="seat-types-legend">
                                                <div class="legend-item">
                                                    <span class="seat-icon standard"></span>
                                                    <span>Ghế Thường</span>
                                                </div>
                                                <div class="legend-item">
                                                    <span class="seat-icon deluxe"></span>
                                                    <span>Ghế Deluxe (+55,000đ)</span>
                                                </div>
                                                <div class="legend-item">
                                                    <span class="seat-icon sweetbox"></span>
                                                    <span>Ghế Sweetbox (+110,000đ)</span>
                                                </div>
                                            </div>
                                            <div class="selected-seats-info mt-4">
                                                <h4 class="text-center mb-3">Ghế Đã Chọn</h4>
                                                <div id="selectedSeatsDisplay" class="text-center">
                                                    <span class="text-muted">Chưa chọn ghế nào</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="step-content" data-step="3">
                                    <div class="step-body">
                                        <h3 class="step-heading">Chọn Loại Vé</h3>
                                        <div id="ticketTypesContainer"></div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="modal-footer bg-light">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Đóng
                        </button>
                        <button type="button" class="btn btn-prev btn-outline-cgv d-none">
                            <i class="fas fa-chevron-left me-2"></i>Quay Lại
                        </button>
                        <button type="button" class="btn btn-next btn-cgv">
                            <span class="next-text">Tiếp Tục</span>
                            <span class="confirm-text d-none">Xác Nhận Đặt Vé</span>
                            <i class="fas fa-chevron-right ms-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
    
    // Initialize booking steps
    initializeBookingSteps();
    
    // Initialize date and time selection
    initializeDateTimeSelection();
    
    document.getElementById('bookingModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });

    // Add custom styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        :root {
            --cgv-red: #e71a0f;
            --cgv-dark: #1a1a1a;
            --cgv-light: #f8f9fa;
        }

        .bg-cgv {
            background-color: var(--cgv-red) !important;
        }

        .btn-cgv {
            background-color: var(--cgv-red);
            color: white;
            border: none;
        }

        .btn-cgv:hover {
            background-color: #c41810;
            color: white;
        }

        .btn-outline-cgv {
            color: var(--cgv-red);
            border-color: var(--cgv-red);
        }

        .btn-outline-cgv:hover {
            background-color: var(--cgv-red);
            color: white;
        }

        .booking-steps {
            background-color: white;
        }

        .step-indicators {
            display: flex;
            justify-content: space-around;
            padding: 1.5rem;
            background-color: var(--cgv-light);
            border-bottom: 1px solid #dee2e6;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 1rem;
            opacity: 0.5;
            transition: all 0.3s ease;
        }

        .step.active {
            opacity: 1;
        }

        .step-number {
            width: 2rem;
            height: 2rem;
            background-color: var(--cgv-red);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .step-title {
            font-weight: 600;
            color: var(--cgv-dark);
        }

        .step-content {
            display: none;
            padding: 2rem;
        }

        .step-content.active {
            display: block;
        }

        .step-heading {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--cgv-dark);
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .showtime-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
        }

        .showtime-item label {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            text-align: center;
            border: 2px solid #dee2e6;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
        }

        .showtime-date {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
        }

        .seat-map {
            margin-bottom: 2rem;
        }

        .screen {
            background: linear-gradient(0deg, #ffffff 0%, #e0e0e0 100%);
            text-align: center;
            padding: 1rem;
            margin-bottom: 2rem;
            border-radius: 50%/100% 100% 0 0;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .seat-row {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .seat {
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #dee2e6;
            border-radius: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .seat.standard { border-color: #28a745; }
        .seat.deluxe { border-color: #ffc107; }
        .seat.sweetbox { border-color: #dc3545; }
        .seat:hover { transform: scale(1.1); }
        .seat.selected { 
            background-color: var(--cgv-red);
            color: white;
            border-color: var(--cgv-red);
        }

        .seat-types-legend {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 2rem;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .seat-icon {
            width: 20px;
            height: 20px;
            border: 2px solid;
            border-radius: 4px;
        }

        .seat-icon.standard { border-color: #28a745; }
        .seat-icon.deluxe { border-color: #ffc107; }
        .seat-icon.sweetbox { border-color: #dc3545; }

        .ticket-type-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .ticket-type-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            border: 2px solid #dee2e6;
            border-radius: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .ticket-type-card:hover {
            border-color: var(--cgv-red);
            transform: translateY(-2px);
        }

        .btn-check:checked + .ticket-type-card {
            background-color: var(--cgv-red);
            border-color: var(--cgv-red);
            color: white;
        }

        .ticket-icon {
            width: 3rem;
            height: 3rem;
            background-color: rgba(0,0,0,0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .ticket-icon i {
            font-size: 1.5rem;
        }

        .ticket-info h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
        }

        .ticket-info p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .date-selection {
            padding: 0 1rem;
        }

        .date-heading, .time-heading {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--cgv-dark);
            margin-bottom: 1rem;
        }

        .date-list {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding: 0.5rem 0;
            margin: 0 -1rem;
            padding: 0.5rem 1rem;
        }

        .date-item {
            flex: 0 0 auto;
        }

        .date-item label {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            min-width: 100px;
            text-align: center;
        }

        .date-day {
            font-size: 0.9rem;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }

        .date-number {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
        }

        .date-month {
            font-size: 0.8rem;
        }

        .time-selection {
            padding: 1rem;
            border-top: 1px solid #dee2e6;
        }

        .time-list {
            display: none;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
        }

        .time-list.active {
            display: grid;
        }

        .time-item label {
            display: flex;
            flex-direction: column;
            padding: 1rem;
            text-align: center;
        }

        .time-value {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .theater-number {
            font-size: 0.9rem;
            color: #666;
        }

        /* Update existing button styles */
        .btn-check:checked + .btn-outline-cgv {
            background-color: var(--cgv-red);
            color: white;
        }

        .seat-count {
            text-align: center;
            padding: 1rem;
            background: var(--cgv-light);
            border-radius: 0.5rem;
        }

        .seat-count-heading {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .seat-count-control {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }

        .seat-count-control button {
            width: 40px;
            height: 40px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .seat-count-control span {
            font-size: 1.5rem;
            font-weight: bold;
            min-width: 40px;
        }

        .seat-count-help {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #666;
        }

        .ticket-type-selection {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border: 1px solid #dee2e6;
            border-radius: 0.5rem;
            background: var(--cgv-light);
        }

        .ticket-type-selection h4 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--cgv-dark);
        }
    `;
    document.head.appendChild(styleSheet);
}

function generateSeatMap() {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    let seatMap = '';
    
    rows.forEach(row => {
        seatMap += `<div class="seat-row">`;
        seatMap += `<div class="row-label">${row}</div>`;
        for (let i = 1; i <= seatsPerRow; i++) {
            const seatNumber = `${row}${i.toString().padStart(2, '0')}`;
            const seatType = row <= 'D' ? 'standard' : 
                           row <= 'F' ? 'deluxe' : 'sweetbox';
            seatMap += `
                <div class="seat ${seatType}" data-seat="${seatNumber}">
                    ${i}
                </div>
            `;
        }
        seatMap += `</div>`;
    });
    
    return seatMap;
}

function initializeBookingSteps() {
    let currentStep = 1;
    const totalSteps = 3;
    const modal = document.getElementById('bookingModal');
    const btnNext = modal.querySelector('.btn-next');
    const btnPrev = modal.querySelector('.btn-prev');
    const nextText = btnNext.querySelector('.next-text');
    const confirmText = btnNext.querySelector('.confirm-text');

    function updateSteps() {
        // Update step indicators
        modal.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update step content
        modal.querySelectorAll('.step-content').forEach(content => {
            const stepNum = parseInt(content.dataset.step);
            if (stepNum === currentStep) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Update buttons
        btnPrev.classList.toggle('d-none', currentStep === 1);
        nextText.classList.toggle('d-none', currentStep === totalSteps);
        confirmText.classList.toggle('d-none', currentStep !== totalSteps);

        // Generate ticket type selections when moving to step 3
        if (currentStep === 3) {
            generateTicketTypeSelections();
        }
    }

    btnNext.addEventListener('click', () => {
        if (currentStep === totalSteps) {
            confirmBooking();
        } else if (currentStep === 2) {
            // Check if at least one seat is selected
            const selectedSeats = modal.querySelectorAll('.seat.selected');
            if (selectedSeats.length === 0) {
                alert('Vui lòng chọn ít nhất một ghế.');
                return;
            }
            if (selectedSeats.length > 8) {
                alert('Bạn chỉ có thể chọn tối đa 8 ghế.');
                return;
            }
            currentStep++;
            updateSteps();
        } else {
            currentStep++;
            updateSteps();
        }
    });

    btnPrev.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateSteps();
        }
    });

    // Initialize seat selection
    modal.querySelectorAll('.seat').forEach(seat => {
        seat.addEventListener('click', function() {
            const selectedSeats = modal.querySelectorAll('.seat.selected');
            
            if (!this.classList.contains('selected') && selectedSeats.length >= 8) {
                alert('Bạn chỉ có thể chọn tối đa 8 ghế.');
                return;
            }
            
            this.classList.toggle('selected');
            
            // Update selected seats display
            const selectedSeatsDisplay = modal.querySelector('#selectedSeatsDisplay');
            const currentSelectedSeats = modal.querySelectorAll('.seat.selected');
            
            if (currentSelectedSeats.length > 0) {
                selectedSeatsDisplay.innerHTML = Array.from(currentSelectedSeats)
                    .map(seat => `<span class="badge bg-success me-2 mb-2">${seat.dataset.seat}</span>`)
                    .join('');
            } else {
                selectedSeatsDisplay.innerHTML = '<span class="text-muted">Chưa chọn ghế nào</span>';
            }
        });
    });
}

function initializeDateTimeSelection() {
    const modal = document.getElementById('bookingModal');
    const dateInputs = modal.querySelectorAll('input[name="selectedDate"]');
    const timeLists = modal.querySelectorAll('.time-list');

    // Show times for the first date by default
    const firstDate = dateInputs[0]?.value;
    if (firstDate) {
        showTimesForDate(firstDate);
    }

    // Handle date selection
    dateInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            showTimesForDate(e.target.value);
            // Clear any selected time when date changes
            modal.querySelectorAll('input[name="showtime"]').forEach(timeInput => {
                timeInput.checked = false;
            });
        });
    });
}

function showTimesForDate(date) {
    const modal = document.getElementById('bookingModal');
    const timeLists = modal.querySelectorAll('.time-list');

    timeLists.forEach(list => {
        if (list.dataset.date === date) {
            list.classList.add('active');
        } else {
            list.classList.remove('active');
        }
    });
}

function updateSeatCount(change) {
    const seatCountElement = document.querySelector('#seatCount');
    let currentCount = parseInt(seatCountElement.textContent);
    const newCount = Math.max(1, Math.min(8, currentCount + change));
    seatCountElement.textContent = newCount;

    // Reset seat selection when count changes
    const modal = document.getElementById('bookingModal');
    modal.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
}

function generateTicketTypeSelections() {
    const modal = document.getElementById('bookingModal');
    const selectedSeats = modal.querySelectorAll('.seat.selected');
    const container = document.getElementById('ticketTypesContainer');
    container.innerHTML = '';

    selectedSeats.forEach((seat, index) => {
        const seatNumber = seat.dataset.seat;
        container.innerHTML += `
            <div class="ticket-type-selection">
                <h4>Ghế ${seatNumber}</h4>
                <div class="ticket-type-grid">
                    <div class="ticket-type-item">
                        <input type="radio" class="btn-check" name="ticketType_${index}" 
                            id="regular_${index}" value="regular" checked>
                        <label class="ticket-type-card" for="regular_${index}">
                            <div class="ticket-icon">
                                <i class="fas fa-user"></i>
                            </div>
                            <div class="ticket-info">
                                <h4>Người Lớn</h4>
                                <p>Giá Gốc</p>
                            </div>
                        </label>
                    </div>
                    <div class="ticket-type-item">
                        <input type="radio" class="btn-check" name="ticketType_${index}" 
                            id="student_${index}" value="student">
                        <label class="ticket-type-card" for="student_${index}">
                            <div class="ticket-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="ticket-info">
                                <h4>Học Sinh/Sinh Viên</h4>
                                <p>Giảm 10%</p>
                            </div>
                        </label>
                    </div>
                    <div class="ticket-type-item">
                        <input type="radio" class="btn-check" name="ticketType_${index}" 
                            id="child_${index}" value="child">
                        <label class="ticket-type-card" for="child_${index}">
                            <div class="ticket-icon">
                                <i class="fas fa-child"></i>
                            </div>
                            <div class="ticket-info">
                                <h4>Trẻ Em</h4>
                                <p>Giảm 20%</p>
                            </div>
                        </label>
                    </div>
                    <div class="ticket-type-item">
                        <input type="radio" class="btn-check" name="ticketType_${index}" 
                            id="senior_${index}" value="senior">
                        <label class="ticket-type-card" for="senior_${index}">
                            <div class="ticket-icon">
                                <i class="fas fa-user-friends"></i>
                            </div>
                            <div class="ticket-info">
                                <h4>Người Cao Tuổi</h4>
                                <p>Giảm 15%</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        `;
    });
}

async function confirmBooking() {
    const modal = document.getElementById('bookingModal');
    const showtimeId = modal.querySelector('input[name="showtime"]:checked')?.value;
    const selectedSeats = modal.querySelectorAll('.seat.selected');
    
    if (!showtimeId || selectedSeats.length === 0) {
        alert('Vui lòng chọn đầy đủ thông tin đặt vé.');
        return;
    }

    try {
        // Disable nút đặt vé và hiển thị loading
        const btnNext = modal.querySelector('.btn-next');
        const originalText = btnNext.innerHTML;
        btnNext.disabled = true;
        btnNext.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';

        // Create bookings for each seat
        const bookings = [];
        for (let i = 0; i < selectedSeats.length; i++) {
            const seat = selectedSeats[i];
            const ticketType = modal.querySelector(`input[name="ticketType_${i}"]:checked`)?.value;
            
            if (!ticketType) {
                alert('Vui lòng chọn loại vé cho tất cả các ghế.');
                return;
            }

            const priceResponse = await fetch('http://localhost:5501/api/calculate-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    showtimeId,
                    seatNumber: seat.dataset.seat,
                    ticketType,
                    dayOfWeek: new Date().getDay()
                })
            });
            
            const priceData = await priceResponse.json();
            
            const bookingResponse = await fetch('http://localhost:5501/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: 1,
                    showtimeId,
                    seatNumber: seat.dataset.seat,
                    ticketType,
                    totalAmount: priceData.finalPrice
                })
            });
            
            const booking = await bookingResponse.json();
            bookings.push(booking);
        }

        // Restore nút đặt vé
        btnNext.disabled = false;
        btnNext.innerHTML = originalText;

        // Đóng modal đặt vé
        const bookingModal = bootstrap.Modal.getInstance(modal);
        bookingModal.hide();

        // Chuyển hướng đến trang vé mới với thông tin tất cả các vé
        const ticketUrl = new URL('/ticket.html', window.location.origin);
        
        // Add parameters for each booking
        bookings.forEach(booking => {
            ticketUrl.searchParams.append('id', booking.id);
            ticketUrl.searchParams.append('ticketCode', booking.ticket_code);
            ticketUrl.searchParams.append('title', booking.title);
            ticketUrl.searchParams.append('showDate', booking.show_date);
            ticketUrl.searchParams.append('showTime', booking.show_time);
            ticketUrl.searchParams.append('seatNumber', booking.seat_number);
            ticketUrl.searchParams.append('theaterNumber', booking.theater_number);
            ticketUrl.searchParams.append('totalAmount', booking.total_amount);
        });
        
        window.location.href = ticketUrl.toString();

    } catch (error) {
        console.error('Error creating booking:', error);
        alert('Không thể tạo đơn đặt vé. Vui lòng thử lại sau.');
        
        // Restore nút đặt vé trong trường hợp lỗi
        const btnNext = modal.querySelector('.btn-next');
        btnNext.disabled = false;
        btnNext.innerHTML = originalText;
    }
}

function displayTicket(booking) {
    // Xóa overlay cũ nếu có
    const existingOverlay = document.getElementById('ticketOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const overlayHtml = `
        <div id="ticketOverlay" class="ticket-overlay">
            <div class="ticket-container">
                <div class="ticket-wrapper">
                    <div class="movie-ticket">
                        <div class="ticket-header">
                            <img src="https://www.cgv.vn/skin/frontend/cgv/default/images/cgvlogo.png" 
                                alt="CGV Logo" class="cgv-logo">
                            <div class="ticket-code">
                                <div class="code-label">MÃ VÉ</div>
                                <div class="code-value">${booking.ticket_code}</div>
                            </div>
                        </div>
                        
                        <div class="ticket-body">
                            <div class="movie-info">
                                <h2 class="movie-title">${booking.title}</h2>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <i class="far fa-calendar-alt"></i>
                                        <div class="info-content">
                                            <label>Ngày Chiếu</label>
                                            <span>${new Date(booking.show_date).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <i class="far fa-clock"></i>
                                        <div class="info-content">
                                            <label>Giờ Chiếu</label>
                                            <span>${booking.show_time}</span>
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-couch"></i>
                                        <div class="info-content">
                                            <label>Ghế</label>
                                            <span>${booking.seat_number}</span>
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <i class="fas fa-film"></i>
                                        <div class="info-content">
                                            <label>Rạp</label>
                                            <span>CINEMA ${booking.theater_number}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="ticket-footer">
                                <div class="price-tag">
                                    <label>TỔNG TIỀN</label>
                                    <span>${booking.total_amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div class="ticket-barcode">
                                    <i class="fas fa-barcode fa-2x"></i>
                                    <div class="barcode-number">${booking.ticket_code}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ticket-actions">
                        <button type="button" class="btn btn-outline-light" onclick="closeTicket()">
                            <i class="fas fa-times me-2"></i>Đóng
                        </button>
                        <a href="http://localhost:5501/api/ticket/${booking.id}" 
                            target="_blank" class="btn btn-cgv">
                            <i class="fas fa-download me-2"></i>Tải Vé PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', overlayHtml);

    // Thêm hàm đóng vé vào window object
    window.closeTicket = function() {
        const overlay = document.getElementById('ticketOverlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    };

    // Add custom styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .ticket-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }

        .ticket-overlay.fade-out {
            animation: fadeOut 0.3s ease forwards;
        }

        .ticket-container {
            width: 100%;
            max-width: 600px;
            margin: 2rem;
            perspective: 1000px;
        }

        .ticket-wrapper {
            transform-style: preserve-3d;
            animation: flipIn 0.6s ease-out forwards;
        }

        .movie-ticket {
            background: white;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            transform-origin: center center;
        }

        .ticket-header {
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            padding: 2rem;
            text-align: center;
            position: relative;
        }

        .cgv-logo {
            height: 50px;
            margin-bottom: 1rem;
            animation: fadeInDown 0.5s ease forwards 0.6s;
            opacity: 0;
        }

        .ticket-code {
            display: inline-block;
            background: var(--cgv-red);
            padding: 0.5rem 2rem;
            border-radius: 2rem;
            color: white;
            box-shadow: 0 4px 15px rgba(231, 26, 15, 0.2);
            animation: fadeInUp 0.5s ease forwards 0.8s;
            opacity: 0;
        }

        .ticket-body {
            padding: 2rem;
            animation: fadeIn 0.5s ease forwards 1s;
            opacity: 0;
        }

        .movie-title {
            font-size: 1.75rem;
            font-weight: bold;
            color: var(--cgv-dark);
            text-align: center;
            margin-bottom: 2rem;
            text-transform: uppercase;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .info-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: var(--cgv-light);
            border-radius: 0.5rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: fadeInUp 0.5s ease forwards;
            opacity: 0;
        }

        .info-item:nth-child(1) { animation-delay: 1.2s; }
        .info-item:nth-child(2) { animation-delay: 1.4s; }
        .info-item:nth-child(3) { animation-delay: 1.6s; }
        .info-item:nth-child(4) { animation-delay: 1.8s; }

        .ticket-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
            animation: fadeInUp 0.5s ease forwards 2s;
            opacity: 0;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes flipIn {
            from {
                opacity: 0;
                transform: rotateX(-90deg);
            }
            to {
                opacity: 1;
                transform: rotateX(0);
            }
        }

        @media (max-width: 576px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .ticket-container {
                margin: 1rem;
            }
        }
    `;
    document.head.appendChild(styleSheet);

    // Thêm hiệu ứng xuất hiện cho vé
    const movieTicket = document.querySelector('.movie-ticket');
    if (movieTicket) {
        setTimeout(() => {
            movieTicket.style.opacity = '1';
            movieTicket.style.transform = 'translateY(0)';
        }, 100);
    }
} 