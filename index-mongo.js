const express = require('express');
//const morgan = require('morgan');
const bodyParser = require('body-parser');
var session = require('express-session');
//const mysql = require('mysql2');
const mongodb = require('mongodb');
var cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const GC_MONGO_URL = "mongodb://localhost:27017/";
app.use(session({secret:'XASDASDA'}));
var ssn ;
app.use(bodyParser.urlencoded({ extended: false}));

const GC_MOVIES = [
	{"id":3,"description":"Star Wars, return of Jedi","genre":{"category":"Sci Fi"},"director":{"id":1,"name":"George Lucas","bio":"","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":8,"description":"Star Trek, the movie","genre":{"category":"Sci Fi"},"director":{"id":6,"name":"Gene Roddenberry","bio":"Visionary","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":4,"description":"Fight Club","genre":{"category":"Action"},"director":{"id":2,"name":"David Yates","bio":"","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":5,"description":"Fantastic Beast","genre":{"category":"Sci Fi"},"director":{"id":2,"name":"David Yates","bio":"","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":1,"description":"Star Wars, new hope","genre":{"category":"Sci Fi"},"director":{"id":1,"name":"George Lucas","bio":"","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":6,"description":"Seven","genre":{"category":"Action"},"director":{"id":3,"name":"David Fincher","bio":"Great Director","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":7,"description":"Gone Girl","genre":{"category":"Thriller"},"director":{"id":3,"name":"David Fincher","bio":"Great Director","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":2,"description":"Harry Potter","genre":{"category":"Fiction"},"director":{"id":2,"name":"David Yates","bio":"","birthYear":1920,"deathYear":2014},"imageURL":""},
	{"id":10,"description":"Gladiator","genre":{"category":"Thriller"},"director":{"id":3,"name":"David Fincher","bio":"Great Director","birthYear":1920,"deathYear":2014},"imageURL":""}
];
const GC_USERS = [
	{"username":"admin","password":"Test1234","fullname":"Admin","birthday":"1985-01-01T00:00:00.000Z","email":"admin@test.com","favorites":[1,8,3],"roleId":2},
	{"username":"ryan","password":"Test1234","fullname":"Ryan Tester","birthday":"1985-03-03T00:00:00.000Z","email":"ryan@test.com","favorites":[2,4],"roleId":1},
	{"username":"test","password":"Test1234","fullname":"Ryan Tester","birthday":"1985-03-03T00:00:00.000Z","email":"tester@test.com","favorites":[],"roleId":1},
	{"username":"bob","password":"Test1234","fullname":"Ryan Tester","birthday":"1985-03-03T00:00:00.000Z","email":"bob@test.com","favorites":[],"roleId":1},
	{"username":"june","password":"Test1234","fullname":"Ryan Tester","birthday":"1985-03-03T00:00:00.000Z","email":"june@test.com","favorites":[],"roleId":1}
]
app.use(cors());
//app.use(morgan('common'));windows 2
app.use(express.static("public"))
app.use(function (err, req, res, next){
    console.log(err)
    next(err)
    })
app.get("/seed", (req, res)=> {
    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
		GC_MOVIES.forEach ((obj)=>{
			dbo.collection("movies").insertOne(obj);
		});
		GC_USERS.forEach ((obj)=>{
			dbo.collection("users").insertOne(obj);
		});
    });
	res.end("done");
});
app.get('/', (req, res)=> {
    res.render("movies");
})
app.get("/user/delete/:un", (req, res)=> {
	const un = req.params.un+"";
	//console.log("ID: "+id);
	MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
		//new mongodb.ObjectID(id)
        dbo.collection("users").deleteOne({username: un}, function(err, results) {
       if (err){
         console.log("failed");
         throw err;
       }
       console.log("success");
	   res.end("deleted");
    });
    });
});
app.get("/movie/update/:id/:name",  (req, res) =>{
	const id = req.params.id;
	const name = req.params.name;
	    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
		var myquery = { id: parseInt(id) };
		var newvalues = { $set: {description: name } };
		console.log (myquery);
		console.log (newvalues);
		dbo.collection("movies").updateOne(myquery, newvalues, function(err, result) {
			if (err) throw err;
				console.log("1 document updated");
			db.close();
			res.end("updated");
		});
	});
});
app.get("/movie/updateBio/:id/:bio",  (req, res) =>{
	const id = req.params.id;
	const bio = req.params.bio;
	

	
	    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
		
		var myquery = { "director.id": parseInt(id)};
		  var newvalues = { $set: {"director.bio": bio} };
		  console.log (myquery);
		  console.log (newvalues);
	  dbo.collection("movies").updateMany(myquery, newvalues, function(err, result) {
		if (err) throw err;
		console.log("1 document updated");
		db.close();
		res.end("updated");
	  });
  
		
		
	});
});
app.get("/user/movie/add/:un/:id", async (req, res) =>{
	const un = req.params.un;
	const id= req.params.id;
	 MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true},async function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        await dbo.collection("users").findOne({username:un},async function (err, result) {
            if (err)
                throw err;
			console.log(result);
			result.favorites.push (parseInt(id));
			await dbo.collection("users").updateOne({username:un}, {$set: {favorites: result.favorites}},function (err, result) {
            if (err)
                throw err;
			
			});
			
            db.close();
			res.end("added");
        });
    });
	
})
app.get("/movies", async (req, res) =>{

    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        dbo.collection("movies").find({}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result);
            db.close();
			res.end();
        });
    });
	
});
app.get("/users", async (req, res) =>{

    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        dbo.collection("users").find({}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result);
            db.close();
			res.end();
        });
    });
	
});
app.get("/movie/name/:name", async (req, res) =>{
	const name = req.params.name;
    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        dbo.collection("movies").find({description:name}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result);
            db.close();
			res.end();
        });
    });
	
});
app.get("/movies/genre/:genre", async (req, res) =>{
	const genre = req.params.genre;
	console.log("id: "+genre)
    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        dbo.collection("movies").find({genre:{category:genre}}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result);
            db.close();
			res.end();
        });
    });
});
app.get("/movies/director/:name", async (req, res) =>{
	const name = req.params.name;
	console.log("name: "+name)
    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        dbo.collection("movies").find({ "director.name": {$eq: name}}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result);
            db.close();
			res.end();
        });
    });
});
app.get("/movies/gd/:genre/:dir", async (req, res) =>{
	const genre = req.params.genre;
	const dir = req.params.dir;
	console.log (dir+", genre: "+genre);
    MongoClient.connect(GC_MONGO_URL, {useUnifiedTopology: true}, function (err, db) {
        if (err)
            throw err;
        var dbo = db.db("movies");
        dbo.collection("movies").find({$or:[{genre:{category:genre},  "director.name": {$eq: dir}}]}).toArray(function (err, result) {
            if (err)
                throw err;
			res.json (result);
            db.close();
			res.end();
        });
    });
});
async function query (qry)
{
	const res= await client.query(qry);
	return res.rows;
}
app.get("/movie/:id", async (req, res) =>{
	const id = req.params.id;
	console.log("ID: "+id);
	const qry = 'SELECT * FROM view_movies WHERE id ='+id;
    const rows =await query (qry);
	res.send(rows);
	res.end();
});
app.get("/genre/:id", async (req, res) =>{
	const id = req.params.id;
	console.log("ID: "+id);
	const qry ='SELECT name FROM genres WHERE id ='+id;
	const rows =await query (qry);
	res.send(rows);
	res.end();
});
app.get("/director/:id", async (req, res) =>{
	const id = req.params.id;
	console.log("ID: "+id);
	const qry = 'SELECT * FROM directors WHERE id ='+id;
	const rows =await query (qry);
	res.send(rows);
	res.end();
});
app.get("/login",  (req, res) =>{
    ssn=req.session;
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h3>Login:</h3><form action="login" method="post">');
    res.write('<p>Username: <input type="text" name="username" placeholder="username"></p>');    
    res.write('<p>Password: &nbsp;<input type="password" name="password" placeholder="password"></p>');
    res.write('<p><input type="submit" value="Login"></p>');
    res.write('</form><a href="/new">Create profile</a>');
    res.end();
});
app.post ("/login",  (req, res) =>{
	const un = req.body.username;
	const pw = req.body.password;
	const user = getUser(un);
	if (user.password==pw)
	{
		ssn=req.session;
        ssn.user=user;
		res.end("logged in");
	}else{
		res.end("invalid loggin");
	}
});
function getUser (un)
{
	for (let i in users)
	{
		if (users[i].username==un)
		{
			return users[i];
		}
	}
}
app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
})

