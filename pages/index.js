import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Smartphone, Laptop, Camera, Headphones, 
  Plane, Watch, ChevronRight, Filter, Battery, 
  Cpu, X, Aperture, Video, HardDrive, Zap, 
  Code, PenTool, Brain, Sparkles, Database, 
  Palette, Scale, Layers, Hand,
  Music, Wifi, Mic, Activity
} from 'lucide-react';
import React from 'react';

// --- HELPER FORMATTER ---
const formatRupiah = (price) => {
  if (!price) return 'Cek Harga';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
};

// --- SWRL GOAL FORMATTER ---
const formatRequirements = (reqs) => {
  if (!reqs) return '-';
  const s = String(reqs).trim();
  if (!s) return '-';
  return s;
};

// --- ICON & COLOR UTILS ---
const getCategoryInfo = (category) => {
  const cat = category ? category.toLowerCase() : '';
  const props = { size: 24, strokeWidth: 1.5 };

  if (cat.includes('phone')) return { icon: <Smartphone {...props} />, color: '#8B5CF6', bg: '#F3E8FF' }; // Violet
  if (cat.includes('laptop')) return { icon: <Laptop {...props} />, color: '#3B82F6', bg: '#DBEAFE' }; // Blue
  if (cat.includes('drone')) return { icon: <Plane {...props} />, color: '#F59E0B', bg: '#FEF3C7' }; // Amber
  if (cat.includes('watch') || cat.includes('band')) return { icon: <Watch {...props} />, color: '#10B981', bg: '#D1FAE5' }; // Emerald
  if (cat.includes('camera')) return { icon: <Camera {...props} />, color: '#EF4444', bg: '#FEE2E2' }; // Red
  if (cat.includes('audio') || cat.includes('head') || cat.includes('ear') || cat.includes('tws')) return { icon: <Headphones {...props} />, color: '#EC4899', bg: '#FCE7F3' }; // Pink
  
  return { icon: <Search {...props} />, color: '#6B7280', bg: '#F3F4F6' }; // Gray
};

