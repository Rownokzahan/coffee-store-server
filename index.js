const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// midleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jxgrj34.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db("coffeeDB").collection("coffee");

        app.get('/coffee', async (req, res) => {
            const result = await coffeeCollection.find().toArray();
            res.send(result);
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        app.post('/coffee', async(req,res)=> {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        })

        app.delete('/coffee/:id', async(req,res)=> {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const {
                updated_name,
                updated_supplier,
                updated_category,
                updated_chef,
                updated_taste,
                updated_details,
                updated_photo
            } = req.body;

            const updateCoffee = {
                $set: {
                    name : updated_name,
                    supplier : updated_supplier,
                    category : updated_category,
                    chef : updated_chef,
                    taste : updated_taste,
                    details : updated_details,
                    photo : updated_photo,
                },
            };
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const result = await coffeeCollection.updateOne(filter, updateCoffee, options);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send({message : "Coffee Store Server is running"})
})

app.listen(port, () =>{
    console.log(`Server is running on port : ${port}`);
})
