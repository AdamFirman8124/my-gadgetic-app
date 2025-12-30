# 📊 Alur Kerja Project GadgeTic - Semantic Web Application

## 🎯 Ringkasan Project
**GadgeTic** adalah aplikasi web yang menggunakan Semantic Web Technology untuk memberikan rekomendasi gadget yang cerdas berdasarkan ontologi. Project ini menggabungkan:
- **Frontend**: Next.js + React + TypeScript
- **Backend API**: Next.js API Routes
- **Data Source**: OWL Ontology (Knowledge Graph)
- **Query Engine**: SPARQL (via Comunica)

---

## 🔄 Alur Kerja Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE (Frontend)                    │
│                    - React Components                            │
│                    - Next.js Pages                               │
│                    - Tailwind CSS Styling                        │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         │ HTTP Request
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTE                              │
│          (/pages/api/recommendations.js)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Terima request dari frontend                            │ │
│  │ 2. Parse parameter query/filter                            │ │
│  │ 3. Bangun dynamic SPARQL query dengan PREFIX               │ │
│  │ 4. Panggil queryOntology() function                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 │ Call queryOntology()
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│              SPARQL QUERY ENGINE (/lib/sparql.js)                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Load OWL Ontology File                                  │ │
│  │    └─ lib/ontology/kelas.owl                               │ │
│  │                                                             │ │
│  │ 2. Parse RDF Triples                                       │ │
│  │    └─ Convert OWL to N3 format                             │ │
│  │    └─ Create RDF Store with Quads                          │ │
│  │                                                             │ │
│  │ 3. Execute SPARQL Query                                    │ │
│  │    └─ Gunakan Comunica Query Engine                        │ │
│  │    └─ Query: SELECT gadget dengan filter spesifikasi       │ │
│  │                                                             │ │
│  │ 4. Convert Binding Results                                 │ │
│  │    └─ Transform RDF terms ke JavaScript objects            │ │
│  │    └─ Format sebagai JSON response                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 │ Return JSON results
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTE (Response)                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Format hasil SPARQL query                               │ │
│  │ 2. Tambah metadata (total gadgets, filter params)          │ │
│  │ 3. Return JSON response                                    │ │
│  │ 4. Send HTTP 200 dengan data                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────────────────────┘
                 │
                 │ HTTP Response (JSON)
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND RENDERING                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 1. Parse response JSON                                     │ │
│  │ 2. Update React state dengan gadget data                   │ │
│  │ 3. Filter/Sort gadget berdasarkan user preference          │ │
│  │ 4. Render gadget cards dengan Framer Motion animation     │ │
│  │ 5. Display spesifikasi detail                              │ │
│  │    - RAM, Storage, Camera MP, Battery, etc.                │ │
│  │    - Price, Release Year, Colors                           │ │
│  │    - Key Features, Sensor Format                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur File & Tanggung Jawab

### **Frontend Layer**
```
app/
├── layout.tsx          → Root layout & global styling
├── globals.css         → Global CSS

pages/
├── _app.js            → Next.js app wrapper
├── index.js           → Homepage - Tampilan gadget utama
└── api/
    └── recommendations.js → API endpoint untuk query ontology
```

### **Logic Layer**
```
lib/
├── sparql.js          → Core SPARQL query execution engine
│                         Functions:
│                         - queryOntology(filePath, sparqlQuery)
│                         - Parse OWL/RDF files
│                         - Execute SPARQL queries
│                         - Format hasil ke JSON
│
└── ontology/
    └── kelas.owl      → OWL Ontology Knowledge Graph
                         Berisi:
                         - Class hierarchy (Gadget, Laptop, Smartphone, etc.)
                         - Properties (RAM, Storage, Camera, Battery, etc.)
                         - Instances (90+ gadget objects)
                         - Relations antara gadget & components
```

### **Styling**
```
styles/
└── global.css         → Global styling

postcss.config.mjs     → PostCSS configuration
tsconfig.json          → TypeScript configuration
next.config.js         → Next.js configuration
```

