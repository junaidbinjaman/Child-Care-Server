const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId
const fileupload = require('express-fileupload');
const fs = require('fs-extra')
const e = require('express');
const { readFileSync } = require('fs-extra');

const uri = "mongodb+srv://babyCare:jwolt65859j@cluster0.raxaw.mongodb.net/assignment-11?retryWrites=true&w=majority";

const app = express();
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('ReviewProvider'));
app.use(express.static('ServiceImages'));
app.use(fileupload())

const port = 8000;

app.get('/', (req, res) => {
    res.send("Hello World")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("assignment-11").collection("orderList");
    const reviewCollection = client.db("assignment-11").collection("reviewCollection");
    const serviceCollection = client.db("assignment-11").collection("serviceCollection");
    const adminCollection = client.db("assignment-11").collection("adminCollection");

    console.log('DB Connected Successfully')

    app.post('/addOrder', (req, res) => {
        const name = req.body.name;
        const email = req.body.email;
        const serviceTitle = req.body.serviceTitle;
        const cardBrand = req.body.cardBrand;
        const paymentId = req.body.paymentId;

        orderCollection.insertOne({ name, email, serviceTitle, cardBrand, paymentId })
            .then(result => {
                res.send(result.insertedCount)
            })
    })

    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/orderList', (req, res) => {
        const email = req.body.email
        orderCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name
        const email = req.body.companyName;
        const message = req.body.message;

        const filePath = `${__dirname}/ReviewProvider/${file.name}`


        const newImg = req.files.file.data
        const encImg = newImg.toString('base64')


        const image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        }

        reviewCollection.insertOne({ name, email, message, img: image })
            .then(result => {
                res.status(500).send({ file: file.name })
            })

    })


    app.get('/allReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addService', (req, res) => {
        const file = req.files.file
        const name = req.body.name;
        const serviceTitle = req.body.serviceTitle;
        const serviceDetail = req.body.serviceDetail;

        const serviceFilePath = `${__dirname}/ServiceImages/${file.name}`

        file.mv(serviceFilePath, err => {
            if (err) {
                console.log(err)
                return res.status(500).send({ msg: 'sorry faild to upload image' })
            }
        })


        serviceCollection.insertOne({ name, serviceTitle, serviceDetail, img: file.name })
            .then(result => {
                res.status(500).send({ file: file.name })
            })
    })

    app.get('/allServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/makeAdmin', (req, res) => {
        const adminEmail = req.body.adminEmail
        adminCollection.insertOne({ adminEmail })
            .then(result => {
                res.status(500).send({ email: adminEmail })
            })
    })

    app.get('/admin/:adminSearch', (req, res) => {
        const adminEmail = req.params.adminSearch
        console.log(adminEmail)
        adminCollection.find({ adminEmail: adminEmail })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('/deleteService/:id', (req, res) => {
        const serviceId = req.params.id
        serviceCollection.deleteOne({ _id: ObjectId(serviceId) })
            .then(result => {
                console.log(result)
                res.send("hello")
            })
    })


});




app.listen(port)