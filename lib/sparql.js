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
    const fileContent = fs.readFileSync(fullPath, 'utf-8');

    const parser = new Parser();
    const quads = parser.parse(fileContent);

    const store = new Store();
    store.addQuads(quads);
    
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