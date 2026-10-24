# Kasponten — Primogem Forecast

**Fontaine Treasury.** Kalkulator estimasi pull Genshin Impact: hitung berapa
pull yang akan kamu punya sampai tanggal tertentu, berdasarkan resource yang
kamu punya sekarang dan sumber primogem rutin yang kamu pilih.

Live: https://kasponten.vercel.app/

## Cara jalanin lokal

```bash
npm install
npm run dev      # mode development
npm run build    # build production ke folder dist/
npm run preview  # preview hasil build
```

Stack: React 18 + Vite 5, tanpa library UI tambahan.

## Struktur

```
src/
  App.jsx                  # entry komponen (render PrimogemCalculator)
  main.jsx                 # entry React
  PrimogemCalculator.jsx   # tampilan + state form (input tersimpan di localStorage)
  PrimogemCalculator.css   # semua style komponen ini (tema Fontaine, token di :root)
  primogemCalc.js          # SEMUA logika & konstanta hitungan — pisah dari tampilan
  Field.jsx                # input angka berlabel
  Row.jsx                  # baris label–nilai di hasil
public/img/furinaicon.png  # favicon
```

## Nambah fitur / sumber primogem baru

Logika sengaja dipusatkan di `src/primogemCalc.js`:

1. **Ubah angka** (mis. reward Abyss naik) → ubah konstanta di atas file itu.
   Label, detail kartu, dan breakdown ikut berubah otomatis.
2. **Tambah sumber baru** → tambah entri di `SOURCES`, tambah blok hitungnya di
   `calculatePrimogems()`, lalu push satu entri ke array `breakdown`.
   Tampilan tidak perlu diubah — kartu pilihan dan baris hasil dirender dari data.
3. **Sumber yang tergantung sumber lain** (contoh: Arcane Chamber nempel ke
   Imaginarium Theater) → isi `dependsOn: "<key sumber induk>"` di `SOURCES`;
   UI otomatis men-disable kartu itu selama induknya mati.

## Asumsi hitungan

- 1 pull = 160 primogem; 1 Genesis Crystal = 1 primogem; Intertwined Fate = 1 pull.
- Daily Commission 60/hari, Welkin 90/hari — dihitung dari besok s/d tanggal target.
- Stardust Exchange: 5 pull per bulan kalender yang tersentuh rentang tanggal.
- Spiral Abyss: 800 per reset (tgl 16). Imaginarium Theater: 800 per reset (tgl 1).
  Arcane Chamber: +200 per reset Theater (2 stage × 100), hanya jika Theater aktif.
- Bar pity memakai target 90 pull (jaminan bintang 5 banner karakter).

## Catatan versi 1.1.0 (rapi-rapi)

- Bagian **Kalender Update Genshin dihapus total** (`GenshinSchedule.*`,
  `genshinSchedule.js` dibuang).
- Kode debug lama dibuang: handler error global yang menimpa layar di
  `index.html` dan `main.jsx`.
- Perbaikan bug kecil: nilai minimal tanggal target sekarang memakai tanggal
  lokal (sebelumnya `toISOString()`/UTC bisa mundur sehari di WIB pagi),
  input negatif dianggap 0, dan Arcane otomatis mati saat Theater dimatikan.
- Baru: input tersimpan otomatis (localStorage), preset tanggal
  (+7/+30/+42/+90 hari), subtotal resource saat ini, bar progres menuju pity 90,
  dan tombol Reset.

## Catatan versi 1.2.0 (makin Genshin)

Atas permintaan user 24 Okt 2026 ("diperhalus biar Genshin banget",
lalu dikonfirmasi "font Genshin"):
- Font display diganti ke Cinzel (Google Fonts, lisensi OFL gratis) untuk
  judul, eyebrow, judul section, dan angka total — gaya huruf ukir yang
  paling mirip judul/logo Genshin. Font asli game (HYWenHei-85W yang
  dimodifikasi miHoYo) itu proprietary dan tidak didistribusikan bebas,
  jadi Cinzel adalah padanan legal terdekat; fallback-nya Georgia kalau
  Google Fonts tidak terjangkau. Font isi tetap Trebuchet MS biar
  gampang dibaca. Kalau user punya file font aslinya, tinggal ganti
  --pc-font-display di PrimogemCalculator.css.
- Yang dipoles ornamen khas Genshin:
bingkai panel ganda + diamond emas di 4 sudut kartu, medali potret
Furina di header (pakai `public/img/furinaicon.png` yang sudah jadi
favicon), penanda langkah berbentuk diamond, garis pemisah di judul
section, taburan bintang halus di latar, bintang samar di belakang
angka total, bintang di ujung bar pity, dan diamond di garis footer.
Logika hitungan tidak disentuh.

## Catatan versi 1.3.0 (font Genshin asli)

Atas arahan user 24 Okt 2026 ("cari yang menurut lu bagus dan sesuai
font Genshin, Latin Indonesia"): riset pembanding mengonfirmasi tidak
ada font gratis yang benar-benar meniru gaya flared-glyphic Genshin —
padanan gratis terbaik (Optima/URW Gothic/Cinzel) semuanya kalah akurat
dari font aslinya sendiri. Keputusan: **pasang HYWenHei-85W asli**
(file kiriman user "HY Wenhei (zh-cn).ttf", versi Jul 2020 — dipilih
atas zhcn.ttf 2019 karena lebih baru; Latin keduanya praktis identik).
- Font di-subset ke Latin Indonesia + simbol (Basic Latin, Latin-1,
  tanda baca umum, panah, ◆★) → `public/fonts/hywenhei-latin.woff2`,
  249 glyph, **17 KB** (dari 11 MB) — dimuat self-hosted lewat
  @font-face, tanpa request eksternal. Google Fonts (Cinzel) dicopot;
  Cinzel kini hanya fallback kalau woff2 gagal dimuat.
- Satu face Heavy → @font-face dideklarasikan bobot 700 dan semua
  elemen display dipaksa 700 (bukan 800/900) supaya browser tidak
  mensintesis faux-bold di atas face yang sudah tebal.
- Font isi tetap Trebuchet MS. Simbol ✦ tidak ada di HYWenHei, jadi
  dekorasi ✦ tetap dirender font fallback (bukan tofu).
- Catatan lisensi: HYWenHei adalah font komersial Hanyi — pemakaian di
  web publik adalah keputusan user.