export default function Home() {
  const [gadgets, setGadgets] = useState([]);
  const [displayedGadgets, setDisplayedGadgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGadget, setSelectedGadget] = useState(null);

  // Filter State
  const [activePersona, setActivePersona] = useState('General'); 
  const [filters, setFilters] = useState({ category: 'All', brand: 'All', minPrice: '', maxPrice: '' });
  const [uniqueCategories, setUniqueCategories] = useState(['All']);
  const [uniqueBrands, setUniqueBrands] = useState(['All']);

  // --- FETCH DATA ---
  useEffect(() => {
    const startTime = Date.now();
    fetch('/api/recommendations')
      .then((res) => res.json())
      .then((data) => {
        const cleanData = data.map((item, index) => {
          const checkBool = (val) => String(val).toLowerCase() === 'true' || String(val) === '1';
          const features = item.keyFeature || item.features || '';

          // --- SMART EXTRACTION (REGEX) ---
          // Mencari data dari teks fitur jika data terstruktur kosong
          const extract = (regex) => {
            const match = features.match(regex);
            return match ? match[1] : null;
          };

          return {
            ...item,
            id: index,
            categoryLabel: item.categoryLabel || (item.category ? item.category.split('#').pop() : 'Unknown'),
            brandName: item.brandName || (item.brand ? item.brand.split('#').pop() : 'Unknown'),
            priceVal: item.price ? parseInt(item.price) : (item.priceIDR ? parseInt(item.priceIDR) : 0),
            
            // Specs Logic
            ramVal: parseInt(item.ram || item.ramSize || 0),
            storageVal: parseInt(item.storage || item.storageSizeGB || 0),
            vram: parseInt(item.vram || item.vramSize || 0),
            
            // Battery: Prioritize explicit property, fallback to regex extraction "30 Hours"
            batteryWh: item.batteryWh || item.batteryCapacityWh ? parseFloat(item.batteryWh || item.batteryCapacityWh) : null,
            batteryMAh: item.batteryCapacitymAh || item.batteryMAh ? parseInt(item.batteryCapacitymAh || item.batteryMAh) : null,
            playbackHours: item.batteryLifeHours ? parseFloat(item.batteryLifeHours) : (extract(/(\d+)\s*(?:hours?|jam|h)/i) || null),

            // Display & Camera
            displayPanel: item.displayPanel || extract(/(OLED|AMOLED|IPS|LCD|Mini-LED)/i) || '',
            refreshRateHz: item.refreshRateHz ? parseInt(item.refreshRateHz) : (extract(/(\d+)\s*Hz/i) || null),
            cameraMP: item.cameraMegapixel || item.cameraMP || extract(/(\d+)\s*MP/i) || null,
            
            // Audio Features
            noiseCancellation: checkBool(item.noiseCancellation) || /noise\s*cancel|anc/i.test(features),
            
            // General Features
            flightTime: item.maxFlightTimeMin || item.flightTime || extract(/(\d+)\s*(?:min|menit)/i) || null,
            supportsCUDA: checkBool(item.supportsCUDA),
            supportsNPU: checkBool(item.supportsNPU),
            hasIbis: checkBool(item.ibis),
            has4k: checkBool(item.video4k) || checkBool(item.video4k60) || /4k/i.test(features),

            // SWRL GOAL OUTPUT (dari API)
            requirements: item.requirements ? String(item.requirements) : '',
            
            // Meta Info
            osName: item.osName || '-',
            ramTech: item.ramTech || item.ramTechnology || '',
            storageTech: item.storageTech || item.storageTechnology || '',
            keyFeature: features, 
            availableColor: item.availableColor || '-',
            bodyMaterial: item.bodyMaterial || '-',
            weightGr: item.weightGr ? parseInt(item.weightGr) : null,
            releaseYear: item.releaseYear ? parseInt(item.releaseYear) : null,
          };
        });
        
        setGadgets(cleanData);
        setDisplayedGadgets(cleanData);
        
        const categories = ['All', ...new Set(cleanData.map(g => g.categoryLabel).filter(Boolean))];
        const brands = ['All', ...new Set(cleanData.map(g => g.brandName).filter(Boolean))];
        setUniqueCategories(categories.sort());
        setUniqueBrands(brands.sort());

        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1500; 
        if (elapsedTime < minLoadingTime) {
           setTimeout(() => setLoading(false), minLoadingTime - elapsedTime);
        } else {
           setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = gadgets;

    if (activePersona === 'Mobile Dev') {
      result = result.filter(g => {
        const cat = g.categoryLabel.toLowerCase();
        const isLaptop = cat.includes('laptop');
        return (isLaptop || cat.includes('phone')) && g.ramVal >= 16;
      });
    } else if (activePersona === 'Content Creator') {
      result = result.filter(g => 
        (g.has4k) || (g.displayPanel && (g.displayPanel.includes('OLED') || g.displayPanel.includes('Mini'))) ||
        (g.categoryLabel.toLowerCase().includes('drone')) || (g.categoryLabel.toLowerCase().includes('camera'))
      );
    } else if (activePersona === 'AI / ML') {
      result = result.filter(g => {
        const req = (g.requirements || '').toLowerCase();
        return req.includes('advanced_ai_training');
      });
    }

    if (filters.category !== 'All') {
      result = result.filter(g => g.categoryLabel && g.categoryLabel.toLowerCase().includes(filters.category.toLowerCase()));
    }
    if (filters.brand !== 'All') {
      result = result.filter(g => g.brandName && g.brandName.toLowerCase() === filters.brand.toLowerCase());
    }
    if (filters.minPrice) result = result.filter(g => g.priceVal >= parseInt(filters.minPrice));
    if (filters.maxPrice) result = result.filter(g => g.priceVal <= parseInt(filters.maxPrice));
    
    setDisplayedGadgets(result);
  }, [filters, activePersona, gadgets]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
  
  const resetFilters = () => {
    setFilters({ category: 'All', brand: 'All', minPrice: '', maxPrice: '' });
    setActivePersona('General');
  };

  if (loading) return <SemanticLoader />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif', color: '#0F172A', overflowX: 'hidden' }}>
      
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, padding: '60px 20px 40px', textAlign: 'center' }}>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#1E293B', marginBottom: '12px' }}
        >
          GadgeTic <span style={{ color: '#3B82F6' }}>Pro.</span>
        </motion.h1>
        <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto 40px' }}>
          Platform rekomendasi gadget berbasis Semantic Web untuk profesional.
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <PersonaButton active={activePersona === 'General'} onClick={() => setActivePersona('General')} icon={<Sparkles size={16}/>} label="Explore" />
          <PersonaButton active={activePersona === 'Mobile Dev'} onClick={() => setActivePersona('Mobile Dev')} icon={<Code size={16}/>} label="Developer" color="#8B5CF6" />
          <PersonaButton active={activePersona === 'Content Creator'} onClick={() => setActivePersona('Content Creator')} icon={<PenTool size={16}/>} label="Creator" color="#EC4899" />
          <PersonaButton active={activePersona === 'AI / ML'} onClick={() => setActivePersona('AI / ML')} icon={<Brain size={16}/>} label="AI / ML" color="#10B981" />
        </div>
      </div>

      {/* Main Layout */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 24px 80px', display: 'flex', gap: '40px', position: 'relative', zIndex: 10, alignItems: 'flex-start' }}>
        
        {/* Sidebar */}
        <div style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '24px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}><Filter size={16} /> FILTER</h3>
              <button onClick={resetFilters} style={{ fontSize: '12px', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Reset</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <FilterGroup label="Category" name="category" value={filters.category} options={uniqueCategories} onChange={handleInputChange} />
              <FilterGroup label="Brand" name="brand" value={filters.brand} options={uniqueBrands} onChange={handleInputChange} />
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>Budget (IDR)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleInputChange} style={inputStyle} />
                  <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleInputChange} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {displayedGadgets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px dashed #CBD5E1' }}>
              <Search size={40} style={{ margin: '0 auto 16px', color: '#94A3B8' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#334155' }}>Tidak ada hasil ditemukan</h3>
              <p style={{ color: '#64748B', fontSize: '14px' }}>Coba sesuaikan filter atau pilih persona lain.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {displayedGadgets.map((gadget, i) => (
                <GadgetCard key={gadget.name + i} gadget={gadget} onClick={() => setSelectedGadget(gadget)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedGadget && <GadgetModal gadget={selectedGadget} onClose={() => setSelectedGadget(null)} />}
      </AnimatePresence>
    </div>
  );
}

// --- COMPONENTS ---

const GadgetCard = ({ gadget, onClick }) => {
  const { icon, color, bg } = getCategoryInfo(gadget.categoryLabel);
  const isAudio = gadget.categoryLabel.toLowerCase().includes('audio') || gadget.categoryLabel.toLowerCase().includes('head') || gadget.categoryLabel.toLowerCase().includes('ear');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{ 
        background: 'white', borderRadius: '20px', cursor: 'pointer', overflow: 'hidden',
        border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <div style={{ height: '6px', width: '100%', backgroundColor: color, opacity: 0.8 }}></div>
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
          {(gadget.supportsCUDA || gadget.supportsNPU) && (
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', background: '#F0FDF4', color: '#15803D', border: '1px solid #DCFCE7' }}>AI READY</span>
          )}
           {/* Tag Khusus Audio */}
           {isAudio && gadget.playbackHours && (
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5' }}>{gadget.playbackHours}H PLAY</span>
          )}
        </div>
        
        <div style={{ marginBottom: 'auto' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{gadget.brandName}</span>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', lineHeight: '1.4', marginTop: '4px' }}>{gadget.name}</h3>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', marginBottom: '14px' }}>
          {isAudio ? (
             <>
                {gadget.playbackHours && <SpecPill label={`${gadget.playbackHours} Jam`} />}
                {gadget.noiseCancellation && <SpecPill label="ANC Active" />}
                {(!gadget.playbackHours && !gadget.noiseCancellation && gadget.keyFeature) && 
                  <SpecPill label={gadget.keyFeature.split(',')[0].slice(0, 15)} />
                }
             </>
          ) : (
             <>
                {gadget.ramVal > 0 && <SpecPill label={`${gadget.ramVal}GB RAM`} />}
                {gadget.storageVal > 0 && <SpecPill label={`${gadget.storageVal}GB`} />}
                {gadget.displayPanel && <SpecPill label={gadget.displayPanel.split(' ')[0]} />}
                {gadget.flightTime && <SpecPill label={`${gadget.flightTime}m Fly`} />}
             </>
          )}
        </div>

        {/* === SWRL GOAL OUTPUT (DITAMPILKAN DI CARD) === */}
        <div style={{ padding: '12px 12px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase' }}>
            Meets Requirement (SWRL Goal)
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>
            {formatRequirements(gadget.requirements)}
          </div>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Harga Estimasi</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A' }}>{formatRupiah(gadget.priceVal)}</p>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F8FAFC', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={16} /></div>
        </div>
      </div>
    </motion.div>
  );
};

const GadgetModal = ({ gadget, onClose }) => {
  const { icon, bg, color } = getCategoryInfo(gadget.categoryLabel);
  const cat = gadget.categoryLabel.toLowerCase();
  
  // Deteksi Tipe Gadget untuk Layout Modal
  const isAudio = cat.includes('audio') || cat.includes('head') || cat.includes('ear') || cat.includes('tws');
  const isWatch = cat.includes('watch') || cat.includes('band');
  const isDrone = cat.includes('drone');
  const isCam = cat.includes('camera') || cat.includes('mirrorless');

  // Formatter Baterai Universal
  const batteryLabel = gadget.playbackHours ? `${gadget.playbackHours} Jam Playback` : (gadget.batteryWh ? `${gadget.batteryWh} Wh` : (gadget.batteryMAh ? `${gadget.batteryMAh} mAh` : null));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ background: 'white', width: '100%', maxWidth: '700px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ padding: '32px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: '20px', alignItems: 'start', position: 'relative' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{React.cloneElement(icon, { size: 32 })}</div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{gadget.categoryLabel}</span>
            <h2 style={{ fontSize: '28px', fontWeight: '800', lineHeight: '1.2', color: '#1E293B', marginTop: '4px' }}>{gadget.name}</h2>
            <p style={{ color: '#64748B', fontSize: '16px', marginTop: '4px' }}>{gadget.brandName} • Rilis {gadget.releaseYear || 'N/A'}</p>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={18} /></button>
        </div>

        {/* === SWRL GOAL OUTPUT (DITAMPILKAN DI MODAL) === */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
            Meets Requirement (SWRL Goal)
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', lineHeight: 1.5 }}>
            {formatRequirements(gadget.requirements)}
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '32px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px' }}>Technical Specifications</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
            
            {/* LOGIKA TAMPILAN BERDASARKAN KATEGORI */}
            {isAudio ? (
              <>
                 <DetailRow icon={<Battery/>} label="Battery Life" value={batteryLabel} />
                 <DetailRow icon={<Music/>} label="Audio Features" value={gadget.noiseCancellation ? 'Active Noise Cancellation (ANC)' : 'Standard Isolation'} />
                 <DetailRow icon={<Wifi/>} label="Connectivity" value="Bluetooth 5.x / Wireless" />
                 <DetailRow icon={<Mic/>} label="Microphone" value="Built-in Mic Supported" />
              </>
            ) : isWatch ? (
              <>
                 <DetailRow icon={<Activity/>} label="Health Sensors" value="Heart Rate, SpO2, Sleep" />
                 <DetailRow icon={<Aperture/>} label="Display" value={gadget.displayPanel || 'AMOLED'} />
                 <DetailRow icon={<Battery/>} label="Battery" value={batteryLabel} />
                 <DetailRow icon={<Layers/>} label="Strap Material" value="Silicone / Leather" />
              </>
            ) : isDrone ? (
              <>
                 <DetailRow icon={<Plane/>} label="Flight Time" value={gadget.flightTime ? `${gadget.flightTime} Minutes` : '-'} />
                 <DetailRow icon={<Video/>} label="Video Res" value={gadget.has4k ? '4K Ultra HD' : 'HD'} />
                 <DetailRow icon={<Wifi/>} label="Transmission" value="OcuSync / Wifi" />
                 <DetailRow icon={<Battery/>} label="Battery" value={batteryLabel} />
              </>
            ) : (
              // DEFAULT (Laptop/Phone/Camera)
              <>
                <DetailRow icon={<Cpu/>} label="Chipset / OS" value={gadget.osName} />
                <DetailRow icon={<Zap/>} label="Memory (RAM)" value={gadget.ramVal ? `${gadget.ramVal}GB ${gadget.ramTech}` : null} />
                <DetailRow icon={<HardDrive/>} label="Storage" value={gadget.storageVal ? `${gadget.storageVal}GB ${gadget.storageTech}` : null} />
                <DetailRow icon={<Battery/>} label="Battery Capacity" value={batteryLabel} />
                
                {gadget.vram > 0 && <DetailRow icon={<Cpu/>} label="GPU VRAM" value={`${gadget.vram} GB`} />}
                <DetailRow icon={<Aperture/>} label="Display" value={gadget.displayPanel ? `${gadget.displayPanel} ${gadget.refreshRateHz ? `(${gadget.refreshRateHz}Hz)` : ''}` : null} />
                
                {(gadget.cameraMP) && <DetailRow icon={<Camera/>} label="Main Camera" value={`${gadget.cameraMP} MP`} />}
                
                <DetailRow icon={<Video/>} label="Video Capability" value={gadget.has4k ? '4K / 8K Supported' : null} />
                <DetailRow icon={<Hand/>} label="Stabilization" value={gadget.hasIbis ? 'In-Body Stabilization (IBIS)' : null} />
              </>
            )}
          </div>

          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginTop: '32px', marginBottom: '16px' }}>Physical & Features</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
             <DetailRow icon={<Palette/>} label="Colors" value={gadget.availableColor} />
             <DetailRow icon={<Scale/>} label="Weight" value={gadget.weightGr ? `${gadget.weightGr}g` : null} />
             <DetailRow icon={<Layers/>} label="Build Material" value={gadget.bodyMaterial} />
             <DetailRow icon={<Sparkles/>} label="Key Features" value={gadget.keyFeature} fullWidth />
          </div>

          <div style={{ marginTop: '32px', padding: '20px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>ESTIMASI HARGA</p>
              <p style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A' }}>{formatRupiah(gadget.priceVal)}</p>
            </div>
            <button onClick={onClose} style={{ padding: '12px 24px', background: '#1E293B', color: 'white', borderRadius: '10px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>Close Detail</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- SUB COMPONENTS ---
const DetailRow = ({ icon, label, value, fullWidth }) => {
  if (!value || value === '0' || value === 0 || value === '-' || value === 'null') return null;

  return (
    <div style={{ gridColumn: fullWidth ? 'span 2' : 'span 1', display: 'flex', gap: '12px' }}>
      <div style={{ color: '#94A3B8', marginTop: '2px' }}>{React.cloneElement(icon, { size: 18 })}</div>
      <div>
        <p style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155', lineHeight: '1.4' }}>{value}</p>
      </div>
    </div>
  );
};

const SpecPill = ({ label }) => (
  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontWeight: '500' }}>{label}</span>
);

const PersonaButton = ({ active, onClick, icon, label, color = '#3B82F6' }) => (
  <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: active ? `1px solid ${color}` : '1px solid #E2E8F0', backgroundColor: active ? 'white' : 'white', color: active ? color : '#64748B', fontWeight: active ? '600' : '500', fontSize: '13px', cursor: 'pointer', boxShadow: active ? `0 4px 12px -2px ${color}30` : '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s ease' }}>
    {icon} {label}
  </button>
);

const FilterGroup = ({ label, name, value, options, onChange }) => (
  <div>
    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <select name={name} value={value} onChange={onChange} style={inputStyle}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronRight size={14} style={{ position: 'absolute', right: '12px', top: '12px', color: '#94A3B8', pointerEvents: 'none' }}/>
    </div>
  </div>
);

const SemanticLoader = () => {
  const [textIndex, setTextIndex] = useState(0);
  const texts = ["Initializing Semantic Core...", "Parsing .owl Structure...", "Building Knowledge Graph...", "Linking Entities...", "Optimizing Inference..."];
  useEffect(() => {
    const interval = setInterval(() => setTextIndex((p) => (p + 1) % texts.length), 800);
    return () => clearInterval(interval);
  }, []);
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', color: '#1E293B' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px', marginBottom: '30px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#3B82F6' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#8B5CF6' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Database size={24} color="#1E293B" /></div>
      </div>
      <p style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: '#475569' }}>{texts[textIndex]}</p>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '13px', color: '#334155', appearance: 'none', cursor: 'pointer', outline: 'none' };
