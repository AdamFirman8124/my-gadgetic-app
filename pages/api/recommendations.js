import { queryOntology } from '../../lib/sparql';

// Definisikan Prefixes Anda
const prefixes = `
    PREFIX gad: <http://example.org/gadgetic#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
`;

// Query SPARQL untuk mendapatkan semua Gadget yang direkomendasikan untuk Content Creator
// Gadget direkomendasikan jika memenuhi setidaknya satu workload yang diprioritaskan
const SPARQL_QUERY = `
    ${prefixes}
    SELECT DISTINCT ?gadgetLabel ?osName
    WHERE {
        ?gadget a gad:RecommendedFor_KreatorKonten .
        ?gadget rdfs:label ?gadgetLabel .
        OPTIONAL { ?gadget gad:osName ?osName . }
    }
`;

export default async function handler(req, res) {
    try {
        const results = await queryOntology('kelas.owl', SPARQL_QUERY);
        
        // Sesuaikan format output untuk kemudahan frontend
        const formattedResults = results.map(item => ({
            label: item['gadgetLabel'],
            os: item['osName'] || 'N/A'
        }));
        
        res.status(200).json(formattedResults);
    } catch (error) {
        console.error("SPARQL Query Error:", error);
        res.status(500).json({ 
            error: 'Failed to execute SPARQL query',
            details: error.message 
        });
    }
}