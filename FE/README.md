# Frontend — Giải cứu xưởng máy

React + TypeScript + Vite. Frontend gọi callable đúng payload/response trong `../docs/API_CONTRACT.md` và chỉ nghe `rooms/{roomCode}/public` trong Realtime Database.

## Cấu hình

1. Tạo `.env` từ `.env.example` và nhập cấu hình Firebase Web App cùng `VITE_ADMIN_EMAIL`.
2. Bật Firebase Anonymous Authentication cho Player và Email/Password cho Admin trong Firebase Console.
3. Không đặt mật khẩu Admin hay service-account key trong biến môi trường frontend. `VITE_ADMIN_EMAIL` là email cấu hình công khai, không phải bí mật.
4. Tài khoản Admin phải được cấp custom claim `admin: true` ở môi trường quản trị tin cậy. UI xác thực claim sau khi Firebase đăng nhập; callable vẫn là nơi quyết định quyền thực tế.

## Phát triển và build Hosting

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

Vite xuất build vào `../public/`, đúng thư mục Firebase Hosting đang khai báo tại `../firebase.json`. Từ thư mục gốc dự án, deploy bằng `firebase deploy --only functions,database,hosting`.

Admin tạo phòng bằng callable; frontend hiển thị mã và QR chứa URL Hosting với query `?room=XXXXXX`. Người chơi mở liên kết QR hoặc nhập mã thủ công. Username `admin` được ánh xạ sang `VITE_ADMIN_EMAIL`, đăng nhập Firebase Email/Password, rồi kiểm tra custom claim; frontend không so sánh mật khẩu.
