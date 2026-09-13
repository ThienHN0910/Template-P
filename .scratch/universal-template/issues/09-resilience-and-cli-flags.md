# 09: Resilience, Error Handling & Non-interactive Flags

**What to build:**
Đảm bảo CLI hoạt động bền bỉ, không crash trong mọi tình huống biên:
1. **Hỗ trợ CLI Flags (Non-interactive mode)**:
   - Cho phép chạy có tham số: `npx create-p-stack my-app --backend dotnet --frontend vue --db postgres --yes`
   - Nếu terminal không phải TTY (`!process.stdin.isTTY`) hoặc có flag `--yes`, tự động dùng giá trị mặc định mà không bị treo tiến trình.
2. **Graceful Cancellation**:
   - Khi người dùng nhấn Ctrl+C hoặc phím ESC ở bất kỳ bước nào, bắt sự kiện thoát êm đẹp (clean exit), xóa các file/thư mục tạm đang tạo dở nếu có, không in stack trace lỗi.
3. **Robust File Operations**:
   - Xử lý ghi đè an toàn: Nếu thư mục đích đã tồn tại và không rỗng, hỏi người dùng muốn ghi đè, xóa sạch hay hủy bỏ.
   - Chuẩn hóa đường dẫn tương thích cả Windows (backslashes `\`) và POSIX (forward slashes `/`).

**Blocked by:** 07-scaffolding-orchestrator

**Status:** resolved

- [x] CLI flags parse chính xác và bypass prompt khi truyền đủ tham số
- [x] Ctrl+C thoát êm ái
- [x] Xử lý path chuẩn trên Windows và Linux/macOS
