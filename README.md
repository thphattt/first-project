# CGV Movie Ticket Booking System

Hệ thống đặt vé xem phim trực tuyến của CGV Cinemas, cho phép người dùng đặt vé dễ dàng và nhanh chóng.

## Tính năng

- Xem danh sách phim đang chiếu
- Chọn suất chiếu theo ngày và giờ
- Chọn ghế trực tiếp trên sơ đồ
- Hỗ trợ nhiều loại vé (Người thường, Học sinh, Trẻ em, Người già)
- Tính giá vé tự động với các ưu đãi
- Hiển thị vé điện tử với mã QR
- Hỗ trợ in vé PDF

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/yourusername/cgv-ticket-booking.git
cd cgv-ticket-booking
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Khởi động server:
```bash
npm start
```

4. Truy cập ứng dụng:
```
http://localhost:5501
```

## Công nghệ sử dụng

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- Database: SQLite
- UI Framework: Bootstrap 5
- Icons: Font Awesome

## Cấu trúc project

```
cgv-ticket-booking/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── server.js
├── package.json
└── README.md
```

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng:

1. Fork project
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết. 