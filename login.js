// API URL dan API Key JSONBin
const apiUrl = "https://api.jsonbin.io/v3/b/67c30dafad19ca34f814956b"; // Ganti dengan Bin ID yang benar
const apiKey = "$2a$10$4IVrueRnTRtCL9ReuE76auMFdZvPf39mSB/tnFMSUu13ufsw6SP8u"; // Ganti dengan API Key kamu dari JSONBin

// Fungsi untuk beralih tab (Login / Daftar Akun)
const loginFormContainer = document.getElementById('loginFormContainer');
const registerFormContainer = document.getElementById('registerFormContainer');
const loginTabBtn = document.getElementById('loginTabBtn');
const registerTabBtn = document.getElementById('registerTabBtn');

// Set default tab ke Login
loginFormContainer.style.display = 'block';
registerFormContainer.style.display = 'none';

// Fungsi untuk menampilkan form login
loginTabBtn.addEventListener('click', function() {
    loginFormContainer.style.display = 'block';
    registerFormContainer.style.display = 'none';

    // Menandai tab yang aktif
    loginTabBtn.style.backgroundColor = '#ccc';
    registerTabBtn.style.backgroundColor = '#ddd';
});

// Fungsi untuk menampilkan form daftar akun
registerTabBtn.addEventListener('click', function() {
    registerFormContainer.style.display = 'block';
    loginFormContainer.style.display = 'none';

    // Menandai tab yang aktif
    registerTabBtn.style.backgroundColor = '#ccc';
    loginTabBtn.style.backgroundColor = '#ddd';
});

// Proses login (verifikasi username dan password)
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Ambil data pengguna dari JSONBin
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey,  // API Key untuk autentikasi
            }
        });

        const data = await response.json();
        const users = data.record.users || [];

        // Cek apakah username dan password sesuai dengan data di JSONBin
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            alert('Login berhasil!');
            localStorage.setItem('loggedInUser', username);  // Menyimpan informasi login di localStorage

            // Cek apakah pengguna sudah mengajukan pinjaman
            const pengajuan = user.pengajuan && user.pengajuan.length > 0;

            // Jika sudah mengajukan, arahkan ke dashboard
            if (pengajuan) {
                window.location.href = "dashboard.html";  // Arahkan ke halaman dashboard setelah login berhasil
            } else {
                // Jika belum mengajukan, arahkan ke halaman pengajuan
                window.location.href = "pengajuan.html";  // Arahkan ke halaman pengajuan
            }
        } else {
            alert('Username atau password salah!');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Gagal menghubungkan ke server.');
    }
});

// Proses pendaftaran (simpan data ke JSONBin)
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword === confirmPassword) {
        // Ambil data pengguna yang sudah ada
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'X-Master-Key': apiKey,  // API Key untuk autentikasi
                }
            });

            const data = await response.json();
            const users = data.record.users || [];

            // Cek apakah username sudah ada
            const existingUser = users.find(u => u.username === newUsername);
            if (existingUser) {
                alert('Username sudah digunakan!');
                return;
            }

            // Tambahkan pengguna baru
            const newUser = {
                username: newUsername,
                password: newPassword,
                pengajuan: []  // Tambahkan field pengajuan yang masih kosong
            };

            // Tambahkan data pengguna baru ke array users
            users.push(newUser);

            // Kirim data pengguna baru ke JSONBin tanpa menghapus data yang lama
            const saveResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey,  // Header untuk autentikasi
                },
                body: JSON.stringify({
                    users: users
                })
            });

            if (saveResponse.ok) {
                alert('Akun berhasil didaftarkan!');
                window.location.href = "login.html";  // Arahkan kembali ke halaman login
            } else {
                alert('Terjadi kesalahan saat mendaftar akun!');
            }
        } catch (error) {
            console.error("Error:", error);
            alert('Gagal menghubungkan ke server.');
        }
    } else {
        alert('Password tidak cocok!');
    }
});

// Menambahkan pengajuan pinjaman ke data pengguna
async function submitPengajuan(pengajuanData) {
    const username = localStorage.getItem('loggedInUser');
    if (!username) {
        alert('Silakan login terlebih dahulu!');
        window.location.href = 'login.html';  // Arahkan pengguna ke halaman login jika belum login
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-Master-Key': apiKey,  // API Key untuk autentikasi
            }
        });

        const data = await response.json();
        const users = data.record.users || [];

        // Temukan pengguna berdasarkan username
        const user = users.find(u => u.username === username);
        if (user) {
            // Tambahkan data pengajuan ke dalam array pengajuan
            user.pengajuan.push(pengajuanData);

            // Kirim data pengguna yang telah diperbarui ke JSONBin
            const saveResponse = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey,
                },
                body: JSON.stringify({
                    users: users
                })
            });

            if (saveResponse.ok) {
                alert('Pengajuan berhasil!');
                window.location.href = "dashboard.html";  // Arahkan ke halaman dashboard setelah pengajuan berhasil
            } else {
                alert('Terjadi kesalahan saat menyimpan pengajuan!');
            }
        } else {
            alert('Pengguna tidak ditemukan!');
        }
    } catch (error) {
        console.error("Error:", error);
        alert('Gagal menghubungkan ke server.');
    }
}
