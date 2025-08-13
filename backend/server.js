const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({quiet:true});


const app = express();

app.use(cors());
app.use(express.json());



mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo DB conneted !!"))
.then(()=> {
    app.listen(process.env.PORT || 5000, ()=>
    console.log(`Server Running on port ${process.env.PORT || 5000}`));
})

.catch((err)=> console.log(err));