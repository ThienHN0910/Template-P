# 03: Pre-flight Environment Inspector & OS Auto-Installer

**What to build:**
Module kiểm tra môi trường máy dev trước khi scaffold và hỗ trợ tự động cài đặt runtime cần thiết:
- Kiểm tra phiên bản `node`, `npm`, `dotnet`, `python` tùy theo backend đã chọn
- Nếu thiếu công cụ:
  - Thông báo rõ ràng công cụ đang thiếu kèm phiên bản đề xuất
  - Hỏi người dùng: *"Bạn có muốn tự động cài đặt qua package manager hệ thống không? [Y/n]"*
  - Nếu Yes:
    - Windows: chạy `winget install Microsoft.DotNet.SDK.8` (hoặc NodeJS LTS / Python3)
    - macOS: chạy `brew install ...`
    - Linux: thông báo lệnh `apt` hoặc chạy lệnh cài đặt
  - Nếu No hoặc tiến trình cài đặt gặp lỗi/thiếu quyền Admin: In ra đường link trang chủ chính thức để tải về và cho phép người dùng nhấn Enter sau khi đã cài xong để tiếp tục.

**Blocked by:** 02-cli-interactive-questionnaire

**Status:** resolved

- [x] Hàm kiểm tra sự tồn tại của command trong PATH (`hasCommand`, `getCommandVersion`)
- [x] Logic nhận diện OS (Windows, macOS, Linux)
- [x] Module installer kích hoạt lệnh package manager an toàn, không làm crash CLI
- [x] Fallback URL chính xác cho từng runtime (.NET 8, Node.js, Python)
