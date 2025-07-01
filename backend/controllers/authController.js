const path = require('path');
const User = require('../models/User');
const Problems = require('../models/Problem');
const Submission =require('../models/Submission');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.SECRET_KEY) {
    console.error('SECRET_KEY is not defined in environment variables');
    process.exit(1);
}

module.exports.signup_get = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
}

// handling errors
const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = { firstname: '', lastname: '', email: '', password: '' };

    // duplicate error code
    if (err.code === 11000) {
        errors.email = "That email is already registered";
        return errors;
    }

    if (err.message.includes('User validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

// creating token 
const maxAge = 24 * 60 * 60; // 24 hours in seconds
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY || require('../secKey.json').SECRET_KEY, {
        expiresIn: '24h'
    });
};

module.exports.login_get = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
}

// getting all problems
module.exports.problems = async (req, res) => {
    try {
        const token =req.cookies.jwt;
        console.log("Token ->>>",req.cookies.jwt);  //token
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY); // decoding --got user details like payload given and expiry time
        const user = await User.findById(decodedToken.id); //Fetching by userID
        console.log(user.easyP);
        console.log(user.basicP);
        console.log(user.mediumP);
        console.log(user.hardP);

        const all_problems = await Problems.find();
        // console.log(all_problems);
        // all_problems is an array in which each problem is an object
        res.status(200).json({all_problems:all_problems ,"easySolved" :user.easyP , "basicSolved" :user.basicP  ,"mediumSolved":user.mediumP ,"hardSolved":user.hardP , "user_id":decodedToken.id});
    } catch (error) {
        console.log(error);
        res.status(500).send({ "Error retreiving problems ": error });
    }
}

module.exports.signup_post = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.create({ email, password });
        const token = createToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(201).json({ user: user._id, token });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports.login_post = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.login(email, password);
        const token = createToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        res.status(200).json({ user: user._id, token, message: 'Login successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// logout
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        maxAge: 1,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// Getting single problem
module.exports.problem_details = async (req, res) => {
    try {
        const prob_id = req.params.id;
        console.log(req.body);
        const prob = await Problems.findOne({ "_id": prob_id });

        console.log(prob);

        let to_send = {
            name: prob.name,
            description: prob.description,
            difficulty: prob.difficulty,
            inputLink: prob.inputLink,
            outputLink: prob.outputLink,
            tags: prob.tags,
            hints: prob.hints,
            showtc: prob.showtc,
            showoutput: prob.showoutput,
            problemID:prob.id,
            constraints:prob.constraints,
        };

        console.log("i----->", prob.inputLink);
        console.log("o----->", prob.outputLink);

        res.json(to_send);
    } catch (error) {
        res.status(400).json({ message: "Internal server error" });
    }
}

// posting problems , can be done by me only 
module.exports.postProb = async (req, res) => {
    console.log(req.body.data);
    
    const { name, description, difficulty, inputLink, outputLink, tags, hints, showtc, showoutput , constraints } = req.body;

    let errors = { name: '', description: '', difficulty: '', inputLink: '', outputLink: '', showtc: '', showoutput: ''  , constraints};

    if (!name) {
        errors.name = 'Enter Problem name';
        return res.status(400).json({ errors });
    }
    if (!description) {
        errors.description = 'Enter Problem description';
        return res.status(400).json({ errors });
    }
    if (!difficulty) {
        errors.difficulty = 'Enter the difficulty level';
        return res.status(400).json({ errors });
    }
    if (!inputLink) {
        errors.inputLink = "Input Link is not there";
        return res.status(400).json({ errors });
    }
    if (!outputLink) {
        errors.outputLink = "Output Link is not there";
        return res.status(400).json({ errors });
    }
    if (!showtc) {
        errors.outputLink = "sample TC is not there for user";
        return res.status(400).json({ errors });
    }
    if (!showoutput) {
        errors.outputLink = "sample output of sample TC is not there for user";
        return res.status(400).json({ errors });
    }
    if (!constraints) {
        errors.outputLink = "sample output of sample TC is not there for user";
        return res.status(400).json({ errors });
    }

    try {
        // Create the problem with test cases
        const createProblem = await Problems.create({ name, tags, description, difficulty, hints, inputLink, outputLink, showtc, showoutput , constraints });

        console.log("Problem added successfully", createProblem);
        res.status(201).json({ createProblem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//               SHOWING MY ACCOUNT SECTION HERE

module.exports.my_account =async (req , res)=>{
        const token=req.cookies.jwt;
        
        try {
            const decodedToken= jwt.verify(token, process.env.SECRET_KEY);

            const user_id = decodedToken.id;
   
            const to_send={
                firstname:"",
                lastname:"",
                role:"",
                basicP:0,
                easyP:0,
                mediumP:0,
                hardP:0,
            };

            const user =await User.findById(user_id);
            console.log(user);
            to_send.firstname=user.firstname;
            to_send.lastname=user.lastname;
            to_send.role=user.role;
            to_send.easyP=user.easyP;
            to_send.basicP=user.basicP;
            to_send.mediumP=user.mediumP;
            to_send.hardP=user.hardP;
            to_send.solved_problems = user.solvedProblems;
            // console.log("solv",user.solvedProblems);
            const totalProblems = await Problems.countDocuments();
            // to_send.totalProblems=user.hardP;
            const categoryCounts = await Problems.aggregate([
                {
                  $group: {
                    _id: '$difficulty', // Group by category field
                    count: { $sum: 1 } // Count documents in each category group
                  }
                  }
              ]);
            console.log(categoryCounts);
            console.log(totalProblems);
            to_send.totalProblems=totalProblems;

            to_send.total_question = categoryCounts;

            let a = 0, b = 0, c = 0, d = 0;
            categoryCounts.forEach(category => {
              switch (category._id) {
                case 'easy':
                  a = category.count;
                  break;
                case 'medium':
                  b = category.count;
                  break;
                case 'basic':
                  c = category.count;
                  break;
                case 'hard':
                  d = category.count;
                  break;
                default:
                  break;
              }
            });
        
            // Assign these counts to to_send object
            to_send.easyT = a;
            to_send.mediumT = b;
            to_send.basicT = c;
            to_send.hardT = d;

            res.status(200).json({data:to_send});

        } catch (error) {
            console.log("Error verifying token",error);
            res.json({ error: "Authentication Failed ! Login Again"});
            
        }
}