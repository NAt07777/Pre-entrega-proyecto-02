//  Importo módulo MongoClient del paquete mongodb.
const {MongoClient} = require('mongodb');

//Módulo para trabajar con rutas y directorios.
const path = require('path');

//Importo dotenv para cargar variables de entorno en '.env'
require('dotenv').config({path: path.join(__dirname, '../.env')});

//preparo el cliente para establecer una conexión con MongoDB.
const client = new MongoClient(process.env.DATABASE_URL);

//Función para conectar a MongoDB.
async function connectToDB() {
console.log('\tConectando a MongoDB...');
    
    try {
        const connection = await client.connect();
        console.log('Se conecto correctamente');
        return client;
    } catch (error) {
        console.log('No se pudo establecer conexión a MongoDB');
        
    }
    return null;
};

//Función para desconectar de MongoDB.
async function desconnectDB() {
    try {
        await client.close();
        console.log('\tDesconectado de MongoDB');
    } catch (error) {
        console.log('No se a desconectado...');
        
    };
};

//Función para conectar la colección de la base de datos Prueba.
async function connectToCollection(collectionName) {
    const connection = await connectToDB();
    const db = connection.db(process.env.DATABASE_NAME);
    const collection = db.collection(collectionName);

    return collection;
};

//Función para generar un nuevo ID en el método post.
async function generateID(collection) {
    const docMaxId = await collection.find().sort({id: -1}).limit(1).toArray();
    const maxId = docMaxId[0]?.id ?? 0;

    return maxId + 1;
};

//Exportar elementos desde un módulo para utilizarlos en server.js.
module.exports = { desconnectDB, connectToCollection, generateID};