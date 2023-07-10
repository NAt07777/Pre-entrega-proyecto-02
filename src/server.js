//Importar módulo express
const express = require('express');

//Desestructuración para importar funciones de mongoDB.js.
const { desconnectDB,  connectToCollection, generateID } = require('./mongodb.js');

const server = express();

//Middleware que habilita el análisis de solicitudes entrantes en formato JSON.
server.use(express.json());
//Middleware que habilita el análisis de solicitudes entrantes codificadas en URL.
server.use(express.urlencoded({extended: true}));

//Obtener todas las frutas
server.get('/frutas', async (req, res) => {
    const {nombre, importe, stock} = req.query;
    const importeNumber = Number(importe);
    const stockNumber = Number(stock); 
    let frutas = [];
    
    try {
        const collection = await connectToCollection('frutas');
        if (nombre) frutas = await collection.find({nombre}).toArray();
        else if (importe) frutas = await collection.find({ importe: importeNumber }).toArray();
        else if (stock) frutas = await collection.find({stock: stockNumber}).toArray();
        else frutas = await collection.find().toArray();
        
        if (frutas.length === 0) {
            res.status(400).send('No se encontraron frutas que cumplan con los criterios de búsqueda');
        } else {
            res.status(200).send(JSON.stringify(frutas, null, '\t'));
        }
    } catch (error) {
            console.log(error.message);
            res.status(500).send('Hubo un error en el servidor, intentelo más tarde.');
    } finally {
            await desconnectDB();
            }
            
    }
);

//Obtener una fruta por ID:
server.get('/frutas/:id', async (req, res) =>{
const {id} = req.params;

try {
    const collection = await connectToCollection('frutas');
    const fruta = await collection.findOne({id: Number(id)});
    if (!fruta) return res.status(400).send('Id de fruta inexistente.')
    res.status(200).send(JSON.stringify(fruta, null));
} catch (error) {
    console.log(error.message);
    res.status(500). send('Error en el servidor.');
} finally {
    await desconnectDB();
}
});

//Crear fruta.
server.post('/frutas',  async (req, res) => {
    const { imagen, nombre, importe, stock}= req.body;

    if(!nombre || !importe || isNaN(importe) || !stock || isNaN(stock)) {
        return res.status(400).send('ERROR. Faltan datos o los valores ingresados no son correctos.');
    };

        try {
            const collection = await connectToCollection('frutas');
            let fruta = {id: await generateID(collection), nombre, importe, stock};

            if(imagen) fruta.imagen = imagen;

            await collection.insertOne(fruta);
            res.status(201).send(JSON.stringify(fruta, null, '\t'));
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Error en el servidor.')
        } finally {
            await desconnectDB();
        }
});

//Actualizar una fruta por id.
server.put('/frutas/:id', async (req, res) => {
    const {id} = req.params;
    const {imagen, nombre, importe, stock} = req.body;
    const fruta = {nombre, importe, stock};

    if(!id || !nombre || !importe || isNaN(importe) || !stock || isNaN(stock)) {
        return res.status(400).send('Error, faltan datos necesarios o los valores ingresados no son correctos.');
    };
    if(imagen) fruta.imagen = imagen;

    try {
        const collection = await connectToCollection('frutas');
        await collection.updateOne({id: Number(id)}, {$set: fruta});
        res.status(200).send(JSON.stringify(fruta, null, '\t'));
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error en el servidor.'); 
    } finally {
        await desconnectDB();
    }

});

//Modificar el precio de una fruta por id.
server.patch('/frutas/:id', async(req, res) => {
    const {id} = req.params;
    const {importe} = req.body;

    try {
        const collection = await connectToCollection('frutas');
        const fruta = await collection.findOne({id: {$eq: Number(id)}});
        if (!fruta) {
            res.status(400).send('No se encontro ninguna fruta con el id proporcionado.')
        } else {
            await collection.updateOne({ id: Number(id) }, { $set: { importe: Number(importe) } });
        res.status(200).send('El importe de la fruta se ha modificado correctamente.');
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error en el servidor.')
        
    } finally {
        await desconnectDB();
    }

});

//Borrar una fruta por id.
server.delete('/frutas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const collection = await connectToCollection('frutas');
        const fruta = await collection.findOne({id: {$eq: Number(id)}});
        if (!fruta) {
            res.status(400).send('No se encontro ninguna fruta con el id proporcionado.')
        } else { await collection.deleteOne({ id: {$eq: Number(id)} });
        res.status(204).send('La fruta se ha eliminado correctamente.');
    };
        
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error en el servidor.');
        
    } finally {
        await desconnectDB();
    }
});


// Control de rutas inexistentes.
server.use('*', (req, res) => {
    res.status(404).send(`<h1>Error 404</h1><h3>La URL indicada no existe en este servidor</h3>`);
});

// Método oyente de peteciones.
server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
console.log(`Ejecutandose en http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/frutas`);
});







