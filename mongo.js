const { MongoClient } = require('mongodb');

let client = null;
let db = null;

const DB_NAME = process.env.MONGO_DB_NAME || 'petshop_prado';

async function connect() {
  if (db) return db;

  const mode = process.env.MONGO_MODE || 'local';
  let uri;

  if (mode === 'atlas' && process.env.MONGO_ATLAS_URI) {
    uri = process.env.MONGO_ATLAS_URI;
    console.log('[MONGO] Conectando ao MongoDB Atlas...');
  } else {
    uri = process.env.MONGO_LOCAL_URI || 'mongodb://localhost:27017';
    console.log('[MONGO] Conectando ao MongoDB local...');
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(DB_NAME);

    await db.command({ ping: 1 });
    console.log(`[MONGO] Conectado com sucesso! Database: ${DB_NAME}`);

    return db;
  } catch (err) {
    console.error('[MONGO] Erro ao conectar:', err.message);
    throw err;
  }
}

function getDb() {
  if (!db) throw new Error('MongoDB nao conectado. Chame connect() primeiro.');
  return db;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[MONGO] Conexao fechada.');
  }
}

// Colecoes
function col(name) {
  return getDb().collection(name);
}

// Busca todos os documentos de uma colecao
async function findAll(collectionName, query = {}) {
  return await col(collectionName).find(query).toArray();
}

// Busca um documento por filtro
async function findOne(collectionName, query) {
  return await col(collectionName).findOne(query);
}

// Busca um documento por ID
async function findById(collectionName, id) {
  return await col(collectionName).findOne({ _id: id });
}

// Insere um documento
async function insertOne(collectionName, doc) {
  const result = await col(collectionName).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Insere multiplos documentos
async function insertMany(collectionName, docs) {
  if (docs.length === 0) return [];
  const result = await col(collectionName).insertMany(docs);
  return result;
}

// Atualiza um documento
async function updateOne(collectionName, query, update) {
  return await col(collectionName).updateOne(query, { $set: update });
}

// Substitui um documento inteiro
async function replaceOne(collectionName, query, doc) {
  return await col(collectionName).replaceOne(query, doc, { upsert: true });
}

// Deleta um documento
async function deleteOne(collectionName, query) {
  return await col(collectionName).deleteOne(query);
}

// Conta documentos
async function countDocuments(collectionName, query = {}) {
  return await col(collectionName).countDocuments(query);
}

// Cria indice unico
async function createIndex(collectionName, field, unique = true) {
  return await col(collectionName).createIndex({ [field]: 1 }, { unique });
}

// Bulk write (operacoes em lote)
async function bulkWrite(collectionName, operations) {
  if (operations.length === 0) return null;
  return await col(collectionName).bulkWrite(operations, { ordered: false });
}

module.exports = {
  connect,
  getDb,
  close,
  col,
  findAll,
  findOne,
  findById,
  insertOne,
  insertMany,
  updateOne,
  replaceOne,
  deleteOne,
  countDocuments,
  createIndex,
  bulkWrite
};
