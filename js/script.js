// --- CÁC BIẾN CHÍNH ---
let viTriChim = 250; // Vị trí Y của chim
let vanTocChim = 0;  // Vận tốc rơi/nhảy của chim
let trongLuc = 0.4;  // Trọng lực kéo chim xuống
let diem = 0;        // Điểm số hiện tại
let diemCaoNhat = 0; // Kỷ lục điểm cao nhất
let manChoi = 1;     // Màn chơi hiện tại (1 hoặc 2)
let tocDoOng = 3;    // Tốc độ di chuyển của ống nước sang trái
let khoangTrong = 220; // Khoảng cách (GAP) giữa ống trên và ống dưới (Màn 1: 220px)
let dangTamDung = false; // Trạng thái tạm dừng game
let daThua = false;      // Trạng thái thua game
let daThang = false;     // Trạng thái thắng game
let dangChoi = false;    // Trạng thái game đang chạy (để phân biệt với lúc đếm ngược)
let thoiGianTruoc = 0;   // Thời gian của frame trước đó

// --- CÁC PHẦN TỬ DOM ---
const gameContainer = document.getElementById('game-container'); // Khung chứa game
const chim = document.getElementById('bird'); // Khối chim
const khungChuaOng = document.getElementById('pipes-container'); // Khối chứa các ống nước
const diemHienTaiEl = document.getElementById('current-score'); // Nơi hiển thị điểm
const diemCaoNhatEl = document.getElementById('high-score');    // Nơi hiển thị kỷ lục

// Màn hình
const manHinhBatDau = document.getElementById('start-screen');
const manHinhThua = document.getElementById('gameover-screen');
const manHinhThang = document.getElementById('win-screen');

// Chữ hiển thị / Overlay
const lopPhuThongBao = document.getElementById('message-overlay');
const chuThongBao = document.getElementById('message-text');
const chuTamDung = document.getElementById('pause-indicator');

// Các nút
const nutBatDau = document.getElementById('start-btn');
const nutChoiLai = document.getElementById('restart-btn');
const nutChoiLaiThang = document.getElementById('win-restart-btn');

// Nơi hiển thị điểm khi game kết thúc
const diemCuoiCungEl = document.getElementById('final-score');
const kyLucCuoiCungEl = document.getElementById('final-high-score');
const diemThangEl = document.getElementById('win-score');

// Vòng lặp Game / Intervals
let idVongLapGame; // ID của requestAnimationFrame
let idTaoOng;      // ID của setInterval tạo ống
let danhSachOng = []; // Mảng chứa các đối tượng ống nước hiện có trên màn hình

// --- ÂM THANH ---
// Khởi tạo các đối tượng Audio
const amThanhNhay = new Audio('./assets/jump.mp3');
const amThanhDiem = new Audio('./assets/score.mp3');
const amThanhThua = new Audio('./assets/gameover.mp3');
const amThanhThang = new Audio('./assets/victory.mp3');

// Hàm phát âm thanh an toàn (phòng trường hợp không có file sẽ không bị crash game)
function phatAmThanh(audioEl) {
    if (!audioEl) return;
    audioEl.currentTime = 0; // Trả về đầu file để phát nhanh
    audioEl.play().catch(e => {
        // Bỏ qua lỗi nếu trình duyệt chặn autoplay hoặc file không tồn tại
    });
}

// --- KHỞI TẠO GAME ---
function khoiTao() {
    taiDiemCaoNhat(); // Lấy điểm cao nhất từ localStorage
    diemCaoNhatEl.innerText = `Kỷ lục: ${diemCaoNhat}`;
    
    // Gán sự kiện click cho các nút
    nutBatDau.addEventListener('click', batDauGame);
    nutChoiLai.addEventListener('click', choiLai);
    nutChoiLaiThang.addEventListener('click', choiLai);

    // Gán sự kiện điều khiển bàn phím và chuột
    document.addEventListener('keydown', xuLyPhimAn);
    gameContainer.addEventListener('mousedown', xuLyClickChuot);
}

