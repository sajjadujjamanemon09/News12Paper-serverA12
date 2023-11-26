const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hepooac.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const articleCollection = client.db("newsPaper").collection("title");
    const publisherCollection = client.db("newsPaper").collection("publisher");


        // tittle related apis
        app.post('/title', async (req, res) => {
          const item = req.body;
          const result = await articleCollection.insertOne(item);
          res.send(result);
        });

        app.get('/title', async (req, res) => {
          const result = await articleCollection.find().toArray();
          res.send(result);
        });
    
        // app.get('/title/:id', async (req, res) => {
        //   const id = req.params.id;
        //   const query = { _id: new ObjectId(id) }
        //   const result = await articleCollection.findOne(query);
        //   res.send(result);
        // })
    

    
        // app.patch('/title/:id', async (req, res) => {
        //   const item = req.body;
        //   const id = req.params.id;
        //   const filter = { _id: new ObjectId(id) }
        //   const updatedDoc = {
        //     $set: {
        //       name: item.name,
        //       category: item.category,
        //       price: item.price,
        //       recipe: item.recipe,
        //       image: item.image
        //     }
        //   }
    
        //   const result = await articleCollection.updateOne(filter, updatedDoc)
        //   res.send(result);
        // })
    
        // app.delete('/title/:id', async (req, res) => {
        //   const id = req.params.id;
        //   const query = { _id: new ObjectId(id) }
        //   const result = await articleCollection.deleteOne(query);
        //   res.send(result);
        // })


        // publisher collection
        // app.post('/publisher', async (req, res) => {
        //   const item = req.body;
        //   const result = await publisherCollection.insertOne(item);
        //   res.send(result);
        // });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// server connection for all project
app.get("/", (req, res) => {
  res.send("setUp server running");
});
app.listen(port, () => {
  console.log(`setUp project server running on PORT: ${port}`);
});
