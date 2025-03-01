// API URL dan API Key JSONBin
const jsonBinApiUrl = "https://api.jsonbin.io/v3/b/67c30dafad19ca34f814956b"; // Ganti dengan Bin ID yang benar
const jsonBinApiKey = "$2a$10$4IVrueRnTRtCL9ReuE76auMFdZvPf39mSB/tnFMSUu13ufsw6SP8u"; // Ganti dengan API Key JSONBin

// API Key IMGBB untuk upload gambar
const imgbbApiKey = "35cd7b4520a87c49333f50490f22b821";  // Ganti dengan API Key IMGBB kamu

// Mengambil data dari localStorage yang menunjukkan login
const loggedInUser = localStorage.getItem('loggedInUser');
if (!loggedInUser) {
    // Jika tidak ada data login, arahkan ke halaman login
    window.location.href = "login.html";
}

// Menangani pengiriman form pengajuan
document.getElementById('pengajuanForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const namaLengkap = document.getElementById('namaLengkap').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const fotoKTP = document.getElementById('fotoKTP').files[0];
    const fotoMemegangKTP = document.getElementById('fotoMemegangKTP').files[0];
    const fotoKKNPWP = document.getElementById('fotoKKNPWP').files[0];
    const alamat = document.getElementById('alamat').value;
    const pinjaman = document.getElementById('pinjaman').value;
    const waktuPinjaman = document.getElementById('waktuPinjaman').value;
    const rekening = document.getElementById('rekening').value;
    const penghasilan = document.getElementById('penghasilan').value;

    // Cek apakah semua input sudah diisi
    if (!namaLengkap || !whatsapp || !fotoKTP || !fotoMemegangKTP || !fotoKKNPWP || !alamat || !pinjaman || !waktuPinjaman || !rekening || !penghasilan) {
        alert('Mohon isi semua kolom yang diperlukan!');
        return;
    }

    // Fungsi untuk upload foto ke IMGBB dan mendapatkan URL gambar
    const uploadFoto = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.status !== 200) {
            throw new Error("Gagal mengupload gambar");
        }
        return data.data.url;  // Mengembalikan URL gambar dari IMGBB
    };

    try {
        // Upload foto-foto jika ada
        const fotoKTPUrl = fotoKTP ? await uploadFoto(fotoKTP) : null;
        const fotoMemegangKTPUrl = fotoMemegangKTP ? await uploadFoto(fotoMemegangKTP) : null;
        const fotoKKNPWPUrl = fotoKKNPWP ? await uploadFoto(fotoKKNPWP) : null;

        // Menyusun data pengajuan
        const formData = {
            namaLengkap: namaLengkap,
            whatsapp: whatsapp,
            fotoKTP: fotoKTPUrl,
            fotoMemegangKTP: fotoMemegangKTPUrl,
            fotoKKNPWP: fotoKKNPWPUrl,
            alamat: alamat,
            pinjaman: pinjaman,
            waktuPinjaman: waktuPinjaman,
            rekening: rekening,
            penghasilan: penghasilan
        };

        // Ambil data pengguna yang sudah ada
        const response = await fetch(jsonBinApiUrl, {
            method: 'GET',
            headers: {
                'X-Master-Key': jsonBinApiKey,  // API Key untuk autentikasi
            }
        });

        const data = await response.json();
        const users = data.record.users || [];

        // Temukan pengguna yang sedang login
        const user = users.find(u => u.username === loggedInUser);

        if (user) {
            // Tambahkan data pengajuan ke dalam array pengajuan pengguna
            user.pengajuan = user.pengajuan || [];  // Pastikan pengajuan sudah ada
            user.pengajuan.push(formData);  // Menambahkan data pengajuan yang baru

            // Kirim data pengguna yang telah diperbarui ke JSONBin
            const saveResponse = await fetch(jsonBinApiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': jsonBinApiKey,
                },
                body: JSON.stringify({
                    users: users
                })
            });

            if (saveResponse.ok) {
                alert("Pengajuan berhasil dikirim!");
                window.location.href = "pengajuan_sukses.html";  // Redirect ke halaman sukses
            } else {
                alert("Terjadi kesalahan saat mengirim pengajuan.");
            }
        } else {
            alert('Pengguna tidak ditemukan!');
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Gagal menghubungkan ke server atau mengupload gambar.");
    }
});
