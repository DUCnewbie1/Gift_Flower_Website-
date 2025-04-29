# Gift_Flower_Website
# 📘 HƯỚNG DẪN QUY TRÌNH GIT FLOW CHO NHÓM PHÁT TRIỂN PHẦN MỀM

## 👥 Thành viên nhóm: 4 người

## 📌 Mục tiêu: Quản lý source code rõ ràng, tránh xung đột, dễ review, chuẩn release

---

## I. 🌿 CÁC LOẠI NHÁNH CHÍNH

| Nhánh | Mục đích |
| --- | --- |
| `main` | Chứa code đã release (production) |
| `develop` | Nhánh chính để phát triển, tích hợp các tính năng |
| `feature/*` | Tính năng mới, nhánh cá nhân cho mỗi dev |
| `bugfix/*` | Sửa lỗi nhỏ trong quá trình dev |
| `release/*` | Chuẩn bị phát hành |
| `hotfix/*` | Sửa lỗi khẩn cấp ở production |

---

## II. 🔁 QUY TRÌNH CHUNG CHO MỖI TÍNH NĂNG HOẶC SỬA LỖI

### Khi nào sử dụng?

- Khi bất kỳ thành viên nào muốn thêm tính năng mới hoặc sửa lỗi nhỏ.
- Tạo nhánh riêng để đảm bảo không ảnh hưởng người khác.

### 1. Tạo nhánh mới từ develop

```bash
git checkout develop
git pull origin develop
git checkout -b feature/ten-tinh-nang  # hoặc bugfix/ten-loi

```

### 2. Thực hiện code, rồi commit

```bash
git status                  # Kiểm tra thay đổi
git add .                   # Add tất cả file
git commit -m "feat: mô tả chức năng"  # Hoặc "fix: mô tả lỗi"

```

### 3. Push lên GitHub và tạo PR

```bash
git push -u origin feature/ten-tinh-nang

```

- Truy cập GitHub → mở Pull Request từ nhánh `feature/*` → `develop`
- Viết mô tả rõ ràng
- Chờ review hoặc merge nếu được phép

### 4. Sau khi merge → xóa nhánh cũ

```bash
git branch -d feature/ten-tinh-nang
git push origin --delete feature/ten-tinh-nang

```

---

## III. 🚀 QUY TRÌNH RELEASE

### Khi nào sử dụng?

- Khi các tính năng đã ổn định, chuẩn bị xuất bản bản phát hành chính thức.

### Các bước:

```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0

```

- Kiểm thử lần cuối, sửa nhẹ (nếu cần)
- Merge vào `main` và `develop`

```bash
git checkout main
git merge release/v1.0
git push origin main

git checkout develop
git merge release/v1.0
git push origin develop

```

- Tạo tag nếu cần:

```bash
git tag v1.0
git push origin v1.0

```

---

## IV. ⚠️ SỬA LỖI KHẨN CẤP (HOTFIX)

### Khi nào sử dụng?

- Lỗi phát sinh ở production (main), cần xử lý gấp.

### Các bước:

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-login

```

- Sửa lỗi, commit, push:

```bash
git add .
git commit -m "hotfix: sửa lỗi đăng nhập trên production"
git push -u origin hotfix/fix-login

```

- Merge về `main` và `develop`

```bash
git checkout main
git merge hotfix/fix-login
git push origin main

git checkout develop
git merge hotfix/fix-login
git push origin develop

```

---

## V. 🧨 CÁC TRƯỜNG HỢP XUNG ĐỘT

### ❌ Trường hợp 1: Xung đột khi pull

```bash
git pull origin develop
# Nếu bị conflict:
# Mở file bị lỗi, sửa thủ công, rồi:
git add file-da-sua.js
git commit -m "resolve: conflict login.js"

```

### ❌ Trường hợp 2: Push bị từ chối do có commit mới

```bash
git pull origin feature/ten-tinh-nang --rebase
git push

```

### ❌ Trường hợp 3: Cả hai dev cùng commit một tính năng

- Mỗi người làm nhánh riêng (feature/abc1, feature/abc2)
- Merge vào develop từng người một, theo thứ tự review.

### ❌ Trường hợp 4: Người thứ nhất commit trước, người thứ hai commit sau bị xung đột

```bash
git pull origin feature/login
# hoặc
git pull origin feature/login --rebase

# Sau đó:
git add file-da-sua.js
git commit -m "resolve: conflict với Dev A trong file login.js"
git push

```

---

## VI. 🔄 TRƯỜNG HỢP: DÙNG PHIÊN BẢN CŨ LÀM MỚI

### Khi nào sử dụng?

- Khi phiên bản mới có nhiều lỗi, muốn quay về phiên bản cũ đã ổn định để làm nhánh mới từ đó.

### Các bước:

```bash
git log --oneline
# hoặc
git tag

# Tạo nhánh mới từ commit hoặc tag:
git checkout -b feature/rebuild abc1234
# hoặc
git checkout -b feature/rebuild v1.0

```

---

## VII. ✍️ QUY ƯỚC COMMIT

| Type | Ý nghĩa |
| --- | --- |
| `feat` | Thêm chức năng mới |
| `fix` | Sửa lỗi |
| `docs` | Cập nhật tài liệu |
| `style` | Format code, không thay đổi logic |
| `refactor` | Tối ưu code |
| `test` | Thêm/sửa test |
| `chore` | Cấu hình, nâng cấp phụ |

**Ví dụ:**

```bash
feat(login): thêm chức năng đăng nhập bằng Google
fix(api): sửa lỗi token hết hạn

```

---

## VIII. ✅ LỜI KHUYÊN CHO NHÓM

- Luôn tạo nhánh riêng, không code trực tiếp trên `develop`
- Pull `develop` trước khi tạo nhánh mới
- Pull `develop` thường xuyên khi đang làm việc
- Commit rõ ràng, thường xuyên
- PR nhỏ, rõ, dễ review
- Luôn resolve xung đột cẩn thận, ưu tiên người commit trước
- Nếu cần rollback, hãy dùng commit ID hoặc tag làm mốc an toàn

---

> Áp dụng đúng Git Flow giúp nhóm phối hợp trơn tru, dễ review, rollback và release an toàn!
>
