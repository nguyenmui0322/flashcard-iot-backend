# Flashcard IoT Backend

Backend API cho hệ thống Flashcard kết hợp với thiết bị IoT.

## Xác thực

Hệ thống hỗ trợ hai phương thức xác thực khác nhau:

### 1. Xác thực người dùng Web (Firebase Authentication)

- Frontend sử dụng Firebase Authentication để đăng nhập/đăng ký
- IdToken được gửi đến backend trong header Authorization
- Ví dụ:

```js
fetch("http://localhost:3000/api/word-groups", {
  headers: {
    Authorization: "Bearer IdToken",
  },
});
```

### 2. Xác thực thiết bị IoT (API Key)

- Các thiết bị IoT như ESP32 sử dụng API key để xác thực
- API key được gửi trong header x-api-key
- Ví dụ (Arduino/ESP32):

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://your-server.com/api/iot/flashcards");
http.addHeader("x-api-key", "IdToken");
int httpCode = http.GET();
String payload = http.getString();
http.end();
```

## API Endpoints

### API cho thiết bị IoT

- `GET /api/iot/flashcards` - Lấy danh sách flashcard định dạng cho thiết bị IoT
  - Yêu cầu: header `x-api-key`
  - Tham số query: `limit` (số lượng flashcard, mặc định 5)

### API cho người dùng Web

- `POST /api/auth/register` - Đăng ký tài khoản
