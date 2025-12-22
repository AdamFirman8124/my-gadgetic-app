import { queryOntology } from '../../lib/sparql';

const PREFIXES = `
  PREFIX : <http://example.org/gadgetic#>
  PREFIX gad: <http://example.org/gadgetic#>
  PREFIX owl: <http://www.w3.org/2002/07/owl#>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
`;

export default async function handler(req, res) {
  try {
    console.log('[API] Request received for /api/recommendations');
    const owlPath = 'lib/ontology/kelas.owl';
    console.log('[API] Using ontology path:', owlPath);

    const query = `
      ${PREFIXES}
                  SELECT ?id ?name ?categoryLabel ?brandName ?os ?ram ?ramTech ?storage ?storageTech ?price ?flightTime ?battery ?batteryWh
                    ?cameraMP ?sensorFormat ?ibis ?video4k ?displayPanel ?refreshRateHz ?keyFeature ?availableColor ?releaseYear ?weightGr ?bodyMaterial ?vram ?supportsCUDA ?supportsNPU
      WHERE {
        ?id a ?type .
        ?type rdfs:subClassOf* gad:Gadget .
        FILTER NOT EXISTS { ?type a owl:Class . ?type owl:equivalentClass ?other . } .
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

        # --- SPEK LAPTOP/HP ---
        OPTIONAL {
          ?id gad:hasComponent ?ramComp .
          ?ramComp a gad:RAM ;
                   gad:ramSize ?ram .
          OPTIONAL { ?ramComp gad:ramTechnology ?ramTech . }
        }
        OPTIONAL {
          ?id gad:hasComponent ?storageComp .
          ?storageComp a gad:Storage ;
                       gad:storageSizeGB ?storage .
          OPTIONAL { ?storageComp gad:storageTechnology ?storageTech . }
        }

        # --- SPEK DRONE ---
        OPTIONAL { ?id gad:maxFlightTimeMin ?flightTime . }

        # --- SPEK BATERAI (UMUM) ---
        OPTIONAL {
          ?id gad:hasComponent ?batComp .
          ?batComp gad:batteryCapacitymAh ?battery .
          OPTIONAL { ?batComp gad:batteryCapacityWh ?batteryWh . }
        }

        # --- SPEK KAMERA / MIRRORLESS / HP ---
        OPTIONAL { 
            ?id gad:hasComponent ?camComp .
            # Gunakan UNION untuk menangkap berbagai properti komponen kamera
            { ?camComp gad:cameraMegapixel ?cameraMP . }
            UNION
            { ?camComp gad:sensorFormat ?sensorFormat . }
            UNION
            { ?camComp gad:ibis ?ibis . }
            UNION
            { ?camComp gad:video4k60 ?video4k . }
        }

        # Display component
        OPTIONAL {
          ?id gad:hasComponent ?dispComp .
          ?dispComp a gad:Display ;
                   gad:displayPanel ?displayPanel .
          OPTIONAL { ?dispComp gad:refreshRateHz ?refreshRateHz . }
        }

        OPTIONAL { ?id gad:keyFeature ?keyFeature . }
        OPTIONAL { ?id gad:availableColor ?availableColor . }
        OPTIONAL { ?id gad:releaseYear ?releaseYear . }
        OPTIONAL { ?id gad:weightGr ?weightGr . }
        OPTIONAL { ?id gad:bodyMaterial ?bodyMaterial . }

        # GPU specifics
        OPTIONAL {
          ?id gad:hasComponent ?gpuComp .
          ?gpuComp a gad:GPU ;
                   gad:vramSize ?vram .
          OPTIONAL { ?gpuComp gad:supportsCUDA ?supportsCUDA . }
        }

        # SoC / NPU
        OPTIONAL {
          ?id gad:hasComponent ?socComp .
          ?socComp a gad:SoC .
          OPTIONAL { ?socComp gad:supportsNPU ?supportsNPU . }
        }
      }
      ORDER BY ?categoryLabel ?price
    `;

    const data = await queryOntology(owlPath, query);
    console.log('[API] Query result count:', Array.isArray(data) ? data.length : 0);
    if (Array.isArray(data) && data.length > 0) {
      console.log('[API] Sample result item:', JSON.stringify(data[0], null, 2));
    }
    console.log('[API] Sending response with', data.length, 'items');
    res.status(200).json(data);

  } catch (error) {
    console.error('[API] Error occurred:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({ error: 'Gagal memuat data', details: error.message });
  }
}