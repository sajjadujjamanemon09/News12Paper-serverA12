const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const stripe = require("stripe")(process.env.PAY_KEY);
const app = express();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken')

// middleware
app.use(cors({
  credentials:true,
  origin:[
    'https://assignment-12-c8954.web.app',
    'https://assignment-12-c8954.firebaseapp.com',
    'http://localhost:5173'
  ]
}));
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


const verifyToken = async (req, res, next) => {
  // console.log("inside verify token", req.headers);

  if (!req.headers.authorization) {
    return res.status(401).send({ message: "forbidden access" });
  }
  const token = req.headers.authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const articleCollection = client.db("newsPaper").collection("title");
    const publisherCollection = client.db("newsPaper").collection("publisher");
    const userCollection = client.db("newsPaper").collection("user");
    const declineCollection = client
      .db("newsPaper")
      .collection("declineMessage");

    // tittle related apis
    app.post("/title", async (req, res) => {
      const item = req.body;
      const result = await articleCollection.insertOne(item);
      res.send(result);
    });

    app.get("/title", async (req, res) => {
      const result = await articleCollection.find().toArray();
      res.send(result);
    });

    app.delete("/title/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articleCollection.deleteOne(query);
      res.send(result);
    });
    // approve

    app.get("/title/approve", async (req, res) => {
      const query = { status: "approve" };
      const result = await articleCollection.find(query).toArray();
      res.send(result);
    });

    // approve patch
    app.patch("/title/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const query = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await articleCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // my article route
    app.get("/title/myArticles", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await articleCollection.find(query).toArray();
      res.send(result);
    });
    // my article route delete
    app.delete("/title/myArticles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articleCollection.deleteOne(query);
      res.send(result);
    });

    // // get view details
    app.get("/title/viewDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articleCollection.findOne(query);
      res.send(result);
    });

    //
    app.get("/title/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await articleCollection.findOne(query);
      res.send(result);
    });
    // my article update
    app.patch("/title/update/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: data.title,
          image: data.image,
          publisher: data.publisher,
          tag: data.tag,
          description: data.description,
        },
      };
      const result = await articleCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // decline
    app.post("/declineMessage", async (req, res) => {
      const article = req.body;
      const result = await declineCollection.insertOne(article);
      res.send(result);
    });

    app.get("/declineMessage", async (req, res) => {
      const result = await declineCollection.find().toArray();
      res.send(result);
    });

    app.get("/premiumPlan",verifyToken, async (req, res) => {
      const quality = req.query.quality;
      const query = { quality: quality };
      const result = await articleCollection.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    app.patch("/title/premium/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          quality: "premium",
        },
      };
      const result = await articleCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // publisher API
    app.post("/publisher", async (req, res) => {
      const item = req.body;
      const result = await publisherCollection.insertOne(item);
      res.send(result);
    });

    app.get("/publisher", async (req, res) => {
      const result = await publisherCollection.find().toArray();
      res.send(result);
    });

    //user api

    app.post("/user", async (req, res) => {
      const item = req.body;
      const query = { email: item.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User Already Exist", insertedId: null });
      }
      const result = await userCollection.insertOne(item);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //!make  users
    app.patch("/user/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    //!get single user by email
    app.get("/user/admin/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user.role == "admin";
      }
      res.send({ admin });
    });

    // payment
    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: price * 100,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.patch("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const data = req.body;
      const updateDoc = {
        $set: {
          premiumTaken: data.premiumTaken,
          price: data.amount,
          transactionId: data.transactionId,
        },
      };
      const result = await userCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    app.get("/user/premiumPlan/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "250h",
      });
      res.send({ token });
    });

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
