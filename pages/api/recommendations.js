import { queryOntology } from '../../lib/sparql';
import path from 'path';

const prefixes = `
    PREFIX gad: <http://example.org/gadgetic#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
`;

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
    // pastikan path OWL benar untuk Vercel
    const owlPath = path.join(process.cwd(), 'ontology', 'kelas.owl');
    const raw = await queryOntology(owlPath, SPARQL_QUERY);

    console.log('SPARQL raw result type:', typeof raw);

    // sesuaikan dengan struktur sebenarnya
    const rows = Array.isArray(raw)
      ? raw
      : Array.isArray(raw.results?.bindings)
      ? raw.results.bindings
      : [];

    const formattedResults = rows.map((item) => {
      const gadgetLabel =
        item.gadgetLabel?.value ?? item.gadgetLabel ?? item['gadgetLabel'];
      const osName = item.osName?.value ?? item.osName ?? item['osName'];

      return {
        label: gadgetLabel,
        os: osName || 'N/A',
      };
    });

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('SPARQL Query Error:', error);
    res.status(500).json({
      error: 'Failed to execute SPARQL query',
      details: error.message,
    });
  }
}
