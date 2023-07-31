require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const encrypt = require("mongoose-encryption");

const app = express();

const port = process.env.PORT || 3000;


// use ejs with app
// view engine will always look for .ejs files in the views folder to render
app.set('view engine', 'ejs');


// for server to be able to send local static files like images and css
// all these files will have to be kept in the folder with the name that is passed to express.static()
app.use(express.static("public"));


// use body-parser in urlencoded()
// the form data is nested data so we also have to specify the URL encoding as extended true.
app.use(bodyParser.urlencoded({extended: true}));


const Schema = mongoose.Schema;

const uri = "mongodb+srv://AsifKhan:3MsraHQQJgqTCdrI@cluster0.hv14rhw.mongodb.net/userDB?retryWrites=true&w=majority";


// create user schema and model
const userSchema = new Schema ({
	email: String,
	password: String
});

// access SECRET from .env file
const secret = process.env.SECRET;

// encrypt only password field with secret string
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password']});


const User = mongoose.model("User", userSchema);


// Data

const user = new User ({
	email: "",
	password: ""
});


// connect mongoose
async function run () {
	await mongoose.connect(uri);
	// await user.save();
	await mongoose.connection.close()
}
run().catch(err => {console.log(err)});



// get for home route
app.get("/", (req, res) => {
	res.render("home");
});



// get for login route
app.get("/login", (req, res) => {
	res.render("login");
});



// get for register route
app.get("/register", (req, res) => {
	res.render("register");
});


// respond to post from register route
app.post("/register", (req, res) => {
	// create new user from typed in user name and password
	const userName = req.body.username;
	const password = req.body.password;
	const newUser = new User ({
		email: userName,
		password: password
	});
	async function run () {
		await mongoose.connect(uri);
		await newUser.save();
		res.render("secrets");
		await mongoose.connection.close()
	}
	run().catch(err => {console.log(err)});
});



// respond to post from login route
app.post("/login", (req, res) => {
	const userName = req.body.username;
	const password = req.body.password;
	async function run () {
		await mongoose.connect(uri);
		const foundUser = await User.findOne({email: userName});
		console.log(foundUser);
		if (foundUser) {
			if (foundUser.password === password){
				res.render("secrets");	
			}
			else {
				res.send(`Wrong password`);
			}
		}
		else {
			res.send(`User not registered`);
		}
		await mongoose.connection.close()
	}
	run().catch(err => {console.log(err)});
});



app.listen(port, () => {
	console.log(`Server running on port ${port}`)
});