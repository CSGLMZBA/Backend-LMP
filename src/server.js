import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import usersRoute from './routes/users.js'
dotenv.config()
const app = express()
// Example defining a route in Express
app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

// Example specifying the port and starting the server
const port = process.env.PORT || 3000// You can use environment variables for port configuration
app.use('/users', usersRoute)
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});