---

## 🔑 Data Flow Sequence

### **Contoh: User mencari "Smartphone dengan RAM 12GB"**

```
1. USER INPUT
   └─ User membuka aplikasi & memilih filter: RAM = 12GB

2. FRONTEND REQUEST
   └─ React component hits API endpoint
   └─ GET /api/recommendations?ram=12

3. API PROCESSING
   └─ Handler menerima parameter {ram: 12}
   └─ Membangun SPARQL query:
      ┌─────────────────────────────────────────────────┐
      │ SELECT ?id ?name ?ram ?price ?cameraMP ...     │
      │ WHERE {                                          │
      │   ?id a ?type .                                 │
      │   ?type rdfs:subClassOf* gad:Smartphone .       │
      │   ?id gad:hasComponent ?ram .                   │
      │   ?ram a gad:RAM ;                              │
      │        gad:ramSize 12 .                         │
      │   ... (other optional properties)               │
      │ }                                                │
      └─────────────────────────────────────────────────┘

4. SPARQL EXECUTION
   └─ Load kelas.owl file
   └─ Parse RDF triples ke N3 store
   └─ Jalankan SPARQL query terhadap RDF store
   └─ Komunica engine mencocokkan patterns

5. RESULTS PROCESSING
   └─ Convert RDF bindings ke JS objects
   └─ Ekstrak properties:
      ├─ Name, Brand
      ├─ RAM (12GB), Storage
      ├─ Camera (MP), Battery (mAh/Wh)
      ├─ Price (IDR), Release Year
      └─ Available Colors, Body Material

6. API RESPONSE
   └─ Format JSON:
      ┌─────────────────────────────────────────────────┐
      │ {                                                │
      │   "success": true,                              │
      │   "total": 8,                                   │
      │   "gadgets": [                                  │
      │     {                                           │
      │       "id": "iPhone15ProMax",                   │
      │       "name": "iPhone 15 Pro Max",              │
      │       "categoryLabel": "Smartphone",            │
      │       "brandName": "Apple",                     │
      │       "ram": 8,                                 │
      │       "storage": 256,                           │
      │       "cameraMP": 48,                           │
      │       "price": 25000000,                        │
      │       ...                                       │
      │     },                                          │
      │     { ... more gadgets ... }                    │
      │   ]                                             │
      │ }                                                │
      └─────────────────────────────────────────────────┘

7. FRONTEND RENDERING
   └─ Update state dengan response data
   └─ Map gadgets array ke React components
   └─ Render cards dengan Framer Motion animation
   └─ Display spesifikasi dalam grid layout

8. USER SEES
   └─ List of 8 Smartphones dengan RAM 12GB
   └─ Sortable/Filterable cards
   └─ Detail info: Price, Camera, Battery, Colors, etc.
```

---

## 🛠 Dependencies & Tools

| Dependency | Purpose |
|-----------|---------|
| `@comunica/query-sparql` | SPARQL Query Engine untuk execute queries |
| `n3` | Parser untuk RDF/Turtle/N3 format |
| `@rdfjs/types` | TypeScript types untuk RDF objects |
| `next` | Frontend framework & API routes |
| `react`, `react-dom` | UI library |
| `tailwindcss` | CSS framework styling |
| `framer-motion` | Animation library untuk gadget cards |
| `lucide-react` | Icon library |
| `node-fetch` | HTTP client (jika diperlukan) |

---

## 📊 Knowledge Graph Structure (Simplified)

