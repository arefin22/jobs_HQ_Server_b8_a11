const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

// const corsOption = {
//     origin: ['http://localhost:3000'],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
// }
// middlewares
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.m25rjlj.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const jobCollection = client.db("JOBsHQ").collection('jobs');
        const userCollection = client.db("JOBsHQ").collection('user');
        const applyCollection = client.db("JOBsHQ").collection('applications');


        // auth releted api
        // app.post('/jwt', async (req, res) => {
        //     const user = res.body;
        //     console.log(user);
        //     // const token = jwt.sign(user, 'secret', { expiresIn: "1hr" })
        //     res.send(user)
        // })


        // service Releted api



        // jobs Collection Starts

        app.get('/jobs', async (req, res) => {
            const result = await jobCollection.find().toArray();
            res.send(result)
        })


        app.get('/jobs/:userEmail', async (req, res) => {
            try {
                const userEmail = req.params.userEmail;
                const query = {
                    userEmail: userEmail,
                };
                const result = await jobCollection.find(query).toArray();
                console.log(result);
                if (!result) {
                    res.status(404).send('Item not found');
                    return;
                }
                res.send(result)
            }
            catch {
                console.error('Error:');
                res.status(500).send('Internal Server Error');
            }
        })


        app.post('/jobs', async (req, res) => {
            const job = req.body;
            // console.log(job);
            const result = await jobCollection.insertOne(job);
            res.send(result);
        })

        app.get('/jobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = {
                    _id: new ObjectId(id),
                };
                const result = await jobCollection.findOne(query);
                console.log(result);
                if (!result) {
                    res.status(404).send('Item not found');
                    return;
                }
                res.send(result)
            }
            catch {
                console.error('Error:');
                res.status(500).send('Internal Server Error');
            }
        })
        app.patch('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedItem = {
                $set: {
                    // jobTitle, postedBy, salaryFrom, salaryTo, jobCategory, photoUrl, applicant, description, postedOn, expiresOn
                    jobTitle: data.jobTitle,
                    postedBy: data.postedBy,
                    salaryFrom: data.salaryFrom,
                    salaryTo: data.salaryTo,
                    jobCategory: data.jobCategory,
                    description: data.description,
                    photoUrl: data.photoUrl,
                    applicant: data.applicant,
                    postedOn: data.postedOn,
                    expiresOn: data.expiresOn,
                },
            };
            const result = await jobCollection.updateOne(
                filter,
                updatedItem,
                options
            );
            res.send(result);
        })


        app.delete('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await jobCollection.deleteOne(query)
            res.send(result)
        })



        // Job Collection Finised


        // User Collection Starts Here

        app.get('/user', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        // Connections % of configured limit has gone above 80

        // user Collection Finishes Here


        // apply Collection Start Here
        app.get('/applications', async (req, res) => {
            console.log(req.query.email);
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await applyCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/applications', async (req, res) => {
            const application = req.body;
            console.log(application);
            const result = await applyCollection.insertOne(application);
            res.send(result)
        })



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
