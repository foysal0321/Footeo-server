const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const jwt = require('jsonwebtoken');

const app = express();
//middle
app.use(cors());
app.use(express.json());

//verify jwt token
function verifyJwt (req,res,next){
    const authHead = req.headers.authorization;
    if(!authHead){
        return res.status(401).send({message: 'Unauthorization access'});       
    }
    const token = authHead.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
          return  res.status(401).send({message: 'Unauthorization access'}); 
        }
        req.decoded = decoded;
        next();
    })
}
//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pbaqirc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    const servicesCollection = client.db('infetech').collection('services');
    const reviewCollecton = client.db('infetech').collection('review');

    try{
        //read 3 services
        app.get('/services',async (req,res)=>{
            const query = {};
            let cursor = servicesCollection.find(query);
            let result = await cursor.limit(3).toArray();
            result.reverse()
            res.send(result)
        })

        //read all services
        app.get('/allservices',async (req,res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        //read dynamic services
        app.get('/services/:id',async(req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)};
            const result = await servicesCollection.findOne(query);
            res.send(result)
        })

        //send services
        app.post('/services', async(req,res)=>{
            const user = req.body;
            const result = await servicesCollection.insertOne(user);
            res.send(result)
        })

        //send reviews
        app.post('/review',verifyJwt, async(req,res)=>{
            const user = req.body;
            const result = await reviewCollecton.insertOne(user);
            res.send(result)
        })

        //read review
        app.get('/review',verifyJwt, async (req,res)=>{
            const decode = req.decoded;
            if(decode.email !== req.query.email){
                res.status(403).send({message: 'Unauthorization access'}); 
            }
            let query = {};
            if(req.query.email){
                query = {
                    email : req.query.email
                }
            }
           // console.log(req.query.email);
            const cursor = reviewCollecton.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        //delete review
        app.delete('/review/:id',verifyJwt, async(req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)};
            const result = await reviewCollecton.deleteOne(query);
            res.send(result);
        })

        //update review
        app.put('/review/:id',verifyJwt, async (req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)};
            const user = req.user;
            const options = {upsert: true};
            const updateDoc ={
                $set:{
                    // title: user.title,
                    // rating: user.rating,
                    // img: user.img,
                    message: user.email,
                
                }
            }                   
            const result = await reviewCollecton.updateOne(query,updateDoc, options);
            res.send(result)
            //console.log(result);
        })

        app.get('/review/:id',verifyJwt, async(req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)};
            const result = await reviewCollecton.findOne(query);
            res.send(result)
            //console.log(req.params);
        })

        //jwt token
        app.post('/jwt',(req,res)=>{
            const user = req.body;
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
            res.send({token})
           // console.log(user);
        })
    }
    finally{

    }
}
run().catch(err=> console.log(err));


    //read server running
    app.get('/',(req,res)=>{
        res.send('server is running..!')
    })


    app.listen(port,()=>{
        console.log(`server running ${port}`);
    });