```
Gadget (Top Class)
├── Laptop
│   ├── Instance: MacBook Pro 16 M4
│   ├── Instance: Asus ROG Zephyrus G16
│   └── ...
├── Smartphone
│   ├── Instance: iPhone 15 Pro Max
│   ├── Instance: Samsung Galaxy S24 Ultra
│   └── ...
├── Mirrorless
│   ├── Instance: Canon EOS R5
│   └── ...
├── Drone
│   ├── Instance: DJI Air 3S
│   └── ...
├── Smartwatch
│   └── ...
└── AudioDevice
    └── ...

Each Gadget has:
├── Properties
│   ├── name (rdfs:label)
│   ├── brand (hasBrand)
│   ├── osName
│   ├── priceIDR
│   ├── releaseYear
│   ├── weightGr
│   ├── bodyMaterial
│   ├── availableColor
│   └── keyFeature
│
└── Components (hasComponent relation)
    ├── RAM (ramSize, ramTechnology)
    ├── Storage (storageSizeGB, storageTechnology)
    ├── Battery (batteryCapacity mAh/Wh)
    ├── Camera (cameraMegapixel, ibis, video4k60)
    ├── Display (displayPanel, refreshRateHz)
    ├── GPU (vram, supportsCUDA, supportsNPU)
    └── ...
```

---

## 🚀 Workflow Execution Steps

### **Development Workflow**
```
1. npm install          → Install dependencies
2. npm run dev          → Start development server (http://localhost:3000)
3. Frontend loads       → Next.js renders pages
4. User interacts       → Clicks filters/searches
5. API called           → SPARQL query built & executed
6. Results returned     → Frontend displays gadgets
```

### **Production Workflow**
```
1. npm run build        → Build Next.js production bundle
2. npm start            → Start production server
3. Serve static assets  → Frontend files served
4. API routes active    → Ready to handle requests
5. OWL ontology loaded  → SPARQL queries can execute
```

---

## 🔐 Data Processing Flow Summary

```
OWL Ontology (kelas.owl)
    ↓
[RDF Parser]
    ↓
[RDF Store with Quads]
    ↓
[SPARQL Query Engine - Comunica]
    ↓
[Query Bindings - RDF Terms]
    ↓
[JavaScript Object Converter]
    ↓
[JSON Serialization]
    ↓
[HTTP Response to Frontend]
    ↓
[React State Update]
    ↓
[Component Re-render with Animations]
    ↓
[User sees Gadget Recommendations]
```

---

## 📝 Query Building Pattern

```javascript
// API receives filter parameters
const { category, ram, storage, price, brand } = req.query;

// Builds dynamic SPARQL query
const query = `
  ${PREFIXES}
  SELECT ?id ?name ?ram ?storage ?price ...
  WHERE {
    // Core pattern
    ?id a ?type .
    ?type rdfs:subClassOf* gad:${category} .
    
    // Dynamic filters
    ${ram ? `?id gad:hasComponent ?r . ?r a gad:RAM ; gad:ramSize ${ram} .` : ''}
    ${storage ? `?id gad:hasComponent ?s . ?s a gad:Storage ; gad:storageSizeGB ${storage} .` : ''}
    ${price ? `?id gad:priceIDR ?p . FILTER(?p <= ${price})` : ''}
    
    // Optional properties
    OPTIONAL { ?id rdfs:label ?name . }
    ...
  }
`;

// Execute query
const bindings = await queryOntology('lib/ontology/kelas.owl', query);
```

---

## ✨ Key Features

✅ **Semantic Search** - Query gadgets using semantic ontology  
✅ **Dynamic Filtering** - Real-time gadget recommendations  
✅ **RDF/OWL Support** - Full knowledge graph integration  
✅ **SPARQL Querying** - Powerful graph pattern matching  
✅ **Type-Safe** - TypeScript throughout  
✅ **Responsive UI** - Tailwind CSS responsive design  
✅ **Animated Cards** - Framer Motion for smooth UX  
✅ **90+ Gadgets** - 5 categories with detailed specs  

---

## 🎓 Technologies Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, PostCSS |
| **Semantic Web** | OWL, RDF, N3 |
| **Query Engine** | Comunica, SPARQL |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Build Tool** | Next.js (Webpack/Turbopack) |
| **Linting** | ESLint |

---

**Created:** 2025-12-29  
**Project:** GadgeTic - Semantic Web Gadget Recommendation System  
**Purpose:** Demonstrate Semantic Web technologies in modern web applications
