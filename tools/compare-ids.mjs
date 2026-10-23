import { readFileSync } from 'fs';
import https from 'https';
import { PRODUCTS_CATALOG } from '../js/products-data.js';

function parseFirestoreFields(fields) {
  const result = {};
  for (const [key, val] of Object.entries(fields)) {
    if (val.stringValue !== undefined) result[key] = val.stringValue;
    else if (val.integerValue !== undefined) result[key] = parseInt(val.integerValue, 10);
    else if (val.doubleValue !== undefined) result[key] = parseFloat(val.doubleValue);
    else if (val.booleanValue !== undefined) result[key] = val.booleanValue;
    else if (val.arrayValue !== undefined) {
      result[key] = (val.arrayValue.values || []).map(v => {
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
        return v;
      });
    } else if (val.mapValue !== undefined) {
      result[key] = parseFirestoreFields(val.mapValue.fields || {});
    }
  }
  return result;
}

async function fetchFirestoreProducts() {
  return new Promise((resolve, reject) => {
    https.get('https://firestore.googleapis.com/v1/projects/ms-store-9c263/databases/(default)/documents/products?pageSize=100', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const docs = (json.documents || []).map(doc => {
            const fields = parseFirestoreFields(doc.fields || {});
            const docId = doc.name.split('/').pop();
            return {
              docId,
              idField: fields.id,
              name: fields.name,
              category: fields.category,
              rawFields: fields
            };
          });
          resolve(docs);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Local PRODUCTS_CATALOG count: ${PRODUCTS_CATALOG.length}`);
  const localIds = PRODUCTS_CATALOG.map(p => p.id);
  console.log('Local IDs:', localIds);

  const firestoreDocs = await fetchFirestoreProducts();
  console.log(`Firestore documents count: ${firestoreDocs.length}`);

  console.log('\n--- FIRESTORE DOCUMENTS DETAIL ---');
  firestoreDocs.forEach(d => {
    const mismatch = d.docId !== d.idField ? ` [MISMATCH: docId=${d.docId} vs idField=${d.idField}]` : '';
    console.log(`docId: "${d.docId}", idField: "${d.idField}", name: "${d.name}"${mismatch}`);
  });

  console.log('\n--- COMPARISON LOCAL VS FIRESTORE ---');
  const firestoreDocIds = firestoreDocs.map(d => d.docId);
  const firestoreIdFields = firestoreDocs.map(d => d.idField);

  // Missing in Firestore
  const missingInFirestore = localIds.filter(id => !firestoreDocIds.includes(id));
  console.log('Local IDs missing in Firestore docIds:', missingInFirestore);

  // Extra in Firestore
  const extraInFirestore = firestoreDocIds.filter(id => !localIds.includes(id));
  console.log('Firestore docIds not in local catalog:', extraInFirestore);

  // Check document ID != idField
  const fieldMismatches = firestoreDocs.filter(d => d.docId !== d.idField);
  console.log('Firestore docs where docId != idField:', fieldMismatches.map(d => ({ docId: d.docId, idField: d.idField, name: d.name })));
}

run().catch(console.error);
