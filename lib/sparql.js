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
    console.log('[SPARQL] Reading ontology file:', fullPath);
    
    let fileContent;
    try {
      fileContent = fs.readFileSync(fullPath, 'utf-8');
      console.log('[SPARQL] File read successfully, size:', fileContent.length, 'bytes');
    } catch (err) {
      console.error('[SPARQL] Failed to read file:', err.message);
      throw err;
    }

    const parser = new Parser();
    let quads = [];
    try {
        quads = parser.parse(fileContent);
        console.log('[SPARQL] Parsed quads:', quads.length);
    } catch (err) {
        console.error('[SPARQL] Failed to parse ontology:', err.message);
        throw err;
    }

    const store = new Store();
    store.addQuads(quads);
    console.log('[SPARQL] Store created with quads:', store.size);
    
    console.log('[SPARQL] Executing SPARQL query...');
    console.log('[SPARQL] Query (first 200 chars):', sparqlQuery.substring(0, 200) + '...');
    
    const bindingsStream = await myEngine.queryBindings(sparqlQuery, { 
        sources: [store] 
    });

    const bindings = await bindingsStream.toArray();
    console.log('[SPARQL] Query returned bindings:', bindings.length);
    
    if (bindings.length > 0) {
      console.log('[SPARQL] Sample binding (first result):', 
        Array.from(bindings[0]).map(([v, t]) => `${v.value}=${t.value}`).join(', '));
    }

    const results = bindings.map(binding => {
        const obj = {};
        for (const [variable, term] of binding) {
            obj[variable.value] = term.value; 
        }
        return obj;
    });
    
    console.log('[SPARQL] Converted to JSON objects:', results.length);
    return results;
}