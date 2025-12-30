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
        (GROUP_CONCAT(DISTINCT ?reqLabel; separator=", ") AS ?requirements)
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
          { ?camComp gad:cameraMegapixel ?cameraMP . }
          UNION
          { ?camComp gad:sensorFormat ?sensorFormat . }
          UNION
          { ?camComp gad:ibis ?ibis . }
          UNION
          { ?camComp gad:video4k60 ?video4k . }
        }

        # --- DISPLAY ---
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

        # --- GPU ---
        OPTIONAL {
          ?id gad:hasComponent ?gpuComp .
          ?gpuComp a gad:GPU ;
                   gad:vramSize ?vram .
          OPTIONAL { ?gpuComp gad:supportsCUDA ?supportsCUDA . }
        }

        # --- SoC / NPU ---
        OPTIONAL {
          ?id gad:hasComponent ?socComp .
          ?socComp a gad:SoC .
          OPTIONAL { ?socComp gad:supportsNPU ?supportsNPU . }
        }

        ######################################################################
        # "GOAL SWRL" (gad:meetsRequirement) -> ditiru dengan SPARQL UNION
        # Outputnya: ?reqLabel kemudian digabung menjadi ?requirements
        ######################################################################
        OPTIONAL {
          {
            # Training_Model_AI:
            # GPU supportsCUDA true AND VRAM >= 8
            ?id gad:hasComponent ?g1 .
            ?g1 a gad:GPU ;
                gad:supportsCUDA true ;
                gad:vramSize ?v1 .
            FILTER(xsd:decimal(?v1) >= 8)
            BIND("Training_Model_AI" AS ?reqLabel)
          }
          UNION
          {
            # Video_Editing:
            # RAM >= 16 AND Storage >= 512
            ?id gad:hasComponent ?r2 .
            ?r2 a gad:RAM ; gad:ramSize ?ram2 .
            ?id gad:hasComponent ?s2 .
            ?s2 a gad:Storage ; gad:storageSizeGB ?stor2 .
            FILTER(xsd:decimal(?ram2) >= 16 && xsd:decimal(?stor2) >= 512)
            BIND("Video_Editing" AS ?reqLabel)
          }
          UNION
          {
            # Gaming_1440p:
            # VRAM >= 6
            ?id gad:hasComponent ?g3 .
            ?g3 a gad:GPU ; gad:vramSize ?v3 .
            FILTER(xsd:decimal(?v3) >= 6)
            BIND("Gaming_1440p" AS ?reqLabel)
          }
          UNION
          {
            # Mobile_Build:
            # BatteryWh >= 50 OR battery mAh >= 5000 (fallback)
            FILTER(
              (BOUND(?batteryWh) && xsd:decimal(?batteryWh) >= 50) ||
              (BOUND(?battery) && xsd:decimal(?battery) >= 5000)
            )
            BIND("Mobile_Build" AS ?reqLabel)
          }
          UNION
          {
            # Mobile_Photo_Video:
            # CameraMP >= 48 OR Video4k true
            FILTER(
              (BOUND(?cameraMP) && xsd:decimal(?cameraMP) >= 48) ||
              (BOUND(?video4k) && (lcase(str(?video4k)) = "true" || str(?video4k) = "1"))
            )
            BIND("Mobile_Photo_Video" AS ?reqLabel)
          }
          UNION
          {
            # Premium_Device_Status:
            # Price >= 15.000.000
            FILTER(BOUND(?price) && xsd:decimal(?price) >= 15000000)
            BIND("Premium_Device_Status" AS ?reqLabel)
          }
          UNION
          {
            # Aerial_Videography:
            # Drone OR category contains "drone"
            FILTER(CONTAINS(LCASE(STR(?categoryLabel)), "drone"))
            BIND("Aerial_Videography" AS ?reqLabel)
          }
          UNION
          {
            # Wrist_Health_Tracking:
            # watch/band category
            FILTER(
              CONTAINS(LCASE(STR(?categoryLabel)), "watch") ||
              CONTAINS(LCASE(STR(?categoryLabel)), "band")
            )
            BIND("Wrist_Health_Tracking" AS ?reqLabel)
          }
          UNION
          {
            # Advanced_AI_Training (lebih kompatibel dengan data yang ada):
            ?id gad:hasComponent ?gpuA .
            ?gpuA a gad:GPU ;
                  gad:supportsCUDA true .
            BIND("Advanced_AI_Training" AS ?reqLabel)
          }
        }
      }
      GROUP BY
        ?id ?name ?categoryLabel ?brandName
        ?os ?ram ?ramTech ?storage ?storageTech ?price
        ?flightTime ?battery ?batteryWh
        ?cameraMP ?sensorFormat ?ibis ?video4k
        ?displayPanel ?refreshRateHz
        ?keyFeature ?availableColor ?releaseYear ?weightGr ?bodyMaterial
        ?vram ?supportsCUDA ?supportsNPU
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
    }

    res.status(200).json(normalized);
  } catch (error) {
    console.error('[API] Error occurred:', error);
    console.error('[API] Error stack:', error.stack);
    res.status(500).json({ error: 'Gagal memuat data', details: error.message });
  }
}
