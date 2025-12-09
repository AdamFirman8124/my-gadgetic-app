import { QueryEngine } from '@comunica/query-sparql';
import { Parser, Store } from 'n3'; 
import * as fs from 'fs';
import * as path from 'path';

// Engine Comunica untuk query SPARQL
const myEngine = new QueryEngine();

/**
 * Memuat file OWL/RDF lokal, mem-parse-nya, dan menjalankan query SPARQL.
 * @param {string} filePath - Path ke file OWL (relative dari root project)
 * @param {string} sparqlQuery - Query SPARQL yang akan dijalankan
 */
export async function queryOntology(filePath, sparqlQuery) {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');

    const parser = new Parser();
    const quads = parser.parse(fileContent);

    const store = new Store();
    store.addQuads(quads);
    
    // PERBAIKAN DISINI:
    // Gunakan 'queryBindings' (bukan 'query' biasa) untuk mendapatkan data hasil SELECT
    // Ini mengembalikan Stream Bindings
    const bindingsStream = await myEngine.queryBindings(sparqlQuery, { 
        sources: [store] 
    });

    // Ubah Stream menjadi Array
    const bindings = await bindingsStream.toArray();

    // Mapping hasil ke format JSON sederhana
    return bindings.map(binding => {
        const obj = {};
        // binding adalah Map, kita iterasi isinya
        for (const [variable, term] of binding) {
            // variable.value adalah nama variabel (misal 'hp')
            // term.value adalah nilainya (misal 'Samsung Galaxy')
            obj[variable.value] = term.value; 
        }
        return obj;
    });
}