# GadgeTic Website - Fitur Data & Display

## Data yang Ditampilkan (90 Gadget)

Website sekarang menampilkan **90 gadget** dari 5 kategori utama:
- **Laptop** (20+ model)
- **Smartphone** (30+ model)
- **Mirrorless** (10+ model)
- **Drone** (5+ model)
- **Smartwatch** (10+ model)
- **AudioDevice** (5+ model)

---

## Informasi Spesifikasi per Gadget

### 1. **Informasi Umum & Harga**
- ✅ `priceIDR` - Harga estimasi dalam Rupiah
- ✅ `releaseYear` - Tahun rilis perangkat
- ✅ `osName` - Sistem operasi bawaan

### 2. **Fisik & Desain**
- ✅ `weightGr` - Berat perangkat (gram)
- ✅ `bodyMaterial` - Material bahan bodi (Titanium, Aluminum, dsb)
- ✅ `availableColor` - Pilihan warna yang tersedia
- ✅ `keyFeature` - Fitur unggulan produk

### 3. **Performa (RAM, CPU, GPU)**
- ✅ `ramSize` - Kapasitas RAM (GB)
- ✅ `ramTechnology` - Tipe RAM (LPDDR5X, DDR5, Unified Memory)
- ✅ `storageSizeGB` - Kapasitas penyimpanan (GB)
- ✅ `storageTechnology` - Teknologi storage (PCIe Gen 4, UFS 4.0)
- ✅ `vram` - Video RAM untuk GPU (GB)
- ✅ `supportsCUDA` - Support NVIDIA CUDA (Boolean)
- ✅ `supportsNPU` - Support AI NPU (Boolean)

### 4. **Layar & Kamera**
- ✅ `displayPanel` - Tipe panel (OLED, Mini-LED, Dynamic AMOLED, IPS LCD)
- ✅ `refreshRateHz` - Kecepatan refresh layar (Hz)
- ✅ `cameraMegapixel` - Resolusi kamera utama (MP)
- ✅ `video4k60` - Kemampuan 4K 60fps video (Boolean)
- ✅ `ibis` - In-Body Image Stabilization (Boolean)

### 5. **Baterai & Daya**
- ✅ `batteryCapacitymAh` - Kapasitas baterai smartphone (mAh)
- ✅ `batteryCapacityWh` - Kapasitas baterai laptop/drone (Wh)
- ✅ `maxFlightTimeMin` - Waktu terbang maksimal drone (menit)

---

## Fitur Display di Website

### Halaman Grid (Card View)
- Nama gadget
- Brand
- Kategori
- Harga dalam Rupiah

### Modal Detail (Klik Gadget)
Menampilkan spesifikasi lengkap dalam grup:

**General Specs:**
- RAM (dengan tipe: "16GB LPDDR5X")
- Storage (dengan tipe: "512GB PCIe Gen 4")
- Battery (unit otomatis: mAh untuk phone, Wh untuk laptop)

**Performance:**
- vRAM (GPU)
- CUDA Support
- NPU Support

**Physical & Design:**
- Material
- Colors
- Weight

**Display:**
- Panel type & refresh rate (contoh: "OLED • 120Hz")

**Features & OS:**
- OS System
- Key Features
- Release Year

**Camera (jika ada):**
- Megapixels
- IBIS support
- 4K 60fps

**Drone (jika ada):**
- Flight Time

---

## Struktur Query SPARQL

API menggunakan query SPARQL yang:
1. **Mengambil semua subclass Gadget** - tidak hardcode kategori
2. **Optional fields** - field yang kosong tidak ditampilkan (null check di frontend)
3. **Fallback labels** - jika `rdfs:label` tidak ada, gunakan local name dari URI
4. **Combine properties** - RAM + technology, battery mAh + Wh, display panel + refresh rate

---

## File Penting

- `pages/api/recommendations.js` - API SPARQL query
- `pages/index.js` - Frontend React (grid + modal)
- `lib/sparql.js` - N3 parser & Comunica SPARQL engine
- `lib/ontology/kelas.owl` - OWL ontology dengan 90 gadget + 13 SWRL rules

---

## Catatan untuk Presentasi

- **Data Source**: OWL/Turtle format dari `kelas.owl`
- **Parser**: N3.js library
- **Query Engine**: Comunica SPARQL
- **Reasoning**: SWRL rules ada di ontology tapi belum di-execute (memerlukan OWL Reasoner terpisah)
- **Total Gadget**: 90
- **Spesifikasi per Gadget**: 25+ fields
