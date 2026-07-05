ĐỒ ÁN LẬP TRÌNH JAVASCRIPT
Sinh viên: Tôn Đức Quang 
Mã SV: 501250034

TÊN GAME: FLAPPY BIRD (NHÂN VẬT CHÚ BÒ)

------------------------------------------
1. MÔ TẢ DỰ ÁN
------------------------------------------
- Đây là tựa game Flappy Bird được lập trình 100% bằng HTML, CSS, và JavaScript thuần (Vanilla JS), không sử dụng bất kỳ framework hay thư viện bên ngoài nào (như React, Vue, Canvas API,...).
- Toàn bộ giao diện và chuyển động (animation) được xây dựng trực tiếp trên DOM.
- Game sử dụng vòng lặp tối ưu bằng requestAnimationFrame.
- Hệ thống va chạm (Collision Detection) được lập trình bằng thuật toán tọa độ toán học chuẩn (AABB) và căn chỉnh chính xác Hitbox của nhân vật độc lập với CSS.

------------------------------------------
2. CÁC TÍNH NĂNG CHÍNH
------------------------------------------
- Điều khiển: Nhấn phím SPACE hoặc CLICK CHUỘT trái để nhảy.
- Tạm dừng: Nhấn phím P để tạm dừng hoặc tiếp tục chơi.
- Hệ thống Màn chơi:
  + Màn 1: Ống nước di chuyển chậm, khoảng trống (gap) rộng (220px).
  + Màn 2: Đạt 10 điểm sẽ chuyển màn. Ống nước di chuyển nhanh hơn, khoảng trống thu hẹp (180px).
- Chiến thắng: Đạt 20 điểm để phá đảo trò chơi.
- Lưu trữ Kỷ lục: Sử dụng LocalStorage của trình duyệt để lưu lại Điểm Cao Nhất (High Score).
- Ống nước được "vẽ" hoàn toàn bằng kỹ thuật CSS linear-gradient và flexbox, cho ra hình ảnh sắc nét không cần tới file ảnh.

------------------------------------------
3. CẤU TRÚC DỰ ÁN
------------------------------------------
/
|-- index.html         # Khung giao diện HTML chính
|-- css/style.css      # Toàn bộ Style giao diện và CSS Ống nước
|-- js/script.js       # Core logic điều khiển game
|-- assets/            # Chứa các tài nguyên tĩnh:
    |-- chau-removebg-preview.png   # Ảnh nhân vật (Chú bò đã tách nền)
    |-- background.png              # Ảnh nền Background game
    |-- jump.mp3                    # Âm thanh khi nhảy
    |-- score.mp3                   # Âm thanh khi qua ống/ghi điểm
    |-- gameover.mp3                # Âm thanh khi va chạm/thua
    |-- victory.mp3                 # Âm thanh khi chiến thắng

------------------------------------------
4. HƯỚNG DẪN CÀI ĐẶT & CHẠY GAME
------------------------------------------
- Không cần cài đặt Node.js hay bất kỳ server nào.
- Chỉ cần nháy đúp chuột vào file index.html để mở trên trình duyệt (Chrome, Cốc Cốc, Edge,...).
- Đảm bảo các file hình ảnh và âm thanh đã được đặt đúng tên bên trong thư mục assets/ để không bị lỗi thiếu tài nguyên.
