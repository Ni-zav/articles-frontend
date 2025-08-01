Home Test Frontend Web Developer

Goal
Bangun aplikasi manajemen artikel dengan dua role: User dan Admin. Aplikasi harus memiliki autentikasi dan otorisasi, UI responsif sesuai desain, dan integrasi API pada base URL: https://test-fe.mysellerpintar.com/api. Kode harus terstruktur, mudah dibaca, dan mengikuti best practice.

Fitur & Halaman

1) User
a) Authentication
- Login dengan validasi form
- Register dengan validasi form
- Setelah login/register sukses, redirect ke halaman list artikel
- Logout dengan redirect ke halaman login

b) List Artikel
- Filter artikel berdasarkan kategori
- Searching artikel dengan debounce 300–500ms
- Pagination jika data > 9 item

c) Detail Artikel
- Tampilkan konten artikel lengkap
- Other articles: tampilkan maksimal 3 artikel dari kategori yang sama

2) Admin
a) Authentication
- Login dengan validasi form
- Register dengan validasi form
- Setelah login/register sukses, redirect ke halaman list artikel
- Logout dengan redirect ke halaman login

b) List Categories
- Searching category dengan debounce 300–500ms
- Pagination jika data > 10 items

c) Create Category
- Terapkan form validation

d) Edit Category
- Terapkan form validation

e) List Artikel
- Filter artikel berdasarkan kategori
- Searching artikel dengan debounce 300–500ms
- Pagination jika data > 10 item

f) Create Article
- Terapkan form validation
- Tampilkan preview sebelum submit (fetch API)

g) Edit Article
- Terapkan form validation
- Tampilkan preview sebelum submit (fetch API)

3) Teknologi
- Next.js (App Router, SSR & CSR)
- Tailwind CSS (+ shadcn/ui diutamakan)
- Axios untuk fetching API
- Lucide untuk icon
- Zod + React Hook Form untuk form validation
- Git & GitHub (implementasi Git flow)
Catatan: Diperbolehkan menambahkan teknologi lain jika diperlukan.

4) Catatan Implementasi
- Siapkan backup data dummy untuk antisipasi gangguan server API saat presentasi/interview
- Tambahkan method/logic untuk memanipulasi data jika API tidak mendukung fitur yang dibutuhkan
- Pastikan UI responsif di HP, Tablet, dan Desktop
- Tambahkan UI untuk loading state, success message, dan error message

5) Pengumpulan Task
- Deploy ke Vercel/Netlify dan lampirkan URL
- Push seluruh kode ke GitHub (public repository) dan lampirkan link
- Sertakan README sebagai dokumentasi proyek
- Kirim URL hosting dan link repository via WhatsApp