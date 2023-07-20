import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { nanoid } from 'nanoid';
dotenv.config();

const app = express(),
  port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    client.connect();

    const database = client.db('shortener'),
      urls = database.collection('urls');

      app.get('/', (req, res) => {
        res.send(`<main>
        <h1>Hi, I'm Johurul!</h1>
        <p>An aspiring front-end dev, creating high quality web apps.</p>
        <a href="https://www.linkedin.com/in/johurul-haque/">Linkedin</a>
        </main>`);
      });

      app.post('/', async (req, res) => {
        if (!req.body.url) {
          return res.status(400).send({
            status: 400,
            error: 'URL is required',
          });
        }

        const shortId = nanoid(8);

        await urls.insertOne({
          shortId,
          redirectUrl: req.body.url,
        });

        res.status(200).send({ status: 200, id: shortId });
      });

      app.get('/:id', async (req, res) => {
        const entry = await urls.findOne({
          shortId: req.params.id,
        });

        if (!entry)
          return res.status(404).send({
            status: 404,
            error: 'No such entry',
          });

        res.redirect(entry.redirectUrl);
      });

    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`Server listening on port ${port}`));