// Xử lý khi nhấn phím
function xuLyPhimAn(e) {
    if (e.code === 'Space') {
        e.preventDefault(); // Tránh bị cuộn trang màn hình khi nhấn Space
        nhayLen();
    }
    if (e.code === 'KeyP') {
        // Nhấn P để tạm dừng hoặc tiếp tục
        if (dangChoi && !daThua && !daThang) {
            if (dangTamDung) tiepTucGame();
            else tamDungGame();
        }
    }
}

// Xử lý khi click chuột
function xuLyClickChuot(e) {
    // Chỉ kích hoạt nhảy khi click vào khu vực game, bỏ qua các nút bấm
    if (e.target.tagName !== 'BUTTON') {
        nhayLen();
    }
}

// --- LOGIC GAME ---

// Bắt đầu game từ đầu
function batDauGame() {
    // Ẩn tất cả các màn hình phụ
    manHinhBatDau.classList.add('hidden');
    manHinhThua.classList.add('hidden');
    manHinhThang.classList.add('hidden');
    
    datLaiBien(); // Reset các thông số về mặc định
    hieuUngDemNguoc(chayGame); // Chạy đếm ngược rồi mới bắt đầu
}

// Đặt lại toàn bộ biến game
function datLaiBien() {
    viTriChim = 250;
    vanTocChim = 0;
    diem = 0;
    manChoi = 1;
    tocDoOng = 3;
    khoangTrong = 220; // Màn 1 khoảng trống (GAP) là 220px
    dangTamDung = false;
    daThua = false;
    daThang = false;
    dangChoi = false;
    danhSachOng = [];
    khungChuaOng.innerHTML = ''; // Xóa sạch ống nước cũ
    
    chim.style.top = viTriChim + 'px';
    chim.style.transform = `rotate(0deg)`; // Chỉnh đầu chim thẳng lại
    diemHienTaiEl.innerText = `Điểm: ${diem}`;
}

// Hàm chơi lại gọi hàm bắt đầu game
function choiLai() {
    batDauGame();
}

// Hiệu ứng đếm ngược 3 2 1 GO
function hieuUngDemNguoc(callback) {
    lopPhuThongBao.classList.remove('hidden');
    let demNguoc = 3;
    
    chuThongBao.innerText = demNguoc;
    chuThongBao.classList.remove('level-transition-effect'); // Bỏ CSS chuyển màn nếu có
    
    let interval = setInterval(() => {
        demNguoc--;
        if (demNguoc > 0) {
            chuThongBao.innerText = demNguoc;
        } else if (demNguoc === 0) {
            chuThongBao.innerText = "GO!";
        } else {
            clearInterval(interval);
            lopPhuThongBao.classList.add('hidden'); // Ẩn đếm ngược
            callback(); // Gọi hàm chạy game
        }
    }, 1000);
}

// Kích hoạt vòng lặp game chính
function chayGame() {
    dangChoi = true;
    thoiGianTruoc = performance.now();
    idVongLapGame = requestAnimationFrame(vongLapGame);
    idTaoOng = setInterval(taoOng, 1500); // Mỗi 1.5s tạo 1 cặp ống
}

// Xử lý chim nhảy lên
function nhayLen() {
    if (!dangChoi || dangTamDung || daThua || daThang) return; // Không cho nhảy nếu game đã dừng
    
    vanTocChim = -7; // Cung cấp lực nhảy hướng lên (âm là hướng lên do y gốc ở trên)
    phatAmThanh(amThanhNhay);
}

// Cập nhật vị trí và góc xoay của chim
function capNhatChim(deltaTime) {
    vanTocChim += trongLuc * deltaTime; // Trọng lực liên tục kéo chim xuống
    viTriChim += vanTocChim * deltaTime; // Cộng vận tốc vào vị trí
    chim.style.top = viTriChim + 'px';
    
    // Xoay đầu chim hướng lên khi nhảy, hướng xuống khi rơi
    let gocXoay = Math.min((vanTocChim / 10) * 90, 90);
    chim.style.transform = `rotate(${gocXoay}deg)`;
}

