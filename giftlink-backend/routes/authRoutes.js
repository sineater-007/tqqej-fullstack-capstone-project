//Step 1 - Task 2: Import necessary packages
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger
const { body, validationResult } = require('express-validator');

//Step 1 - Task 3: Create a Pino logger instance
const logger = pino();  // Create a Pino logger instance

//Step 1 - Task 4: Create JWT secret
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();
        // Task 2: Access MongoDB collection
        const collection = db.collection("users");
        //Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email = req.body.email;
        // {{insert code here}} //Task 4: Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });
         // {{insert code here}} //Task 5: Create JWT authentication with user._id as payload
        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({authtoken,email});
    } catch (e) {
         return res.status(500).send('Internal server error');
    }

router.post('/login', async (req, res) => {
    try {
        const db = await connectToDatabase();// Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`.
        const collection = db.collection("users");// Task 2: Access MongoDB `users` collection
        const theUser = await collection.findOne({ email: req.body.email });// Task 3: Check for user credentials in database
        if (theUser) {
            let result = await bcryptjs.compare(req.body.password, theUser.password)
            if(!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong pasword' });
            }// Task 4: Task 4: Check if the password matches the encrypyted password and send appropriate message on mismatch
            //continue other tasks
            const userName = theUser.firstName;
            const userEmail = theUser.email;// Task 5: Fetch user details from database
            let payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };
         const authtoken = jwt.sign(payloadd, JWT_SECRET)// Task 6: Create JWT authentication if passwords match with user._id as payload
        logger.info('User logged in successfully');
        return res.json({authtoken, userName, userEmail });
        } else {
        logger.error('User not found');
        return res.status(404).json({ error: 'User not found' });
        }// Task 7: Send appropriate message if user not found
    } catch (e) {
        logger.error(e);
         return res.status(500).send('Internal server error');

    }
});

router.put('/update', async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }// Task 2: Validate the input using `validationResult` and return approiate message if there is an error.
    try {
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }// Task 3: Check if `email` is present in the header and throw an appropriate error message if not present.
        const db = await connectToDatabase();
        const collection = db.collection("users");// Task 4: Connect to MongoDB
        const existingUser = await collection.findOne({ email });// Task 5: find user credentials in database
        existingUser.updatedAt = new Date();
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );// Task 6: update user credentials in database
        const payload = {
                    user: {
                        id: updatedUser._id.toString(),
                    },
                };
        const authtoken = jwt.sign(payload, JWT_SECRET);// Task 7: create JWT authentication using secret key from .env file
        res.json({authtoken});
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});
});

module.exports = router;