const express = require("express");
const dotenv = require("dotenv").config();
const passport = require('passport');
const session = require('express-session');
const app = express();
const path = require("path");
const pool = require('./data/database');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
require('./routes/auth-routes');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { use } = require("passport");
const { Console, profile } = require("console");

app.use(session({
  secret: 'my$*^592secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

    app.use(passport.initialize());
    app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
  
/*app.get('/registration', function(req,res){
    const htmlFilePath = path.join(__dirname, 'views', 'registration.html');

    res.sendFile(htmlFilePath);
});*/

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/registration', (req, res) => {
  res.render('registration');
});

  
         
    // Insert the data into the database
    app.post('/registration', async function(req, res) {
      try {
        const userData = req.body;
        const age = userData.age;
        const height = userData.height;
        const weight = userData.weight;
        const gender = userData.gender;
        const activity_level = userData.activity_level;

    
        let bmr;
    
        if (gender === 'male') {
          bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else if (gender === 'female') {
          bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }
    
        let tdee;
    
        switch (activity_level) {
          case 'sedentary':
            tdee = bmr * 1.2;
            break;
          case 'lightly-active':
            tdee = bmr * 1.375;
            break;
          case 'moderately-active':
            tdee = bmr * 1.55;
            break;
          case 'very-active':
            tdee = bmr * 1.725;
            break;
          case 'super-active':
            tdee = bmr * 1.9;
            break;
          default:
            return null;
        }

        console.log("post server",tdee);

        
    
        const query = `
          INSERT INTO users(
            first_name, last_name, email, password, age, weight, height, activity_level, tdee) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
        const values = [
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.password,
          userData.age,
          userData.weight,
          userData.height,
          userData.activity_level,
          tdee
        ];

        await pool.query(query, values);
    
        console.log('Data inserted successfully');
        console.log(values);
        res.render('login');

         //provide_tdee(userData.email);

      } catch (error) {
        console.error('Error inserting data into the database:', error);
        res.status(500).send('Internal Server Error');
      }
    });



    app.post('/api/daily_intake', async (req,res) => {
      try{
        const email = req.body.email;

        const userQuery = 'SELECT id FROM users WHERE email = ?';

        const userResult = await pool.query(userQuery,[email]).catch(error => {
          console.error("error in id", error);
        });

        const userId = userResult[0][0].id;

        const isIdExist = 'SELECT user_id FROM DailyIntake WHERE user_id = ?';

        const isTrue = await pool.query(isIdExist,[userId]);

        console.log("isIdExist",isTrue);

        let result;
        if (isTrue[0].length > 0) {
            result = isTrue[0][0].user_id;
        } else {
            result = undefined;
        }

        console.log("id exist ?", result);

        const values = [
         userId,
          total_sum = req.body.total_sum,
          protein = req.body.protein,
          carbs = req.body.carbs,
          fats = req.body.protein,
          fiber = req.body.fiber,
          vita = req.body.vita,
          vitc = req.body.vitc,
          vitd = req.body.vitd,
          fe = req.body.fe,
  
          ]

        console.log("this is the id",userId);

        if(result !== userId || result === undefined || result === NULL){
          console.log("inserting");

        const query = 'INSERT INTO DailyIntake(user_id,calories,protein,carbs,fats,fiber,vitaminA,vitaminC,vitaminD,iron) VALUES (?,?,?,?,?,?,?,?,?,?)';

        console.log("Inserting values in DailyIntake");

        await pool.query(query,values);
        }

        else {
          console.log("updating");
         const queryUpdate = 'UPDATE DailyIntake SET calories = ?, protein = ?, carbs = ?, fats = ?, fiber = ?, vitaminA = ?, vitaminC = ?, vitaminD = ?, iron = ? WHERE user_id = ?';
 
          await pool.query(queryUpdate,[
            total_sum = req.body.total_sum,
            protein = req.body.protein,
            carbs = req.body.carbs,
            fats = req.body.protein,
            fiber = req.body.fiber,
            vita = req.body.vita,
            vitc = req.body.vitc,
            vitd = req.body.vitd,
            fe = req.body.fe,
            userId
          ]);                               

        }

        res.status(200).json({ message: "Data succesfully inserted in DailyIntake" });

        }
      catch(error){
          console.error("Server error",error);
          res.status(500).json({error:"Server error"});
      }
    });

 
    app.get('/api/data', async (req,res) => {
      try{

        const userEmail = req.session.email;

          console.log(userEmail);

          const query = 'SELECT tdee FROM users WHERE email = ?';

          console.log(query);

          const result = await pool.query(query,[userEmail]);

          console.log(result);

          const userTdee = result[0][0].tdee;

          console.log("userTdee",userTdee);

          res.json({ tdee: userTdee, email: userEmail});
      }
      catch (error) {
        console.error('Error fetching TDEE from the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  

    app.post('/login', async (req,res)  => {

      const user = req.body.email;

    const [rows,fields] = await pool.query('SELECT email FROM users');
      
        console.log("user body?",user);

      const existingUser = rows.map(row => row.email);

      const userExists = existingUser.includes(user);

      console.log("user exist?", userExists);

      if(userExists == true){

        req.session.email = user;

        console.log(req.session.email);

        res.render('mainpage');
        
      }
      else{
        res.render('registration');
      }
    });

    app.get('/logout', (req, res) => {
      req.logout(); 
    
      res.redirect('/login');
    });

 app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);




app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/registration',
    successRedirect: '/mainpage' 
  }), (req,res) => {
    console.log('callback done');
  }
);

app.get('/mainpage', isLoggedIn ,(req, res) => {
  

  res.render('mainpage');
});


app.get('/auth/google/failure', (req, res) => {
  if (req.authInfo && req.authInfo.message === 'User not found. Redirect to registration.') {
    return res.redirect('/registration');
  } else {
    return res.send("Something went wrong");
  }
});

function isLoggedIn(req,res,next){
  req.user? next(): res.sendStatus(401);
}
    

/*app.get('/login', function(req,res){
    const loginHtmlPath = path.join(__dirname,'views','login.html');
    
    
    res.sendFile(loginHtmlPath);

});*/

app.get('/login', function(req, res) {
  const user = req.session.user;

  console.log(user);

  res.render('login');
    
   
});

app.get('/help',(req,res)=>{
  const helpHtmlPath = path.join(__dirname,'views','help.html');

  res.sendFile(helpHtmlPath);
})

app.get('/profile',async (req,res) =>{
 
  const username = await getUserUsername(req.session.email);

  res.render(profile,{username});
});


/*app.get('/mainpage', (req, res) => {
  res.sendFile(__dirname + '/views/mainpage.html');
});*/

/*app.post('/login', (req, res) => {
  // Validate username and password
  if (  ) {
    res.redirect('/mainpage'); // Redirect to the main page
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});*/



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});