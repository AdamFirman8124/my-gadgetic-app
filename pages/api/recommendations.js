import { queryOntology } from '../../lib/sparql';

const PREFIXES = `
  PREFIX : <http://example.org/gadgetic#>
  PREFIX gad: <http://example.org/gadgetic#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
`;

export default async function handler(req, res) {
  try {
    console.log('[API] Request received for /api/recommendations');
    const owlPath = 'lib/ontology/kelas.owl';
    console.log('[API] Using ontology path:', owlPath);

    /**
     * NOTE:
     * Karena stack kamu (Comunica + N3 Store) tidak support SWRL reasoning,
     * maka goal SWRL (gad:meetsRequirement) ditampilkan dengan cara "meniru rule SWRL"
     * memakai SPARQL (UNION + FILTER) dan menghasilkan field ?requirements.
     */
    const query = `
      ${PREFIXES}
      SELECT
        ?id ?name ?categoryLabel ?brandName
        ?os ?ram ?ramTech ?storage ?storageTech ?price
        ?flightTime ?battery ?batteryWh
        ?cameraMP ?sensorFormat ?ibis ?video4k
        ?displayPanel ?refreshRateHz
        ?keyFeature ?availableColor ?releaseYear ?weightGr ?bodyMaterial
        ?vram ?supportsCUDA ?supportsNPU
      WHERE {
        ?id a ?type .
        ?type rdfs:subClassOf* gad:Gadget .
        FILTER(!CONTAINS(STRAFTER(STR(?type), "#"), "RecommendedFor_"))

        OPTIONAL { ?id rdfs:label ?nameLabel . }
        BIND(COALESCE(?nameLabel, STRAFTER(STR(?id), "#")) AS ?name)
        BIND(STRAFTER(STR(?type), "#") AS ?categoryLabel)

        OPTIONAL {
          ?id gad:hasBrand ?brand .
          OPTIONAL { ?brand rdfs:label ?brandLabel . }
          BIND(COALESCE(?brandLabel, STRAFTER(STR(?brand), "#")) AS ?brandName)
        }

        OPTIONAL { ?id gad:osName ?os . }
        OPTIONAL { ?id gad:priceIDR ?price . }

        OPTIONAL {
          ?id gad:hasComponent ?ramComp .
          ?ramComp gad:ramSize ?ram .
          OPTIONAL { ?ramComp gad:ramTechnology ?ramTech . }
        }

        OPTIONAL {
          ?id gad:hasComponent ?storageComp .
          ?storageComp gad:storageSizeGB ?storage .
          OPTIONAL { ?storageComp gad:storageTechnology ?storageTech . }
        }

        OPTIONAL { ?id gad:maxFlightTimeMin ?flightTime . }

        OPTIONAL {
          ?id gad:hasComponent ?batComp .
          ?batComp gad:batteryCapacitymAh ?battery .
          OPTIONAL { ?batComp gad:batteryCapacityWh ?batteryWh . }
        }

        OPTIONAL {
          ?id gad:hasComponent ?camComp .
          OPTIONAL { ?camComp gad:cameraMegapixel ?cameraMP . }
          OPTIONAL { ?camComp gad:sensorFormat ?sensorFormat . }
          OPTIONAL { ?camComp gad:ibis ?ibis . }
          OPTIONAL { ?camComp gad:video4k60 ?video4k . }
        }

        OPTIONAL {
          ?id gad:hasComponent ?dispComp .
          ?dispComp gad:displayPanel ?displayPanel .
          OPTIONAL { ?dispComp gad:refreshRateHz ?refreshRateHz . }
        }

        OPTIONAL { ?id gad:keyFeature ?keyFeature . }
        OPTIONAL { ?id gad:availableColor ?availableColor . }
        OPTIONAL { ?id gad:releaseYear ?releaseYear . }
        OPTIONAL { ?id gad:weightGr ?weightGr . }
        OPTIONAL { ?id gad:bodyMaterial ?bodyMaterial . }

        OPTIONAL {
          ?id gad:hasComponent ?gpuComp .
          ?gpuComp gad:vramSize ?vram .
          OPTIONAL { ?gpuComp gad:supportsCUDA ?supportsCUDA . }
        }

        OPTIONAL {
          ?id gad:hasComponent ?socComp .
          OPTIONAL { ?socComp gad:supportsNPU ?supportsNPU . }
        }
      }
      ORDER BY ?categoryLabel ?price
    `;

    const data = await queryOntology(owlPath, query);

    // Normalisasi requirements (biar selalu string)
    const normalized = (Array.isArray(data) ? data : []).map((item) => ({
      ...item,
      requirements: item.requirements ? String(item.requirements) : '',
    }));

    console.log('[API] Query result count:', Array.isArray(normalized) ? normalized.length : 0);
    if (Array.isArray(normalized) && normalized.length > 0) {
      console.log('[API] Sample result item:', JSON.stringify(normalized[0], null, 2));
      
      // Debug: Check items with VRAM
      const itemsWithVram = normalized.filter(item => item.vram);
      console.log('[API] Items with VRAM:', itemsWithVram.length);
      if (itemsWithVram.length > 0) {
        console.log('[API] Sample with VRAM:', itemsWithVram[0]);
      }
      
      // Debug: Check CUDA support
      const itemsWithCUDA = normalized.filter(item => item.supportsCUDA);
      console.log('[API] Items with CUDA support:', itemsWithCUDA.length);
      if (itemsWithCUDA.length > 0) {
        console.log('[API] Sample with CUDA:', itemsWithCUDA[0]);
      }
    }

    res.status(200).json(normalized);
  } catch (error) {
    console.error('[API] Error occurred:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({ error: 'Gagal memuat data', details: error.message });
  }
}
