require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const cors = require('cors');


app.use(cors());
app.use(express.json());

// users routes
const usersRoutes = require('./routes/users.route');
app.use('/users',usersRoutes);

// jobs routes
const jobsRoutes = require('./routes/jobs.route');
app.use('/jobs',jobsRoutes);


// profile routes
const profileRotes = require('./routes/profiles.route');
app.use('/profile',profileRotes);

// applications routes
const applicationRoutes = require('./routes/applications.route');
app.use('/aplication',applicationRoutes);

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
}); 