// Hàm sinh ống nước ngẫu nhiên
function taoOng() {
    if (dangTamDung || daThua || daThang) return;
    
    const chieuCaoOngToiThieu = 50; // Tránh ống quá ngắn
    // Tính toán chiều cao tối đa của ống trên để đảm bảo đủ GAP và ống dưới không bị âm
    const chieuCaoOngToiDa = 600 - khoangTrong - chieuCaoOngToiThieu;
    // Lấy ngẫu nhiên chiều cao cho ống trên
    const chieuCaoOngTren = Math.floor(Math.random() * (chieuCaoOngToiDa - chieuCaoOngToiThieu + 1)) + chieuCaoOngToiThieu;
    // Tính chiều cao ống dưới dựa theo công thức: 600 - ống trên - GAP
    const chieuCaoOngDuoi = 600 - chieuCaoOngTren - khoangTrong;
    
    // Tạo ống trên
    const ongTren = document.createElement('div');
    ongTren.classList.add('ong-tren');
    ongTren.style.height = `${chieuCaoOngTren}px`; // Chiều cao ngẫu nhiên
    ongTren.style.left = '400px'; // Bắt đầu xuất hiện ngoài mép phải màn hình
    
    const dauOngTren = document.createElement('div');
    dauOngTren.classList.add('dau-ong');
    const thanOngTren = document.createElement('div');
    thanOngTren.classList.add('than-ong');
    ongTren.appendChild(dauOngTren);
    ongTren.appendChild(thanOngTren);
    
    // Tạo ống dưới
    const ongDuoi = document.createElement('div');
    ongDuoi.classList.add('ong-duoi');
    ongDuoi.style.height = `${chieuCaoOngDuoi}px`;
    ongDuoi.style.left = '400px';
    
    const dauOngDuoi = document.createElement('div');
    dauOngDuoi.classList.add('dau-ong');
    const thanOngDuoi = document.createElement('div');
    thanOngDuoi.classList.add('than-ong');
    ongDuoi.appendChild(dauOngDuoi);
    ongDuoi.appendChild(thanOngDuoi);
    
    // Thêm cặp ống vào khung chứa
    khungChuaOng.appendChild(ongTren);
    khungChuaOng.appendChild(ongDuoi);
    
    // Lưu vào mảng để quản lý di chuyển và va chạm
    danhSachOng.push({
        top: ongTren,
        bottom: ongDuoi,
        x: 400,
        daCongDiem: false // Cờ đánh dấu để chỉ cộng điểm 1 lần khi bay qua
    });
}

// Di chuyển tất cả ống sang trái
function diChuyenOng(deltaTime) {
    for (let i = 0; i < danhSachOng.length; i++) {
        let ong = danhSachOng[i];
        ong.x -= tocDoOng * deltaTime; // Ống tiến về bên trái
        
        // Cập nhật giao diện
        ong.top.style.left = ong.x + 'px';
        ong.bottom.style.left = ong.x + 'px';
        
        // Chim bay qua ống thành công (tọa độ chim > tọa độ mép phải của ống)
        // Chim ở vị trí X = 50, ống rộng 70px (do dùng kiến trúc mới)
        if (ong.x + 70 < 50 && !ong.daCongDiem) {
            ong.daCongDiem = true;
            capNhatDiem();
        }
        
        // Xóa ống khỏi bộ nhớ và DOM khi nó chạy khuất màn hình (x < -70)
        if (ong.x + 70 < 0) {
            khungChuaOng.removeChild(ong.top);
            khungChuaOng.removeChild(ong.bottom);
            danhSachOng.splice(i, 1);
            i--; // Điều chỉnh index vòng lặp sau khi xóa phần tử
        }
    }
}

// Hàm hỗ trợ kiểm tra va chạm giữa 2 hộp AABB
function kiemTraAABB(box1, box2) {
    return (
        box1.right > box2.left && 
        box1.left < box2.right && 
        box1.top < box2.bottom && 
        box1.bottom > box2.top
    );
}

