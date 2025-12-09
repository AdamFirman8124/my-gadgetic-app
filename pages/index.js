import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Smartphone, Laptop, Camera, Headphones, 
  Plane, Watch, ChevronRight, SlidersHorizontal, Battery, 
  Cpu, X, Aperture, Video, Hand, HardDrive, Zap 
} from 'lucide-react';

// --- HELPER FORMATTER ---
const formatRupiah = (price) => {
  if (!price) return 'Cek Harga';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
};

// --- ICON KATEGORI ---
const getCategoryIcon = (category) => {
  const props = { strokeWidth: 1.5 };
  switch (category) {
    case 'Smartphone': return <Smartphone {...props} />;
    case 'Laptop': return <Laptop {...props} />;
    case 'Drone': return <Plane {...props} />;
    case 'Smartwatch': return <Watch {...props} />;
    case 'Mirrorless': case 'Camera': return <Camera {...props} />;
    case 'Headphones': case 'AudioDevice': return <Headphones {...props} />;
    default: return <Search {...props} />;
  }
};

export default function Home() {
  const [gadgets, setGadgets] = useState([]);
  const [displayedGadgets, setDisplayedGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Detail
  const [selectedGadget, setSelectedGadget] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({ category: 'All', brand: 'All', minPrice: '', maxPrice: '' });
  const [uniqueCategories, setUniqueCategories] = useState(['All']);
  const [uniqueBrands, setUniqueBrands] = useState(['All']);

  // --- FETCH DATA ---
  useEffect(() => {
    fetch('/api/recommendations')
      .then((res) => res.json())
      .then((data) => {
        const cleanData = data.map(item => ({
          ...item,
          priceVal: item.price ? parseInt(item.price) : 0,
          ramVal: item.ram ? parseInt(item.ram) : null,
          // Boolean check: kadang string "true" atau "1" dari SPARQL
          hasIbis: item.ibis === 'true' || item.ibis === '1',
          has4k: item.video4k === 'true' || item.video4k === '1'
        }));
        setGadgets(cleanData);
        setDisplayedGadgets(cleanData);
        setLoading(false);
        setUniqueCategories(['All', ...new Set(cleanData.map(g => g.categoryLabel).filter(Boolean))]);
        setUniqueBrands(['All', ...new Set(cleanData.map(g => g.brandName).filter(Boolean))]);
      });
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = gadgets;
    if (filters.category !== 'All') result = result.filter(g => g.categoryLabel === filters.category);
    if (filters.brand !== 'All') result = result.filter(g => g.brandName === filters.brand);
    if (filters.minPrice) result = result.filter(g => g.priceVal >= parseInt(filters.minPrice));
    if (filters.maxPrice) result = result.filter(g => g.priceVal <= parseInt(filters.maxPrice));
    setDisplayedGadgets(result);
  }, [filters, gadgets]);

  const handleInputChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const resetFilters = () => setFilters({ category: 'All', brand: 'All', minPrice: '', maxPrice: '' });

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* --- HERO HEADER --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', padding: '100px 20px 60px 20px' }}
      >
        <h1 style={{ fontSize: '56px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '16px', color: '#1d1d1f' }}>
          GadgeTic <span style={{ color: '#0071e3' }}>Pro.</span>
        </h1>
        <p style={{ fontSize: '24px', color: '#86868b', fontWeight: '400', maxWidth: '600px', margin: '0 auto', lineHeight: '1.4' }}>
          Eksplorasi spesifikasi cerdas berbasis Semantic Web.
        </p>
      </motion.div>

      {/* --- MAIN LAYOUT --- */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 40px', display: 'flex', gap: '50px', alignItems: 'flex-start' }}>
        
        {/* --- GLASS SIDEBAR --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ 
            flex: '0 0 300px', position: 'sticky', top: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 20px 40px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1d1d1f', fontWeight: '600' }}>
              <SlidersHorizontal size={18} /> Filter
            </div>
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Reset</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <FilterSelect label="Kategori" name="category" value={filters.category} options={uniqueCategories} onChange={handleInputChange} />
            <FilterSelect label="Brand" name="brand" value={filters.brand} options={uniqueBrands} onChange={handleInputChange} />
            <div>
              <label style={labelStyle}>Budget (IDR)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleInputChange} style={inputStyle} />
                <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleInputChange} style={inputStyle} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- GRID CONTENT --- */}
        <div style={{ flex: 1 }}>
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            <AnimatePresence>
              {displayedGadgets.map((gadget) => (
                <motion.div
                  layout key={gadget.name}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                  onClick={() => setSelectedGadget(gadget)} // Buka Modal saat klik kartu
                  style={{ 
                    backgroundColor: 'white', borderRadius: '28px', padding: '32px', position: 'relative',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '380px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}>
                        {getCategoryIcon(gadget.categoryLabel)}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{gadget.brandName}</span>
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: '600', lineHeight: '1.2', color: '#1d1d1f', marginBottom: '8px' }}>{gadget.name}</h3>
                    <p style={{ fontSize: '14px', color: '#86868b', marginBottom: '24px' }}>{gadget.categoryLabel}</p>

                    {/* PREVIEW SPECS (Hanya tampilkan 3 spek utama) */}
                    <div style={{ backgroundColor: '#F5F5F7', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <SpecItem icon={<Cpu size={14}/>} label="OS" value={gadget.os} />
                      
                      {/* Logic Mirrorless / Kamera */}
                      {gadget.categoryLabel === 'Mirrorless' || gadget.categoryLabel === 'Camera' ? (
                        <>
                           <SpecItem icon={<Aperture size={14}/>} label="Sensor" value={gadget.sensorFormat} />
                           <SpecItem icon={<Video size={14}/>} label="4K Video" value={gadget.has4k ? 'Yes' : null} highlight />
                        </>
                      ) : gadget.categoryLabel === 'Drone' ? (
                         <SpecItem icon={<Plane size={14}/>} label="Flight" value={gadget.flightTime ? `${gadget.flightTime} min` : null} highlight />
                      ) : (
                        // Default Laptop/HP
                        <>
                           <SpecItem icon={<Zap size={14}/>} label="RAM" value={gadget.ram ? `${gadget.ram} GB` : null} />
                           <SpecItem icon={<HardDrive size={14}/>} label="Storage" value={gadget.storage ? `${gadget.storage} GB` : null} />
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '17px', fontWeight: '600', color: '#1d1d1f' }}>{formatRupiah(gadget.priceVal)}</span>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedGadget(gadget); }} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0071e3', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* --- MODAL POP-UP (APPLE STYLE) --- */}
      <AnimatePresence>
        {selectedGadget && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedGadget(null)}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Stop closing when clicking inside
              style={{ 
                backgroundColor: 'white', width: '90%', maxWidth: '500px', borderRadius: '32px', 
                padding: '40px', boxShadow: '0 40px 80px rgba(0,0,0,0.2)', position: 'relative'
              }}
            >
              <button onClick={() => setSelectedGadget(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f5f5f7', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1d1d1f' }}>
                <X size={20} />
              </button>

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F5F5F7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#0071e3', marginBottom: '16px' }}>
                  {getCategoryIcon(selectedGadget.categoryLabel)}
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{selectedGadget.name}</h2>
                <p style={{ color: '#86868b', fontSize: '18px' }}>{selectedGadget.categoryLabel} • {selectedGadget.brandName}</p>
                <h3 style={{ fontSize: '28px', color: '#1d1d1f', marginTop: '16px', fontWeight: '600' }}>{formatRupiah(selectedGadget.priceVal)}</h3>
              </div>

              {/* DETAIL SPECS LIST */}
              <div style={{ backgroundColor: '#F5F5F7', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <SpecItem icon={<Cpu size={18}/>} label="OS System" value={selectedGadget.os} />
                
                {/* Tampilkan SEMUA data yang ada, tanpa filter kategori (biar lengkap) */}
                <SpecItem icon={<Zap size={18}/>} label="RAM Memory" value={selectedGadget.ram ? `${selectedGadget.ram} GB` : null} />
                <SpecItem icon={<HardDrive size={18}/>} label="Storage" value={selectedGadget.storage ? `${selectedGadget.storage} GB` : null} />
                <SpecItem icon={<Battery size={18}/>} label="Battery" value={selectedGadget.battery ? `${selectedGadget.battery} mAh` : null} />
                
                {/* Mirrorless Specifics */}
                <SpecItem icon={<Aperture size={18}/>} label="Sensor Format" value={selectedGadget.sensorFormat} />
                <SpecItem icon={<Camera size={18}/>} label="Megapixels" value={selectedGadget.cameraMP ? `${selectedGadget.cameraMP} MP` : null} />
                <SpecItem icon={<Hand size={18}/>} label="In-Body Stabilizer (IBIS)" value={selectedGadget.hasIbis ? 'Yes, Supported' : null} />
                <SpecItem icon={<Video size={18}/>} label="4K 60fps Video" value={selectedGadget.has4k ? 'Yes, Supported' : null} />
                
                {/* Drone Specifics */}
                <SpecItem icon={<Plane size={18}/>} label="Flight Time" value={selectedGadget.flightTime ? `${selectedGadget.flightTime} Minutes` : null} />
              </div>

              <button onClick={() => setSelectedGadget(null)} style={{ width: '100%', marginTop: '30px', padding: '16px', borderRadius: '18px', border: 'none', backgroundColor: '#0071e3', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                Tutup
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUB COMPONENTS ---

const SpecItem = ({ icon, label, value, highlight }) => {
  if (!value) return null; // KUNCI: Jangan render jika data kosong/null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: highlight ? '#0071e3' : '#424245', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon} 
        <span style={{ fontWeight: '500' }}>{label}</span>
      </div>
      <span style={{ fontWeight: '600' }}>{value}</span>
    </div>
  );
};

const FilterSelect = ({ label, name, value, options, onChange }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ position: 'relative' }}>
      <select name={name} value={value} onChange={onChange} style={inputStyle}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronRight size={14} style={{ position: 'absolute', right: '12px', top: '14px', color: '#86868b', pointerEvents: 'none', transform: 'rotate(90deg)' }}/>
    </div>
  </div>
);

const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#86868b', textTransform: 'uppercase', marginBottom: '8px', display: 'block' };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #d2d2d7', backgroundColor: 'rgba(255,255,255,0.5)', fontSize: '14px', color: '#1d1d1f', appearance: 'none', cursor: 'pointer' };