app.post ("/register", async(req, res) => {
	const un = req.body.username;
	const pw = req.body.password;
	const nm = req.body.fullname;
	const em = req.body.email;
	
	let insert = "INSERT INTO users(username,password,full_name,email,role_id) VALUES (";
	let values = `'${un}','${pw}','${nm}','${em}')`;
	const t = await query (insert+values);

	res.end("registered");
})
app.get ("/register", async(req, res) => {
	const un = req.query.un;
	const pw = req.query.pw;
	const nm = req.query.fn;
	const em = req.query.em;
	//register?un=test&pw=Test1234&fn=Tester&em=test@gmail.com
	let insert = "INSERT INTO users(username,password,full_name,email,role_id) VALUES (";
	let values = `'${un}','${pw}','${nm}','${em}',1)`;
	const t =await query (insert+values);

	res.end("registered");
})
app.post ("/updateUser", (req, res) => {
	const id = req.body.id
//	const un = req.body.username;
//	const pw = req.body.password;
	const fn = req.body.fullname;
	const em = req.body.email;
	
	let update = `UPDATE users SET fullname = '${fn}, email='${em}' WHERE id = ${id}`;
	query (update);
	res.end("updated");
})
app.get ("/updateUser", (req, res) => {
	const id = req.query.id
//	const un = req.body.username;
//	const pw = req.body.password;
	const fn = req.query.fn;
	const em = req.query.em;
	//updateUser?id=4&fn=June&em=test@june.com
	let update = `UPDATE users SET full_name = '${fn}', email='${em}' WHERE id = ${id}`;
	query (update);
	res.end("updated: "+update);
})
function getCurrentUser ()
{
	try {
		const user=ssn.user;
		if (user==null){
			//res.end("not logged in");
			return null;
		}
		return user;
	}catch (e){
		return null;
	}
}
app.get('/users', (req, res) => {
	const user = getCurrentUser();
	if (user==null)
	{
		res.end("no logged in user");
	}else if (user.roleId != 2)
	{
		res.end("not authorized");
	}
	else {
		res.json(users);
	}
})
app.get('/directors', (req, res) => {
    res.json(directors)
})