// Kiểm tra sự kiện va chạm chính (Sử dụng Tọa độ Logic thuần, KHÔNG dùng getBoundingClientRect)
function kiemTraVaCham() {
    // 1. Tọa độ logic của nhân vật (dựa theo CSS hiển thị)
    let chimX = 50; // left cố định 50px trong CSS
    let chimY = viTriChim; // vị trí Y đang được cập nhật
    let chimRong = 70; // width thực tế
    let chimCao = 65;  // height thực tế
    
    // Thu nhỏ hitbox nhân vật 20% mỗi bên (cắt viền trong suốt của ảnh PNG)
    const hitboxNhanVat = {
        left: chimX + chimRong * 0.20,
        right: chimX + chimRong * 0.80,
        top: chimY + chimCao * 0.20,
        bottom: chimY + chimCao * 0.80
    };
    
    let danhSachHitboxOng = [];
    let coVaCham = false;
    
    // 2. Chim chạm mép trên hoặc mép dưới màn hình (game cao 600px)
    if (hitboxNhanVat.bottom >= 600 || hitboxNhanVat.top <= 0) {
        coVaCham = true;
    }
    
    // 3. Kiểm tra va chạm với các ống nước
    for (let i = 0; i < danhSachOng.length; i++) {
        let ong = danhSachOng[i];
        
        let ongX = ong.x;
        let ongRong = 70; // Ống rộng 70px theo cấu trúc CSS
        
        // Trích xuất chiều cao ống từ DOM (vì ta đã gán inline style.height lúc tạo)
        let caoOngTren = parseInt(ong.top.style.height);
        let caoOngDuoi = parseInt(ong.bottom.style.height);
        
        // Thu nhỏ chiều rộng ống (cắt mỗi bên 4px)
        let hitboxOngTren = {
            left: ongX + 4,
            right: ongX + ongRong - 4,
            top: 0,
            bottom: caoOngTren
        };
        
        let hitboxOngDuoi = {
            left: ongX + 4,
            right: ongX + ongRong - 4,
            top: 600 - caoOngDuoi,
            bottom: 600
        };
        
        // Kiểm tra va chạm hộp (AABB)
        if (kiemTraAABB(hitboxNhanVat, hitboxOngTren) || kiemTraAABB(hitboxNhanVat, hitboxOngDuoi)) {
            coVaCham = true;
            break; // Nếu chạm 1 ống là chết, thoát luôn
        }
    }
    
    return coVaCham;
}

// Xử lý cộng điểm và chuyển màn
function capNhatDiem() {
    diem++;
    diemHienTaiEl.innerText = `Điểm: ${diem}`;
    phatAmThanh(amThanhDiem);
    
    // Chuyển Màn 2 nếu đủ 10 điểm, Thắng nếu đủ 20 điểm
    if (manChoi === 1 && diem >= 10) {
        chuyenMan();
    } else if (manChoi === 2 && diem >= 20) {
        hienManHinhThang();
    }
}

// Logic chuyển màn chơi (Tăng độ khó)
function chuyenMan() {
    dangChoi = false;
    cancelAnimationFrame(idVongLapGame);
    clearInterval(idTaoOng);
    
    // Hiện thông báo chuyển màn có hiệu ứng zoom in/out
    lopPhuThongBao.classList.remove('hidden');
    chuThongBao.innerText = "===== MÀN 2 =====";
    chuThongBao.classList.add('level-transition-effect');
    
    // Chờ 2 giây rồi tiếp tục
    setTimeout(() => {
        lopPhuThongBao.classList.add('hidden');
        chuThongBao.classList.remove('level-transition-effect');
        
        // Cấu hình khó hơn cho Màn 2
        manChoi = 2;
        tocDoOng = 5;      // Tăng tốc
        khoangTrong = 180; // GAP thu hẹp lại (Màn 2: 180px)
        
        // Dọn dẹp ống cũ
        khungChuaOng.innerHTML = '';
        danhSachOng = [];
        
        // Tiếp tục chạy vòng lặp
        dangChoi = true;
        thoiGianTruoc = performance.now();
        idVongLapGame = requestAnimationFrame(vongLapGame);
        idTaoOng = setInterval(taoOng, 1200); // Màn 2 ống xuất hiện nhanh hơn (1.2s)
    }, 2000);
}

