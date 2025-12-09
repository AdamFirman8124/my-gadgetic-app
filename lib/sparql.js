import { QueryEngine } from '@comunica/query-sparql';
import { N3Parser } from 'n3';
import * as fs from 'fs';
import * as path from 'path';

// Engine Comunica untuk query SPARQL
const myEngine = new QueryEngine();

/**
 * Memuat file OWL/RDF lokal, mem-parse-nya, dan menjalankan query SPARQL.
 * @param {string} filePath - Path ke file OWL (misalnya, 'kelas.owl')
 * @param {string} sparqlQuery - Query SPARQL yang akan dijalankan
 */
export async function queryOntology(filePath, sparqlQuery) {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');

    // N3.js parser untuk mem-parse konten Turtle/RDF
    const parser = new N3Parser();
    const quads = parser.parse(fileContent);
    
    // Melakukan query terhadap quads yang telah di-parse
    const result = await myEngine.query(sparqlQuery, { 
        sources: [{ type: 'rdfjsSource', value: quads }] 
    });

    const bindings = await result.bindings();
    return bindings.map(binding => {
        // Konversi binding ke object JavaScript
        const obj = {};
        for (const [key, value] of binding) {
            obj[key.value] = value.value; // key.value adalah nama variabel (misal 'g')
        }
        return obj;
    });
}