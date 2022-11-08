const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
//


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pbaqirc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const servicesCollection = client.db('infetech').collection('services');
    const reviewCollecton = client.db('infetech').collection('review');

    try{
        app.get('/services',async (req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result)
        })
        app.get('/allservices',async (req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/services/:id',async(req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)};
            const result = await servicesCollection.findOne(query);
            res.send(result)
        })

        app.post('/review',async(req,res)=>{
            const user = req.body;
            const result = await reviewCollecton.insertOne(user);
            res.send(result)
        })
    }
    finally{

    }
}
run().catch(err=> console.log(err))


//
app.get('/',(req,res)=>{
    res.send('server is running..!')
})





app.listen(port,()=>{
    console.log(`server running ${port}`);
})

//infetech
//rPbhMpAhefzL3KiH