// Xử lý khi chim đập vào vật cản (Game Over)
function hienGameOver() {
    daThua = true;
    dangChoi = false;
    cancelAnimationFrame(idVongLapGame);
    clearInterval(idTaoOng);
    
    phatAmThanh(amThanhThua);
    
    // Hiệu ứng CSS rung toàn bộ khung game
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 300);
    
    luuDiemCaoNhat(); // Kiểm tra và lưu kỷ lục
    
    diemCuoiCungEl.innerText = diem;
    kyLucCuoiCungEl.innerText = diemCaoNhat;
    
    // Delay nhẹ để người chơi thấy rõ cảnh va chạm trước khi hiện bảng
    setTimeout(() => {
        manHinhThua.classList.remove('hidden');
    }, 500); 
}

// Xử lý khi phá đảo game
function hienManHinhThang() {
    daThang = true;
    dangChoi = false;
    cancelAnimationFrame(idVongLapGame);
    clearInterval(idTaoOng);
    
    phatAmThanh(amThanhThang);
    luuDiemCaoNhat();
    
    diemThangEl.innerText = diem;
    
    setTimeout(() => {
        manHinhThang.classList.remove('hidden');
    }, 500);
}

// Lưu điểm vào LocalStorage để không mất khi F5
function luuDiemCaoNhat() {
    if (diem > diemCaoNhat) {
        diemCaoNhat = diem;
        localStorage.setItem('flappyBirdHighScore', diemCaoNhat);
        diemCaoNhatEl.innerText = `Kỷ lục: ${diemCaoNhat}`;
    }
}

// Tải lại điểm từ LocalStorage
function taiDiemCaoNhat() {
    const diemLuu = localStorage.getItem('flappyBirdHighScore');
    if (diemLuu) {
        diemCaoNhat = parseInt(diemLuu);
    }
}

// Dừng game khi nhấn P
function tamDungGame() {
    dangTamDung = true;
    cancelAnimationFrame(idVongLapGame);
    clearInterval(idTaoOng);
    chuTamDung.classList.remove('hidden'); // Hiện chữ "TẠM DỪNG"
}

// Tiếp tục game khi nhấn P lại
function tiepTucGame() {
    dangTamDung = false;
    chuTamDung.classList.add('hidden');
    thoiGianTruoc = performance.now();
    idVongLapGame = requestAnimationFrame(vongLapGame);
    idTaoOng = setInterval(taoOng, manChoi === 1 ? 1500 : 1200);
}

// Hàm vòng lặp chính của game, gọi liên tục 60 khung hình/s
function vongLapGame(thoiGianHienTai) {
    if (dangTamDung || daThua || daThang) return;
    
    if (!thoiGianHienTai) thoiGianHienTai = performance.now();
    let deltaTime = (thoiGianHienTai - thoiGianTruoc) / (1000 / 60);
    thoiGianTruoc = thoiGianHienTai;
    
    // Giới hạn deltaTime để tránh lỗi logic khi lag quá mức
    if (deltaTime > 3) deltaTime = 3;
    
    capNhatChim(deltaTime);     // Tính toán lại vị trí chim
    diChuyenOng(deltaTime);     // Tính toán lại vị trí ống
    
    // Nếu có va chạm xảy ra, gọi hàm Game Over và ngừng vòng lặp
    if (kiemTraVaCham()) {
        hienGameOver();
        return;
    }
    
    // Tiếp tục gọi hàm ở frame tiếp theo
    if (dangChoi && !daThua && !daThang && !dangTamDung) {
        idVongLapGame = requestAnimationFrame(vongLapGame);
    }
}

// Khởi chạy khi tài liệu HTML tải xong
window.onload = khoiTao;
