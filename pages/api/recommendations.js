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
    const owlPath = 'lib/ontology/kelas.owl';

    const query = `
      ${PREFIXES}
      SELECT ?id ?name ?categoryLabel ?brandName ?os ?ram ?storage ?price ?flightTime ?battery 
             ?cameraMP ?sensorFormat ?ibis ?video4k
      WHERE {
        VALUES ?type { gad:Smartphone gad:Laptop gad:Drone gad:Smartwatch gad:Smartband gad:Headphones gad:AudioDevice gad:Mirrorless gad:Tablet }
        
        ?id a ?type .
        ?id rdfs:label ?name .
        BIND(STRAFTER(STR(?type), "#") AS ?categoryLabel)

        OPTIONAL { 
          ?id gad:hasBrand ?brand .
          ?brand rdfs:label ?brandName .
        }

        OPTIONAL { ?id gad:osName ?os . }
        OPTIONAL { ?id gad:priceIDR ?price . }

        # --- SPEK LAPTOP/HP ---
        OPTIONAL {
          ?id gad:hasComponent ?ramComp .
          ?ramComp a gad:RAM ;
                   gad:ramSize ?ram .
        }
        OPTIONAL {
          ?id gad:hasComponent ?storageComp .
          ?storageComp a gad:Storage ;
                       gad:storageSizeGB ?storage .
        }

        # --- SPEK DRONE ---
        OPTIONAL { ?id gad:maxFlightTimeMin ?flightTime . }

        # --- SPEK BATERAI (UMUM) ---
        OPTIONAL {
            ?id gad:hasComponent ?batComp .
            ?batComp gad:batteryCapacitymAh ?battery .
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
      }
      ORDER BY ?categoryLabel ?price
    `;

    const data = await queryOntology(owlPath, query);
    res.status(200).json(data);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Gagal memuat data', details: error.message });
  }
}