app.get('/genre', (req, res) => {
    res.json(genre)
})
app.get('/movies', (req, res) => {
    res.json(movies)
})

app.get('/name', (req, res) => {
    res.json(name)
})

app.get('/director/:nm', (req, res) => {
	const nm = req.params.nm;
	console.log ("nm: "+nm);
	const d=getDirector(nm);
	res.json (d);
})
app.get('/movie/:id', (req, res) => {
	const id = req.params.id;
	console.log ("id: "+id);
	const m=getMovie(parseInt(id));
	res.json (m);
})
app.get('/addMovie/:un/:id', async(req, res) => {
	const un = req.params.un;
	const id = req.params.id;
	console.log ("id: "+id);
	const insert = `INSERT INTO user_movies (user_id, movie_id) VALUES (${un}, ${id})`;
	query (insert);
	res.end("added");
})
app.get('/removeMovie/:un/:id', (req, res) => {
	const id = req.params.id;
	const un = req.params.un;
	console.log ("id: "+id);
	const del = `DELETE FROM user_movies WHERE user_id =${un} AND movie_id = ${id}`;
	query (del);
	res.end("deleted");
})
app.get('/unregister', (req, res) => {
});
app.get('/genre/:g', (req, res) => {
	const g = req.params.g;
	console.log ("genre: "+g);
	let data=[];
	for (let i in movies)
	{
		if (movies[i].genre===g)
		{
			data.push(movies[i]);
		}
	}
	res.json (data);
})
function getDirector (name)
{
	for (let i in directors)
	{
		if (directors[i].name===name)
		{
			return directors[i];
		}
	}
}
function getMovie (id)
{
	for (let i in movies)
	{
		if (movies[i].id===id)
		{
			return movies[i];
		}
	}
}
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
})