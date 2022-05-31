require('dotenv').config();
require('express-async-errors');

var path = require('path');
const express = require('express');
const app = express();
const fileUpload = require("express-fileupload");
// rest of the packages
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const cloudinary = require("cloudinary");

app.use(express.json());
app.use(
    fileUpload({
      useTempFiles: true,
    })
  );
  cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRT
  })
//connect to Database
const connectDB = require('./db/connect');

// routers
const userRouter = require('./routes/userRoute');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
    origin: "*"
}));
app.use(xss());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.send('<h1> Photographer App </h1>');
});


// routes
app.use('/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();