(function initializeTeknisiHubHelp(globalScope) {
  const helpAssetBase = "assets/help";
  const helpControlAssetBase = `${helpAssetBase}/controls`;

  const topics = {
    login_access: {
      eyebrow: "Mulai",
      title: "Login dan Akses",
      image: `${helpAssetBase}/login-access.png`,
      imageAlt: "Tampilan form login dan persetujuan akses TeknisiHub.",
      summary: "Gunakan halaman ini untuk masuk ke akun, menyimpan persetujuan, dan membuka dashboard kerja.",
      steps: [
        "Masukkan nomor akun sesuai format yang diminta, lalu minta kode login.",
        "Isi kode verifikasi yang diterima. Jika akun memakai password tambahan, isi pada langkah berikutnya.",
        "Centang persetujuan penggunaan dan izin membuka tab baru agar viewer file bisa berjalan normal.",
        "Setelah akses tersimpan, dashboard dan semua menu kerja akan terbuka."
      ],
      tips: [
        "Jika kode belum masuk, pastikan nomor benar dan tunggu beberapa saat sebelum mencoba lagi.",
        "Jika browser memblokir tab baru, izinkan pop-up untuk alamat TeknisiHub lokal."
      ]
    },
    dashboard_home: {
      eyebrow: "Dashboard",
      title: "Dashboard",
      image: `${helpAssetBase}/dashboard-home.png`,
      imageAlt: "Tampilan dashboard utama TeknisiHub.",
      summary: "Dashboard adalah halaman ringkasan untuk melihat status akun, status aplikasi pendukung, dan akses cepat ke menu kerja.",
      steps: [
        "Periksa status aplikasi pendukung di bagian atas halaman.",
        "Gunakan menu kiri untuk berpindah ke katalog, alat kerja, atau pengaturan.",
        "Gunakan Check update jika ingin memastikan aplikasi pendukung sudah versi terbaru.",
        "Gunakan Logout session saat pekerjaan selesai di komputer bersama."
      ],
      tips: [
        "Jika ada pesan update, selesaikan update dulu sebelum melanjutkan pekerjaan.",
        "Menu kiri selalu menjadi jalur tercepat untuk berpindah tool."
      ]
    },
    product: {
      eyebrow: "Produk",
      title: "Product",
      image: `${helpAssetBase}/product.png`,
      imageAlt: "Tampilan halaman produk TeknisiHub.",
      summary: "Halaman Product berisi daftar produk, layanan, atau paket akses yang tersedia untuk pengguna.",
      steps: [
        "Buka halaman Product dari menu kiri.",
        "Baca nama produk, keterangan, dan status akses yang tersedia.",
        "Pilih aksi yang sesuai jika ingin membuka detail atau melakukan aktivasi.",
        "Ikuti instruksi pada layar sampai proses selesai."
      ],
      tips: [
        "Pastikan akun sudah login sebelum membuka fitur yang membutuhkan akses.",
        "Jika tombol belum aktif, periksa kembali status aplikasi pendukung."
      ]
    },
    BIOS: {
      eyebrow: "Katalog",
      title: "Katalog BIOS",
      image: `${helpAssetBase}/catalog-bios.png`,
      imageAlt: "Tampilan katalog BIOS dengan kolom pencarian dan daftar file.",
      summary: "Katalog BIOS dipakai untuk mencari, membuka, mengunduh, dan mengelola arsip BIOS sesuai izin akun.",
      steps: [
        "Ketik model perangkat, kode board, atau kata kunci file pada kolom pencarian.",
        "Buka item yang cocok, lalu pilih aksi yang tersedia seperti download atau flash jika perangkat sudah siap.",
        "Untuk upload, isi Model Device dan Code Board dengan nama yang mudah dicari ulang.",
        "Gunakan Refresh Catalog jika daftar belum menampilkan data terbaru."
      ],
      tips: [
        "Gunakan kata kunci pendek terlebih dulu, misalnya seri model atau kode board.",
        "Cek kembali ukuran dan catatan file sebelum dipakai pada perangkat pelanggan."
      ]
    },
    Boardview: {
      eyebrow: "Katalog",
      title: "Katalog Boardview",
      image: `${helpAssetBase}/catalog-boardview.png`,
      imageAlt: "Tampilan katalog Boardview dan tombol viewer.",
      summary: "Katalog Boardview membantu mencari file panduan jalur dan komponen lalu membukanya ke viewer.",
      steps: [
        "Cari berdasarkan model, kode board, atau nama file.",
        "Klik item yang sesuai, lalu buka viewer jika file sudah tersedia.",
        "Jika arsip berisi beberapa file, pilih file board yang ingin dibuka.",
        "Gunakan viewer untuk mencari komponen, net, atau titik pengukuran."
      ],
      tips: [
        "Jika viewer tidak terbuka, izinkan tab baru di browser.",
        "Gunakan kode board sebagai kata kunci utama agar hasil lebih tepat."
      ]
    },
    Schematics: {
      eyebrow: "Katalog",
      title: "Schematics",
      image: `${helpAssetBase}/catalog-schematics.png`,
      imageAlt: "Tampilan katalog Schematics dan tombol buka dokumen.",
      summary: "Schematics dipakai untuk membuka dokumen skema sebagai referensi jalur, blok rangkaian, dan titik ukur.",
      steps: [
        "Cari dokumen dengan model perangkat atau kode board.",
        "Klik tombol buka dokumen pada item yang sesuai.",
        "Tunggu proses penyiapan file, lalu gunakan viewer yang terbuka.",
        "Gunakan pencarian di viewer untuk menemukan nama komponen atau jalur."
      ],
      tips: [
        "Pastikan nama board cocok dengan perangkat sebelum menjadikan skema sebagai acuan.",
        "Jika dokumen besar, proses penyiapan bisa membutuhkan waktu lebih lama."
      ]
    },
    ProblemSolving: {
      eyebrow: "Katalog",
      title: "Problem Solving",
      image: `${helpAssetBase}/catalog-problem-solving.png`,
      imageAlt: "Tampilan katalog Problem Solving.",
      summary: "Problem Solving berisi catatan kasus, langkah diagnosa, dan referensi perbaikan yang bisa dibaca langsung.",
      steps: [
        "Cari gejala kerusakan, seri perangkat, atau kata kunci kasus.",
        "Buka postingan yang paling mendekati kondisi perangkat.",
        "Baca urutan pemeriksaan dari awal sampai akhir.",
        "Cocokkan hasil ukur di meja kerja sebelum mengambil keputusan perbaikan."
      ],
      tips: [
        "Gunakan beberapa kata kunci berbeda jika hasil pertama belum cocok.",
        "Catatan kasus adalah panduan bantu, keputusan tetap mengikuti kondisi perangkat nyata."
      ]
    },
    Datasheets: {
      eyebrow: "Katalog",
      title: "Datasheets",
      image: `${helpAssetBase}/catalog-datasheets.png`,
      imageAlt: "Tampilan katalog Datasheets.",
      summary: "Datasheets membantu membuka lembar data komponen untuk melihat pin, fungsi, rating, dan informasi pengganti.",
      steps: [
        "Cari nomor komponen atau keluarga komponen.",
        "Buka dokumen yang sesuai dari daftar hasil.",
        "Periksa pin, tegangan kerja, fungsi kaki, dan batas aman komponen.",
        "Simpan atau buka ulang dokumen ketika diperlukan saat proses servis."
      ],
      tips: [
        "Cari dengan nomor komponen paling lengkap agar hasil lebih tepat.",
        "Jika ada beberapa varian, cocokkan package dan suffix komponen."
      ]
    },
    tool_spi_flash: {
      eyebrow: "Tools",
      title: "SPI Flash",
      image: `${helpAssetBase}/tool-spi-flash.png`,
      imageAlt: "Tampilan tool SPI Flash dengan panel koneksi, file, dan aksi chip.",
      summary: "Tool SPI Flash dipakai untuk membaca, menyimpan, memverifikasi, menghapus, menulis, dan menyiapkan file BIOS ke chip.",
      steps: [
        "Pilih koneksi device, lalu tunggu status tersambung.",
        "Pilih target chip secara otomatis atau manual sesuai kondisi di meja kerja.",
        "Gunakan Read untuk menyimpan backup sebelum menulis data baru.",
        "Gunakan Verify setelah Write untuk memastikan isi chip sesuai file.",
        "Perhatikan progress dan pesan status sebelum melepas koneksi."
      ],
      tips: [
        "Selalu buat backup sebelum erase atau write.",
        "Pastikan penjepit atau kabel tidak bergeser saat proses sedang berjalan.",
        "Jangan cabut device ketika progress masih aktif."
      ]
    },
    tool_oscilloscope: {
      eyebrow: "Tools",
      title: "Oscilloscope",
      image: `${helpAssetBase}/tool-oscilloscope.png`,
      imageAlt: "Tampilan Oscilloscope dengan waveform dan kontrol channel.",
      summary: "Oscilloscope dipakai untuk melihat sinyal DC atau sinyal level rendah dari waktu ke waktu, termasuk bentuk gelombang, frekuensi, duty, nilai puncak, rata-rata, dan perubahan level.",
      steps: [
        "Pilih koneksi yang tersedia, lalu aktifkan hanya channel yang benar-benar dipakai.",
        "Samakan pilihan Probe CH1 atau CH2 dengan switch fisik probe. Jika probe di posisi 10X, selector juga harus 10X.",
        "Hubungkan clip GND probe ke ground target dulu, baru sentuhkan ujung probe ke titik ukur.",
        "Klik Run untuk capture berulang atau Single untuk sekali ambil data.",
        "Pilih YT untuk bentuk sinyal normal, FFT untuk frekuensi dominan, XY untuk perbandingan dua channel, atau DROP untuk riwayat perubahan level.",
        "Gunakan Volts/Div, Position, Auto scale, dan Reset posisi untuk merapikan tampilan tanpa mengubah sinyal asli."
      ],
      tips: [
        "Jangan hubungkan probe langsung ke listrik PLN, stop kontak, charger tanpa isolasi, inverter, atau rangkaian tegangan tinggi.",
        "Ikuti label range probe: 1X untuk sinyal kecil sampai 3,3V, 10X untuk sinyal DC sampai 30V. Jangan melebihi label yang dipilih.",
        "OSC ini bukan alat ukur AC tegangan tinggi. Untuk sinyal audio kecil boleh diuji dari volume rendah, tetapi jangan ukur output speaker amplifier/daya langsung.",
        "CAL PAD hanya sumber sinyal referensi untuk pengecekan tampilan, bukan sumber daya untuk memberi makan rangkaian."
      ]
    },
    tool_me_analyzer: {
      eyebrow: "Tools",
      title: "ME Analyzer",
      image: `${helpAssetBase}/tool-me-analyzer.png`,
      imageAlt: "Tampilan ME Analyzer untuk membaca hasil analisa file.",
      summary: "ME Analyzer membantu membaca informasi penting dari file BIOS untuk proses pemeriksaan dan dokumentasi servis.",
      steps: [
        "Pilih file BIOS yang ingin dianalisa.",
        "Jalankan analisa dan tunggu hasil tampil.",
        "Baca ringkasan versi, status, dan catatan yang perlu dicek.",
        "Simpan hasil jika diperlukan untuk catatan servis."
      ],
      tips: [
        "Gunakan file backup asli sebagai bahan analisa awal.",
        "Jika hasil memberi warning, cek ulang file sumber dan kebutuhan perangkat."
      ]
    },
    tool_uefi: {
      eyebrow: "Tools",
      title: "UEFI Tools",
      image: `${helpAssetBase}/tool-uefi.png`,
      imageAlt: "Tampilan UEFI Tools untuk membaca struktur file.",
      summary: "UEFI Tools membantu membaca struktur file firmware dan menampilkan bagian penting untuk analisa manual.",
      steps: [
        "Pilih file yang ingin diperiksa.",
        "Jalankan analisa untuk membaca struktur file.",
        "Periksa hasil, warning, dan bagian yang perlu ditinjau manual.",
        "Gunakan hasil sebagai referensi sebelum melakukan patch atau perbaikan."
      ],
      tips: [
        "Jangan mengubah file kerja sebelum backup aman tersedia.",
        "Jika struktur terlihat tidak wajar, bandingkan dengan file referensi yang sehat."
      ]
    },
    tool_universal_dmi: {
      eyebrow: "Bios Patch",
      title: "Universal DMI",
      image: `${helpAssetBase}/tool-universal-dmi.png`,
      imageAlt: "Tampilan launcher Universal DMI.",
      summary: "Universal DMI membuka tool pendukung untuk pekerjaan data identitas perangkat sesuai kebutuhan servis.",
      steps: [
        "Buka menu Universal DMI.",
        "Klik tombol launch yang tersedia.",
        "Ikuti instruksi pada tool yang terbuka.",
        "Simpan hasil kerja dan verifikasi ulang sebelum dipakai."
      ],
      tips: [
        "Gunakan hanya pada perangkat yang memang membutuhkan perubahan data identitas.",
        "Catat nilai awal sebelum melakukan perubahan."
      ]
    },
    tool_bios_vendor_detect: {
      eyebrow: "Tools",
      title: "Deteksi Vendor BIOS",
      image: `${helpAssetBase}/tool-bios-vendor-detect.png`,
      imageAlt: "Tampilan deteksi vendor BIOS.",
      summary: "Deteksi Vendor BIOS membantu mengenali keluarga BIOS dari file sehingga teknisi bisa memilih alur kerja yang tepat.",
      steps: [
        "Pilih file BIOS yang ingin diperiksa.",
        "Jalankan deteksi.",
        "Baca kandidat hasil dan tingkat keyakinannya.",
        "Gunakan hasil sebagai arahan awal untuk tool patch atau unlock yang sesuai."
      ],
      tips: [
        "Hasil deteksi adalah bantuan awal, bukan pengganti verifikasi manual.",
        "Jika hasil rendah, gunakan file lain atau bandingkan dengan referensi perangkat."
      ]
    },
    tool_file_hash_compare: {
      eyebrow: "Tools",
      title: "Cek Hash File",
      image: `${helpAssetBase}/tool-file-hash-compare.png`,
      imageAlt: "Tampilan tool pembanding hash file.",
      summary: "Cek Hash File dipakai untuk membandingkan dua file dan memastikan apakah isinya identik.",
      steps: [
        "Pilih file pertama dan file kedua.",
        "Jalankan perbandingan.",
        "Baca hasil MD5 dan SHA-256 yang tampil.",
        "Gunakan status cocok atau berbeda sebagai dasar keputusan berikutnya."
      ],
      tips: [
        "Tool ini berguna untuk membandingkan backup sebelum dan sesudah proses.",
        "Jika hash berbeda, cek apakah memang ada perubahan yang diharapkan."
      ]
    },
    tool_resistor_calculator: {
      eyebrow: "Tools",
      title: "Resistor Kalkulator",
      image: `${helpAssetBase}/tool-resistor-calculator.png`,
      imageAlt: "Tampilan Resistor Kalkulator.",
      summary: "Resistor Kalkulator membantu membaca nilai resistor dari warna gelang atau menghitung nilai yang dibutuhkan.",
      steps: [
        "Pilih jumlah gelang sesuai resistor yang dibaca.",
        "Pilih warna setiap gelang secara berurutan.",
        "Baca nilai, toleransi, dan rentang hasil.",
        "Gunakan hasil sebagai pembanding dengan alat ukur."
      ],
      tips: [
        "Baca gelang dari sisi yang paling dekat ke ujung resistor.",
        "Jika warna meragukan, ukur langsung untuk konfirmasi."
      ]
    },
    tool_lenovo_dump_bios: {
      eyebrow: "Bios Patch",
      title: "Lenovo UEFI AutoPatcher",
      image: `${helpAssetBase}/tool-lenovo-bios-patch.png`,
      imageAlt: "Tampilan Lenovo UEFI AutoPatcher.",
      summary: "Lenovo UEFI AutoPatcher membantu menyiapkan file hasil patch untuk kebutuhan servis tertentu.",
      steps: [
        "Pilih file sumber yang akan diproses.",
        "Jalankan patch sesuai kebutuhan.",
        "Tunggu sampai file output siap.",
        "Download file hasil dan verifikasi sebelum digunakan."
      ],
      tips: [
        "Gunakan backup asli sebagai sumber awal.",
        "Cek hasil patch sebelum menulis ke perangkat."
      ]
    },
    tool_dell_8fc8: {
      eyebrow: "Bios Patch",
      title: "Dell 8FC8",
      image: `${helpAssetBase}/tool-dell-8fc8.png`,
      imageAlt: "Tampilan tool Dell 8FC8.",
      summary: "Dell 8FC8 membantu pekerjaan unlock tertentu pada file perangkat yang sesuai.",
      steps: [
        "Pilih file yang akan diproses.",
        "Jalankan proses sesuai tombol yang tersedia.",
        "Baca pesan hasil dan simpan output.",
        "Verifikasi output sebelum dipakai di perangkat."
      ],
      tips: [
        "Pastikan kasus perangkat memang sesuai dengan tool ini.",
        "Simpan file asli dan file hasil pada folder berbeda."
      ]
    },
    tool_ami_decryptor: {
      eyebrow: "Bios Patch",
      title: "AMI Decryptor & Unlocker",
      image: `${helpAssetBase}/tool-ami-decryptor.png`,
      imageAlt: "Tampilan AMI Decryptor dan Unlocker.",
      summary: "AMI Decryptor & Unlocker membantu proses unlock atau pembacaan file yang sesuai dengan alur kerja AMI.",
      steps: [
        "Pilih file sumber.",
        "Jalankan proses yang tersedia di halaman.",
        "Baca hasil dan pesan validasi.",
        "Simpan output dan cek ulang sebelum digunakan."
      ],
      tips: [
        "Pastikan file sumber tidak korup sebelum diproses.",
        "Jika hasil tidak sesuai, ulang dari backup asli."
      ]
    },
    tool_bios_memory_spd: {
      eyebrow: "Bios Patch",
      title: "BIOS Memory SPD Cleaner",
      image: `${helpAssetBase}/tool-bios-memory-spd.png`,
      imageAlt: "Tampilan BIOS Memory SPD Cleaner.",
      summary: "BIOS Memory SPD Cleaner membantu membersihkan data tertentu pada file BIOS sesuai kebutuhan servis.",
      steps: [
        "Pilih file BIOS sumber.",
        "Jalankan proses cleaner.",
        "Tunggu sampai output selesai dibuat.",
        "Download hasil dan lakukan verifikasi sebelum digunakan."
      ],
      tips: [
        "Selalu simpan backup file asli.",
        "Gunakan hanya jika gejala perangkat sesuai dengan kebutuhan cleaner."
      ]
    },
    tool_bios_password: {
      eyebrow: "Tools",
      title: "BIOS Unlock Password",
      image: `${helpAssetBase}/tool-bios-password.png`,
      imageAlt: "Tampilan BIOS Unlock Password.",
      summary: "BIOS Unlock Password membantu menghitung atau menampilkan kode bantu sesuai model dan tantangan yang diberikan perangkat.",
      steps: [
        "Pilih jenis perangkat atau pola yang sesuai.",
        "Masukkan kode tantangan dari layar perangkat.",
        "Klik proses untuk mendapatkan hasil.",
        "Coba hasil pada perangkat sesuai instruksi layar."
      ],
      tips: [
        "Masukkan karakter persis seperti yang tampil pada perangkat.",
        "Jika hasil gagal, cek lagi tipe perangkat dan kode tantangan."
      ]
    },
    tool_microscope: {
      eyebrow: "Tools",
      title: "Microscope",
      image: `${helpAssetBase}/tool-microscope.png`,
      imageAlt: "Tampilan Microscope.",
      summary: "Microscope membantu membuka tampilan kamera untuk inspeksi visual saat servis.",
      steps: [
        "Buka menu Microscope.",
        "Pilih sumber kamera jika diminta browser.",
        "Atur tampilan sesuai kebutuhan inspeksi.",
        "Gunakan hasil visual untuk membantu pengecekan komponen."
      ],
      tips: [
        "Pastikan izin kamera diberikan hanya untuk perangkat yang sedang dipakai.",
        "Gunakan pencahayaan yang stabil agar detail komponen lebih jelas."
      ]
    },
    tool_alien_server: {
      eyebrow: "Tools",
      title: "Alien Server",
      image: `${helpAssetBase}/tool-alien-server.png`,
      imageAlt: "Tampilan launcher Alien Server.",
      summary: "Alien Server menyediakan pintasan ke beberapa tool online pendukung pekerjaan unlock dan perbaikan file.",
      steps: [
        "Pilih modul yang sesuai dengan kasus perangkat.",
        "Buka modul dari daftar yang tersedia.",
        "Ikuti instruksi pada halaman modul.",
        "Simpan hasil kerja dan verifikasi sebelum digunakan."
      ],
      tips: [
        "Gunakan modul hanya untuk kasus yang sesuai.",
        "Jangan unggah file yang tidak diperlukan untuk pekerjaan."
      ]
    },
    tool_boardviewer: {
      eyebrow: "Tools",
      title: "Boardviewer",
      image: `${helpAssetBase}/tool-boardviewer.png`,
      imageAlt: "Tampilan Boardviewer.",
      summary: "Boardviewer membuka file board untuk melihat posisi komponen, net, dan jalur kerja servis.",
      steps: [
        "Pilih atau buka file board yang tersedia.",
        "Gunakan pencarian untuk menemukan komponen atau net.",
        "Klik komponen untuk melihat detail di panel samping.",
        "Gunakan zoom dan pan untuk menelusuri area board."
      ],
      tips: [
        "Cari dengan kode komponen lengkap, misalnya PU, PQ, PL, atau PR sesuai label board.",
        "Cocokkan posisi board dengan perangkat fisik sebelum mengukur."
      ]
    },
    settings: {
      eyebrow: "Pengaturan",
      title: "Pengaturan",
      image: `${helpAssetBase}/settings.png`,
      imageAlt: "Tampilan halaman pengaturan.",
      summary: "Pengaturan berisi opsi aplikasi, preferensi tampilan, dan beberapa kontrol pendukung.",
      steps: [
        "Buka Pengaturan dari menu kiri.",
        "Ubah opsi sesuai kebutuhan kerja.",
        "Simpan jika halaman meminta konfirmasi.",
        "Kembali ke menu kerja setelah pengaturan selesai."
      ],
      tips: [
        "Ubah hanya opsi yang dipahami agar workflow tetap stabil.",
        "Jika tampilan terasa tidak sesuai, kembali ke opsi default."
      ]
    }
  };

  const detailSections = {
    login_access: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Nomor akun: isi nomor yang terdaftar agar kode login dikirim ke akun yang benar.",
          "Minta kode login: meminta kode baru saat kolom nomor sudah benar.",
          "Kode verifikasi: isi kode yang diterima tanpa spasi tambahan.",
          "Password tambahan: hanya diisi jika akun memang meminta lapisan keamanan tambahan.",
          "Persetujuan akses: wajib dicentang agar pengguna memahami aturan pemakaian sebelum masuk.",
          "Izin tab baru: aktifkan jika viewer atau file perlu dibuka di halaman baru."
        ]
      },
      {
        title: "Jika gagal masuk",
        items: [
          "Cek kembali nomor akun dan kode yang dimasukkan.",
          "Tunggu beberapa saat sebelum meminta kode baru agar kode lama tidak tertukar.",
          "Jika browser memblokir halaman baru, izinkan pop-up untuk alamat aplikasi yang sedang dipakai."
        ]
      }
    ],
    dashboard_home: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Refresh status: mengecek ulang apakah aplikasi pendukung sudah siap.",
          "Check update: mengecek pembaruan sebelum pekerjaan dimulai.",
          "Logout session: keluar dari akun pada komputer yang sedang dipakai.",
          "Menu kiri: pindah ke dashboard, katalog, tool kerja, dan pengaturan.",
          "Tombol bantuan: membuka panduan sesuai halaman yang sedang aktif."
        ]
      },
      {
        title: "Kapan dipakai",
        items: [
          "Buka dashboard sebelum kerja untuk memastikan status akun dan aplikasi pendukung normal.",
          "Jika tool terasa tidak merespons, kembali ke dashboard lalu tekan Refresh status."
        ]
      }
    ],
    product: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Order: membuka kontak pemesanan sesuai area atau pilihan yang tersedia.",
          "Buka Tool: langsung pindah ke tool yang berhubungan dengan produk tersebut.",
          "Kartu produk: menampilkan nama paket, manfaat, status, dan informasi ringkas sebelum user memilih."
        ]
      },
      {
        title: "Catatan pemakaian",
        items: [
          "Pastikan akun sudah login sebelum membuka fitur yang membutuhkan akses.",
          "Gunakan informasi produk sebagai ringkasan awal; detail pemesanan tetap mengikuti arahan admin."
        ]
      }
    ],
    BIOS: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Kolom pencarian: cari berdasarkan model, kode board, nama file, atau kata kunci pendek.",
          "Refresh Catalog: memuat ulang daftar jika hasil belum terbaru.",
          "Download: menyimpan file katalog ke folder pilihan pengguna.",
          "Flash chip: mengirim file ke halaman SPI Flash saat alat dan file sudah siap.",
          "Upload: menambah file baru jika akun punya izin manajemen katalog.",
          "Edit dan Hapus: mengubah atau menghapus item katalog jika akun punya izin."
        ]
      },
      {
        title: "Batas aman",
        kind: "warning",
        items: [
          "Selalu backup isi chip asli sebelum menulis file baru.",
          "Cocokkan model, kode board, ukuran file, dan catatan item sebelum digunakan.",
          "Jangan memakai file hanya karena nama mirip. Board revision yang berbeda bisa membutuhkan file berbeda."
        ]
      }
    ],
    Boardview: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Kolom pencarian: cari model, kode board, atau nama file board.",
          "Open atau Buka viewer: membuka file ke viewer board.",
          "Download: menyimpan file jika perlu dipakai di luar aplikasi.",
          "Upload/Edit/Hapus: tersedia untuk akun yang punya izin manajemen katalog.",
          "Bagikan item: menyalin atau membuka tautan item jika tombol tersedia."
        ]
      },
      {
        title: "Cara membaca hasil",
        items: [
          "Cari kode komponen seperti PU, PQ, PL, PR, PC, atau nama net.",
          "Cocokkan orientasi board di viewer dengan board fisik sebelum mengukur.",
          "Gunakan boardview sebagai peta lokasi, lalu konfirmasi tetap dengan pengukuran nyata."
        ]
      }
    ],
    Schematics: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Kolom pencarian: cari model, kode board, IC utama, atau kata kunci blok rangkaian.",
          "View: membuka dokumen agar bisa dibaca di viewer.",
          "Download: menyimpan dokumen ke folder kerja.",
          "Open location: membuka lokasi file jika tersedia di perangkat kerja.",
          "Upload/Edit/Hapus: tersedia untuk akun yang punya izin manajemen katalog."
        ]
      },
      {
        title: "Cara pakai aman",
        items: [
          "Gunakan skema untuk memahami jalur, nama sinyal, urutan power, dan titik ukur.",
          "Jika skema tidak sama persis dengan board fisik, jadikan referensi awal saja.",
          "Jangan short atau inject tegangan hanya berdasarkan satu halaman skema tanpa cek jalur sekitar."
        ]
      }
    ],
    ProblemSolving: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Kolom pencarian: cari gejala, model, kode board, atau nama komponen.",
          "Baca postingan: membuka isi catatan kasus.",
          "Refresh Catalog: memuat ulang daftar catatan.",
          "Upload/Edit/Hapus: tersedia untuk akun yang punya izin manajemen katalog."
        ]
      },
      {
        title: "Cara mengambil keputusan",
        items: [
          "Samakan gejala, kondisi board, dan hasil ukur sebelum mengikuti solusi.",
          "Kerjakan langkah diagnosa dari yang paling aman: visual, resistansi, short, lalu tegangan.",
          "Catatan kasus membantu mempercepat arah, bukan pengganti analisa board nyata."
        ]
      }
    ],
    Datasheets: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Kolom pencarian: masukkan nomor komponen selengkap mungkin.",
          "View: membuka datasheet untuk dibaca langsung.",
          "Download: menyimpan file datasheet.",
          "Upload/Edit/Hapus: tersedia untuk akun yang punya izin manajemen katalog."
        ]
      },
      {
        title: "Yang wajib dicek",
        items: [
          "Pinout, package, tegangan kerja, rating arus, fungsi enable, dan thermal rating.",
          "Suffix komponen, marking, dan ukuran fisik sebelum memilih pengganti.",
          "Jika data tidak lengkap, cari pembanding lain sebelum memasang komponen."
        ]
      }
    ],
    tool_spi_flash: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih koneksi: memilih alat tulis baca yang akan dipakai.",
          "Start Address dan Length: menentukan area baca/tulis. Biarkan default untuk proses full chip.",
          "Source File/Pilih File: memilih file yang akan ditulis atau dibandingkan.",
          "Speed: mengatur kecepatan kerja. Turunkan speed jika koneksi tidak stabil.",
          "Chunk: ukuran paket proses. Biarkan default kecuali ada kebutuhan khusus.",
          "Read: membaca isi chip dan menampilkan preview.",
          "Verify: membandingkan isi chip dengan file atau hasil baca.",
          "Erase: mengosongkan chip sebelum penulisan.",
          "Write: menulis file ke chip.",
          "Save as BIN: menyimpan hasil baca sebagai backup."
        ]
      },
      {
        title: "Urutan kerja aman",
        kind: "warning",
        items: [
          "Baca dan simpan backup sebelum Erase atau Write.",
          "Pastikan penjepit, kabel, dan arah pin tidak bergeser selama proses.",
          "Jangan melepas chip, penjepit, kabel, atau power saat progress masih berjalan.",
          "Setelah Write, jalankan Verify sampai hasil cocok."
        ]
      }
    ],
    tool_oscilloscope: [
      {
        title: "Apa itu YT, FFT, XY, dan DROP",
        items: [
          "YT: tampilan utama oscilloscope. Sumbu horizontal adalah waktu, sumbu vertikal adalah tegangan. Pakai ini untuk melihat pulsa, clock rendah, enable, reset, atau perubahan level.",
          "FFT: tampilan frekuensi. Pakai untuk melihat frekuensi dominan dari sinyal periodik. Ini membantu membaca puncak frekuensi, bukan pengganti spectrum analyzer presisi.",
          "XY: CH1 menjadi sumbu X dan CH2 menjadi sumbu Y. Pakai untuk membandingkan dua sinyal. Mode ini butuh dua channel aktif; jika hanya satu probe, hasilnya terbatas.",
          "DROP: riwayat level dari waktu ke waktu. Pakai untuk melihat tegangan turun, naik, drop sesaat, atau perubahan lambat yang sulit dilihat di satu frame YT."
        ]
      },
      {
        title: "Tombol dan kontrol",
        items: [
          "Show CH1/CH2: menampilkan atau menyembunyikan channel. Channel yang dimatikan tidak ikut dianalisa.",
          "Probe CH1/CH2: samakan dengan switch fisik probe. Salah pilih probe membuat angka tegangan salah.",
          "Actual V CH1/CH2: isi nilai tegangan terukur dari alat ukur referensi untuk koreksi pembacaan channel.",
          "Volts/Div: mengatur skala vertikal. Auto membiarkan aplikasi mencari skala yang nyaman.",
          "Auto scale: mengembalikan channel ke skala otomatis.",
          "Position: menggeser waveform ke atas atau bawah agar tidak saling menutup.",
          "Reset posisi: mengembalikan trace channel ke tengah.",
          "Run: capture berulang sampai ditekan Stop.",
          "Single: capture satu kali, cocok untuk mengambil snapshot.",
          "Record: menyimpan rangkaian capture saat Run berjalan.",
          "CAL PAD Mode: memilih bentuk sinyal referensi seperti DC Low, DC High, square, duty, pulse, step, atau PWM.",
          "CAL PAD Off/On: menyalakan atau mematikan sinyal referensi.",
          "Sin(x)/x interpolation: menghaluskan tampilan garis. Matikan jika ingin melihat titik sampel lebih apa adanya.",
          "Reset DROP: menghapus riwayat DROP tanpa menghentikan mode lain.",
          "Sample Rate: jumlah sampel per detik. Semakin tinggi, detail sinyal cepat makin terlihat.",
          "Record Length: jumlah titik dalam satu capture. Semakin panjang, rentang waktu yang terlihat makin lebar.",
          "Trigger Edge: memilih penguncian pada tepi naik atau tepi turun.",
          "Pre-trigger: menentukan berapa banyak data sebelum titik trigger yang tetap ditampilkan.",
          "Level: mengatur ambang trigger agar waveform lebih stabil."
        ]
      },
      {
        title: "Batas aman wajib",
        kind: "warning",
        items: [
          "Jangan colok ke listrik PLN, stop kontak, jalur AC tegangan tinggi, inverter, atau charger tanpa isolasi.",
          "Jangan ukur tegangan di atas range probe yang dipilih. 1X hanya untuk sinyal kecil sampai 3,3V; 10X hanya sampai 30V DC.",
          "Ground probe harus ke ground target. Ground yang salah bisa membuat short dan merusak board.",
          "Jangan memakai CAL PAD untuk memberi daya rangkaian. CAL PAD hanya untuk referensi sinyal.",
          "Jika sinyal tidak diketahui levelnya, ukur dulu dengan multimeter dan mulai dari probe 10X."
        ]
      },
      {
        title: "Membaca angka di atas grafik",
        items: [
          "VPP: selisih tegangan tertinggi dan terendah dalam frame.",
          "RMS: nilai efektif sinyal, berguna untuk sinyal yang berubah-ubah.",
          "AVG: rata-rata tegangan pada frame.",
          "LOW: level terendah yang terbaca.",
          "FREQ dan PERIOD: frekuensi dan periode sinyal periodik jika pola cukup jelas.",
          "DUTY: persentase waktu sinyal berada di level high.",
          "TRIG: status trigger dan level ambang yang dipakai.",
          "CH: jumlah channel yang aktif pada capture."
        ]
      },
      {
        title: "Kapan pakai CAL PAD",
        items: [
          "DC Low: mengecek garis low atau baseline.",
          "DC High: mengecek pembacaan high stabil.",
          "Square 10 Hz sampai 10 kHz: mengecek bentuk kotak dan pembacaan frekuensi.",
          "Duty 10% sampai 90%: mengecek pembacaan duty dan pulsa sempit.",
          "Pulse 100 Hz: mengecek apakah pulsa pendek masih terlihat.",
          "Step 10 Hz-10 kHz: mengecek respons tampilan saat frekuensi berubah.",
          "PWM 20 kHz: mengecek tampilan sinyal cepat di batas kerja praktis."
        ]
      }
    ],
    tool_me_analyzer: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file BIOS yang akan dianalisa.",
          "Analyze/Run: menjalankan analisa file.",
          "Panel hasil: menampilkan versi, status, warning, dan catatan penting.",
          "Salin atau simpan hasil: gunakan jika tersedia untuk dokumentasi pekerjaan."
        ]
      },
      {
        title: "Cara membaca aman",
        items: [
          "Gunakan file backup asli sebagai bahan analisa awal.",
          "Warning berarti perlu dicek manual, bukan otomatis file rusak.",
          "Cocokkan hasil analisa dengan kebutuhan perangkat sebelum melakukan patch."
        ]
      }
    ],
    tool_uefi: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file yang ingin dibaca strukturnya.",
          "Analyze: menjalankan pembacaan struktur file.",
          "Find: membuka pencarian di report.",
          "Prev/Next: berpindah antar hasil pencarian.",
          "Full Screen: memperbesar report agar lebih mudah dibaca.",
          "Panel warning: menampilkan bagian yang perlu dicek manual."
        ]
      },
      {
        title: "Batas pemakaian",
        items: [
          "Tool ini untuk membaca dan membantu analisa struktur, bukan jaminan file siap tulis.",
          "Simpan file asli sebelum patch atau modifikasi.",
          "Jika banyak warning, bandingkan dengan file referensi yang sehat."
        ]
      }
    ],
    tool_universal_dmi: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Brand: memilih keluarga perangkat yang sesuai.",
          "Official File: memilih file referensi resmi.",
          "Dump File: memilih file hasil backup dari perangkat.",
          "Read official: membaca data dari file referensi.",
          "Read dump: membaca data dari file backup.",
          "DMI Fields: area isi data identitas yang akan diproses.",
          "Patch: membuat output berdasarkan input dan field yang sudah dicek.",
          "Download ZIP: menyimpan hasil output."
        ]
      },
      {
        title: "Batas aman",
        kind: "warning",
        items: [
          "Catat nilai awal sebelum mengubah data identitas perangkat.",
          "Jangan patch jika file referensi dan file backup tidak sesuai keluarga perangkat.",
          "Verifikasi output sebelum dipakai pada perangkat pelanggan."
        ]
      }
    ],
    tool_bios_vendor_detect: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file BIOS yang akan dikenali.",
          "Detect: menjalankan deteksi keluarga BIOS.",
          "Ringkasan: menampilkan kandidat utama dan skor keyakinan.",
          "Candidates: menampilkan kemungkinan lain jika hasil utama belum meyakinkan.",
          "Metadata: membantu membaca informasi tambahan dari file."
        ]
      },
      {
        title: "Cara mengambil keputusan",
        items: [
          "Skor tinggi membantu memilih alur kerja, tetapi tetap perlu verifikasi manual.",
          "Jika kandidat bertabrakan, cek model perangkat, ukuran file, dan struktur file.",
          "Gunakan hasil deteksi sebagai arahan awal sebelum memilih tool patch."
        ]
      }
    ],
    tool_file_hash_compare: [
      {
        title: "Tombol dan kontrol",
        items: [
          "File pertama: pilih file pembanding utama.",
          "File kedua: pilih file yang ingin dibandingkan.",
          "Compare: menghitung nilai hash kedua file.",
          "Hasil cocok: isi file sama persis.",
          "Hasil berbeda: ada perubahan isi walau nama file bisa mirip."
        ]
      },
      {
        title: "Kapan dipakai",
        items: [
          "Membandingkan backup sebelum dan sesudah proses.",
          "Memastikan file download tidak berubah.",
          "Membuktikan dua file benar-benar identik sebelum ditulis ke chip."
        ]
      }
    ],
    tool_resistor_calculator: [
      {
        title: "Tombol dan kontrol",
        items: [
          "4/5/6 band: pilih jumlah gelang sesuai resistor fisik.",
          "Chip warna: pilih warna gelang dari kiri ke kanan.",
          "SMD Decoder: masukkan kode resistor SMD seperti 103, 4701, atau 4R7.",
          "Contoh kode: mengisi input SMD dengan contoh cepat.",
          "Kombinasi Resistor: isi beberapa nilai untuk menghitung seri dan paralel."
        ]
      },
      {
        title: "Catatan penting",
        items: [
          "Jika warna gelang meragukan, ukur langsung dengan multimeter.",
          "Cek toleransi agar hasil pengganti tidak terlalu jauh.",
          "Untuk resistor di board, lepas salah satu kaki jika pembacaan dipengaruhi rangkaian sekitar."
        ]
      }
    ],
    tool_lenovo_dump_bios: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file sumber yang akan diproses.",
          "Patch/Process: menjalankan proses sesuai modul.",
          "Panel hasil: menampilkan status proses dan catatan validasi.",
          "Download: menyimpan file output jika proses berhasil."
        ]
      },
      {
        title: "Batas aman",
        kind: "warning",
        items: [
          "Gunakan backup asli sebagai sumber awal.",
          "Jangan menulis output sebelum ukuran dan struktur file dicek.",
          "Simpan file asli dan file hasil di folder berbeda agar tidak tertukar."
        ]
      }
    ],
    tool_dell_8fc8: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file perangkat yang sesuai kasus.",
          "Patch/Process: menjalankan proses unlock sesuai modul.",
          "Status hasil: membaca apakah proses berhasil atau perlu dicek ulang.",
          "Download: menyimpan file hasil jika tersedia."
        ]
      },
      {
        title: "Catatan penting",
        items: [
          "Gunakan hanya untuk kasus yang memang sesuai dengan modul ini.",
          "Backup asli wajib aman sebelum output dipakai.",
          "Jika proses gagal, ulang dari file asli dan jangan pakai output setengah jadi."
        ]
      }
    ],
    tool_ami_decryptor: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file sumber.",
          "Run/Unlock: menjalankan pencarian dan proses unlock.",
          "Download BIN unlock: menyimpan file hasil unlock jika tersedia.",
          "Download decrypt txt: menyimpan hasil pembacaan teks jika tersedia.",
          "Panel hasil: membaca kandidat, status, dan catatan proses."
        ]
      },
      {
        title: "Batas aman",
        kind: "warning",
        items: [
          "Pastikan file sumber tidak korup sebelum diproses.",
          "Jangan menulis file hasil tanpa verifikasi ukuran dan struktur.",
          "Jika kandidat tidak meyakinkan, cek ulang dari backup asli."
        ]
      }
    ],
    tool_bios_memory_spd: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file BIOS sumber.",
          "Analyze: mencari blok data yang bisa diperiksa.",
          "Clear selection: menghapus pilihan blok yang sedang dipilih.",
          "Export: menyimpan salinan blok terpilih untuk dokumentasi.",
          "Clean: membuat file hasil pembersihan sesuai pilihan.",
          "Download export/clean: menyimpan output yang sudah siap."
        ]
      },
      {
        title: "Batas aman",
        kind: "warning",
        items: [
          "Jangan clean tanpa memahami gejala perangkat.",
          "Simpan backup asli dan hasil export sebelum membuat output clean.",
          "Verifikasi file hasil sebelum dipakai pada perangkat."
        ]
      }
    ],
    tool_bios_password: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Kode lock: isi kode tantangan persis seperti tampil di perangkat.",
          "Generate password: menghitung kode bantu dari input.",
          "Salin kode: menyalin hasil agar mudah dicoba.",
          "Contoh kode: mengisi input dengan contoh pola yang tersedia.",
          "Catalog: daftar pola yang bisa dikenali oleh tool."
        ]
      },
      {
        title: "Catatan penting",
        items: [
          "Masukkan karakter persis, termasuk tanda hubung jika ada.",
          "Jika hasil gagal, cek lagi tipe perangkat dan format kode.",
          "Gunakan tool ini hanya pada perangkat yang memang menjadi tanggung jawab pekerjaan."
        ]
      }
    ],
    tool_microscope: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Scan kamera: mencari kamera yang tersedia.",
          "Pilih kamera: memilih sumber gambar.",
          "Start: mulai preview kamera.",
          "Stop: menghentikan preview.",
          "Zoom out/in: mengecilkan atau membesarkan tampilan.",
          "Reset zoom: mengembalikan pembesaran ke default.",
          "Fullscreen: memperbesar area preview ke layar penuh."
        ]
      },
      {
        title: "Tips inspeksi",
        items: [
          "Gunakan cahaya stabil agar solder retak, korosi, atau komponen pecah lebih terlihat.",
          "Jangan menyentuh board bertegangan dengan tangan saat inspeksi.",
          "Foto atau catat area bermasalah sebelum membersihkan board."
        ]
      }
    ],
    tool_alien_server: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Daftar modul: pilih modul sesuai kasus perangkat.",
          "Open/Buka: membuka modul yang dipilih.",
          "Panel status: membaca apakah halaman modul siap digunakan."
        ]
      },
      {
        title: "Catatan penggunaan",
        items: [
          "Gunakan modul hanya untuk kasus yang sesuai.",
          "Jangan unggah file yang tidak diperlukan untuk pekerjaan.",
          "Simpan hasil output dan verifikasi sebelum digunakan."
        ]
      }
    ],
    tool_boardviewer: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Pilih file: memilih file board yang akan dibuka.",
          "Buka Boardview TeknisiHub: membuka viewer utama jika file didukung.",
          "Open Boardviewer: membuka file melalui viewer yang tersedia.",
          "Panel format: menampilkan jenis file yang bisa dibuka.",
          "Session info: menampilkan status file yang terakhir dibuka."
        ]
      },
      {
        title: "Cara pakai",
        items: [
          "Cari komponen atau net dari kolom pencarian viewer.",
          "Gunakan zoom dan pan untuk mengikuti jalur area board.",
          "Cocokkan posisi top/bottom dengan board fisik sebelum mengukur."
        ]
      }
    ],
    settings: [
      {
        title: "Tombol dan kontrol",
        items: [
          "Toggle pengaturan: menyalakan atau mematikan opsi tampilan dan perilaku aplikasi.",
          "Simpan/Apply: menyimpan perubahan jika tombol tersedia.",
          "Reset/default: mengembalikan opsi ke nilai bawaan jika tersedia.",
          "Kontrol status: membantu mengecek kesiapan aplikasi pendukung."
        ]
      },
      {
        title: "Catatan aman",
        items: [
          "Ubah hanya opsi yang dipahami.",
          "Jika tampilan atau workflow terasa aneh setelah perubahan, kembalikan ke default.",
          "Pengaturan tersimpan di perangkat yang sedang dipakai, jadi komputer berbeda bisa punya preferensi berbeda."
        ]
      }
    ]
  };

  Object.entries(detailSections).forEach(([topicKey, sections]) => {
    if (topics[topicKey]) {
      topics[topicKey].sections = sections;
    }
  });

  const controlGuides = {
    login_access: [
      {
        title: "Nomor akun dan ingat nomor",
        description: "Isi nomor akun dengan format yang diminta. Centang ingat nomor hanya di perangkat pribadi.",
        image: `${helpControlAssetBase}/login-input.png`
      },
      {
        title: "Minta kode login",
        description: "Meminta kode verifikasi baru setelah nomor akun benar. Tunggu beberapa saat sebelum meminta ulang.",
        image: `${helpControlAssetBase}/login-request.png`
      }
    ],
    dashboard_home: [
      {
        title: "Status aplikasi dan akun",
        description: "Area ini memberi tahu apakah aplikasi pendukung siap, versi yang dipakai, dan status akun.",
        image: `${helpControlAssetBase}/dashboard-status.png`
      },
      {
        title: "Navigasi menu kiri",
        description: "Gunakan daftar menu untuk pindah halaman kerja. Menu aktif menunjukkan posisi pengguna sekarang.",
        image: `${helpControlAssetBase}/dashboard-menu.png`
      }
    ],
    product: [
      {
        title: "Order dan Buka Tool",
        description: "Order membuka kontak pemesanan, sedangkan Buka Tool langsung masuk ke alat kerja yang berhubungan.",
        image: `${helpControlAssetBase}/product-actions.png`
      }
    ],
    BIOS: [
      {
        title: "Search dan Refresh",
        description: "Search mencari file dari kata kunci; Refresh memuat ulang daftar jika hasil belum terbaru.",
        image: `${helpControlAssetBase}/catalog-search-refresh.png`
      },
      {
        title: "Download, pilih koneksi, Flash, dan Share",
        description: "Download menyimpan file, pilih koneksi menyiapkan alat, Flash membawa file ke proses tulis, Share membagikan item.",
        image: `${helpControlAssetBase}/catalog-bios-actions.png`
      }
    ],
    Boardview: [
      {
        title: "Search dan Refresh",
        description: "Cari file berdasarkan model atau kode board. Refresh dipakai jika daftar perlu dimuat ulang.",
        image: `${helpControlAssetBase}/catalog-search-refresh.png`
      },
      {
        title: "Open, Download, dan Share",
        description: "Open membuka viewer, Download menyimpan file, dan Share membagikan item katalog.",
        image: `${helpControlAssetBase}/catalog-document-actions.png`
      }
    ],
    Schematics: [
      {
        title: "Search dan Refresh",
        description: "Cari dokumen dari model, kode board, atau nama file. Refresh memuat ulang daftar dokumen.",
        image: `${helpControlAssetBase}/catalog-search-refresh.png`
      },
      {
        title: "Lihat, Buka Lokasi File, Unduh PDF, dan Share",
        description: "Lihat membuka dokumen, Buka Lokasi File membuka folder kerja, Unduh PDF menyimpan file, Share membagikan item.",
        image: `${helpControlAssetBase}/catalog-document-actions.png`
      }
    ],
    ProblemSolving: [
      {
        title: "Search dan Refresh",
        description: "Cari catatan dari gejala, model, atau kata kunci kasus. Refresh memuat ulang daftar catatan.",
        image: `${helpControlAssetBase}/catalog-search-refresh.png`
      },
      {
        title: "Lihat dan Share",
        description: "Lihat membuka isi catatan kasus. Share membagikan item agar mudah dirujuk kembali.",
        image: `${helpControlAssetBase}/catalog-post-actions.png`
      }
    ],
    Datasheets: [
      {
        title: "Search dan Refresh",
        description: "Cari dokumen dari nomor komponen. Refresh memuat ulang daftar jika hasil belum muncul.",
        image: `${helpControlAssetBase}/catalog-search-refresh.png`
      },
      {
        title: "View, Download, dan Share",
        description: "View membuka datasheet, Download menyimpan file, dan Share membagikan item katalog.",
        image: `${helpControlAssetBase}/catalog-document-actions.png`
      }
    ],
    tool_spi_flash: [
      {
        title: "Pilih koneksi",
        description: "Memilih alat yang akan dipakai. Tunggu status siap sebelum menjalankan Read, Write, Verify, atau Erase.",
        image: `${helpControlAssetBase}/spi-device-picker.png`
      },
      {
        title: "Chips Monitor dan Detek pin",
        description: "Melihat kondisi pin dan membantu memastikan koneksi tidak salah sebelum proses penting.",
        image: `${helpControlAssetBase}/spi-pin-monitor.png`
      },
      {
        title: "Start, Length, Source File, Chunk, dan Speed",
        description: "Area ini menentukan area kerja, file sumber, ukuran paket, dan kecepatan. Biarkan default jika tidak ada kebutuhan khusus.",
        image: `${helpControlAssetBase}/spi-file-fields.png`
      },
      {
        title: "Auto proses, Read, Write, Verify, Erase, dan deteksi",
        description: "Auto proses menyusun urutan aman. Read untuk backup, Write untuk menulis, Verify untuk cek, Erase untuk hapus, deteksi untuk membaca target.",
        image: `${helpControlAssetBase}/spi-action-pad.png`
      },
      {
        title: "Hex Preview dan Save as BIN",
        description: "Menampilkan hasil baca dan tombol penyimpanan backup jika buffer sudah tersedia.",
        image: `${helpControlAssetBase}/spi-hex-preview.png`
      }
    ],
    tool_oscilloscope: [
      {
        title: "Pilih koneksi",
        description: "Memilih koneksi OSC. Pastikan status siap sebelum Run atau Single.",
        image: `${helpControlAssetBase}/osc-device-picker.png`
      },
      {
        title: "Readout angka",
        description: "Menampilkan VPP, RMS, AVG, LOW, frekuensi, duty, trigger, mode, dan jumlah channel aktif.",
        image: `${helpControlAssetBase}/osc-readout.png`
      },
      {
        title: "Show, Probe, Actual V, Volts/Div, Auto scale, Position",
        description: "Area channel untuk menampilkan channel, memilih probe, koreksi tegangan, skala vertikal, dan posisi trace.",
        image: `${helpControlAssetBase}/osc-channel-controls.png`
      },
      {
        title: "Run, Single, Record, CAL PAD Mode, CAL PAD On/Off",
        description: "Run capture berulang, Single sekali capture, Record menyimpan frame, CAL PAD memberi sinyal referensi.",
        image: `${helpControlAssetBase}/osc-acquire.png`
      },
      {
        title: "YT, FFT, XY, DROP, SINC, Reset DROP",
        description: "YT untuk gelombang waktu, FFT untuk frekuensi, XY untuk perbandingan channel, DROP untuk riwayat perubahan level.",
        image: `${helpControlAssetBase}/osc-display.png`
      },
      {
        title: "Sample Rate, Record Length, Edge, Pre-trigger, Level",
        description: "Mengatur detail capture dan trigger. Gunakan default dulu, lalu ubah jika waveform sulit stabil.",
        image: `${helpControlAssetBase}/osc-timebase-trigger.png`
      }
    ],
    tool_me_analyzer: [
      {
        title: "Pilih file dan Analyze",
        description: "Pilih file backup, lalu jalankan analisa untuk membaca ringkasan, status, dan catatan.",
        image: `${helpControlAssetBase}/tool-me-analyzer-actions.png`
      }
    ],
    tool_uefi: [
      {
        title: "Analyze, Find, Prev, Next, dan Full Screen",
        description: "Analyze membaca struktur file, Find mencari teks di report, Prev/Next berpindah hasil, Full Screen memperbesar report.",
        image: `${helpControlAssetBase}/tool-uefi-actions.png`
      }
    ],
    tool_universal_dmi: [
      {
        title: "Brand, file referensi, file backup, Read, Patch, Download",
        description: "Pilih brand dan dua file kerja, baca datanya, cek field, jalankan Patch, lalu simpan output.",
        image: `${helpControlAssetBase}/tool-universal-dmi-actions.png`
      }
    ],
    tool_bios_vendor_detect: [
      {
        title: "Pilih file dan Detect",
        description: "Pilih file, jalankan Detect, lalu baca kandidat dan skor sebagai arahan awal.",
        image: `${helpControlAssetBase}/tool-bios-vendor-actions.png`
      }
    ],
    tool_file_hash_compare: [
      {
        title: "File pertama, file kedua, dan Compare",
        description: "Pilih dua file lalu bandingkan. Hasil cocok berarti isi file sama persis.",
        image: `${helpControlAssetBase}/tool-file-hash-actions.png`
      }
    ],
    tool_resistor_calculator: [
      {
        title: "Jumlah band, warna, SMD, contoh, seri, paralel",
        description: "Pilih jumlah gelang, warna, atau masukkan kode SMD. Kombinasi menghitung seri dan paralel.",
        image: `${helpControlAssetBase}/tool-resistor-actions.png`
      }
    ],
    tool_lenovo_dump_bios: [
      {
        title: "Pilih file, proses, dan Download",
        description: "Pilih file sumber, jalankan proses, baca status, lalu simpan output jika berhasil.",
        image: `${helpControlAssetBase}/tool-lenovo-patch-actions.png`
      }
    ],
    tool_dell_8fc8: [
      {
        title: "Pilih file, proses, dan Download",
        description: "Pakai hanya untuk kasus yang sesuai. Simpan output setelah proses valid.",
        image: `${helpControlAssetBase}/tool-dell-actions.png`
      }
    ],
    tool_ami_decryptor: [
      {
        title: "Run, Download BIN, Download TXT",
        description: "Run memproses file, tombol download menyimpan output yang tersedia setelah proses selesai.",
        image: `${helpControlAssetBase}/tool-ami-actions.png`
      }
    ],
    tool_bios_memory_spd: [
      {
        title: "Analyze, Clear selection, Export, Clean, Download",
        description: "Analyze mencari data, Export menyimpan salinan, Clean membuat output, Download menyimpan hasil.",
        image: `${helpControlAssetBase}/tool-spd-actions.png`
      }
    ],
    tool_bios_password: [
      {
        title: "Kode lock, Generate password, Salin kode, dan contoh",
        description: "Isi kode persis dari layar perangkat, Generate menghitung hasil, Salin kode menyalin output.",
        image: `${helpControlAssetBase}/tool-bios-password-actions.png`
      }
    ],
    tool_microscope: [
      {
        title: "Scan, Start, Stop, Zoom, Reset, Fullscreen",
        description: "Scan mencari kamera, Start/Stop mengatur preview, Zoom dan Fullscreen membantu inspeksi visual.",
        image: `${helpControlAssetBase}/tool-microscope-actions.png`
      }
    ],
    tool_alien_server: [
      {
        title: "Pilih modul dan buka tool",
        description: "Pilih modul sesuai kasus, buka, lalu ikuti instruksi di modul tersebut.",
        image: `${helpControlAssetBase}/tool-alien-actions.png`
      }
    ],
    tool_boardviewer: [
      {
        title: "Pilih file dan buka viewer",
        description: "Pilih file board, lalu buka viewer. Gunakan pencarian di viewer untuk mencari komponen atau net.",
        image: `${helpControlAssetBase}/tool-boardviewer-actions.png`
      }
    ],
    settings: [
      {
        title: "Toggle, simpan, dan reset pengaturan",
        description: "Ubah opsi yang dipahami, simpan bila diminta, dan reset jika tampilan atau alur kerja terasa tidak sesuai.",
        image: `${helpControlAssetBase}/settings-actions.png`
      }
    ]
  };

  Object.entries(controlGuides).forEach(([topicKey, controls]) => {
    if (topics[topicKey]) {
      topics[topicKey].controls = controls;
    }
  });

  const order = [
    "login_access",
    "dashboard_home",
    "product",
    "BIOS",
    "Boardview",
    "Schematics",
    "ProblemSolving",
    "Datasheets",
    "tool_spi_flash",
    "tool_oscilloscope",
    "tool_me_analyzer",
    "tool_uefi",
    "tool_universal_dmi",
    "tool_bios_vendor_detect",
    "tool_file_hash_compare",
    "tool_resistor_calculator",
    "tool_lenovo_dump_bios",
    "tool_dell_8fc8",
    "tool_ami_decryptor",
    "tool_bios_memory_spd",
    "tool_bios_password",
    "tool_microscope",
    "tool_alien_server",
    "tool_boardviewer",
    "settings"
  ];

  globalScope.teknisiHubHelp = Object.freeze({
    topics,
    order
  });
})(window);
