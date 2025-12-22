import { QueryEngine } from '@comunica/query-sparql';
import { Parser, Store } from 'n3'; 
import * as fs from 'fs';
import * as path from 'path';

const myEngine = new QueryEngine();

/**
 * @param {string} filePath - Path ke file OWL (relative dari root project)
 * @param {string} sparqlQuery - Query SPARQL yang akan dijalankan
 */
export async function queryOntology(filePath, sparqlQuery) {
    const fullPath = path.join(process.cwd(), filePath);
    console.log('[sparql] Reading ontology file:', fullPath);
    const fileContent = fs.readFileSync(fullPath, 'utf-8');

    const parser = new Parser();
    let quads = [];
    try {
        quads = parser.parse(fileContent);
        console.log('[sparql] Parsed quads:', quads.length);
    } catch (err) {
        console.error('[sparql] Failed to parse ontology:', err && err.message ? err.message : err);
        throw err;
    }

    const store = new Store();
    store.addQuads(quads);
    console.log('[sparql] Store contains quads:', store.size);
    
    const bindingsStream = await myEngine.queryBindings(sparqlQuery, { 
        sources: [store] 
    });

    const bindings = await bindingsStream.toArray();

    return bindings.map(binding => {
        const obj = {};
        for (const [variable, term] of binding) {
            obj[variable.value] = term.value; 
        }
        return obj;
    });
}