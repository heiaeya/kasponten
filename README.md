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
