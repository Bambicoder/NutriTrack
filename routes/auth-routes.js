const express = require('express');
const app = express();
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../data/database');

passport.use(new GoogleStrategy({
    clientID: '205957970834-ud6k8urab4m1v96qdg6tgrd9sea21703.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true
  },
  async (req,res, accessToken, refreshToken, profile, done) => { 
    try {
      //if the user's email already exists in the database
      const userEmail = profile._json.email;
       console.log('userEmail',userEmail);
      

      const [rows, fields] = await pool.query('SELECT email FROM users');
      console.log('Rows:', rows);
      
  
      const existingEmails = rows.map(row => row.email);

       console.log('Existing Emails:', existingEmails);

  // if the user's email exists in the array
      const userExists = existingEmails.includes(userEmail);

       console.log(userExists);

      if(userExists == true){
        done(null,profile);
       }
        else{
        done(null,false, {message:'User not found'});
        }
    } catch (error) {
      console.error('Error checking user existence:', error);
     
    }
  }
));  
  
  /*async (req,res,accessToken, refreshToken, profile, done) => { 
    try {
      // Check if the user's email already exists in the database
      //const existingUser = await pool.query('SELECT * FROM users WHERE email = ?', [profile.email]);
      const [rows,fields] = await pool.query('SELECT email FROM users');
      console.log('Rows:', rows);

      for(let i=0;i<rows.length;i++){
        console.log('Row:', rows[i]);
        if(profile.email == rows[i]){

         return res.redirect('/auth/google/success');
        }
        else{
          return res.redirect('/registration');
        }
      }

      console.log(queries);
     // console.log(existingUser);
     // if (existingUser.length > 0) {
        // User exists, proceed with authentication
      //  return done(null, profile);
     // } else {
        // User does not exist, redirect to registration page
       // return done(null, false, { message: 'User not found. Redirect to registration.' });
     // }
    } catch (error) {
      console.error('Error checking user existence:', error);
    }
  
  }));*/

passport.serializeUser((user, done) => {
  // Store the entire user object in the session
  return done(null, user);
});

passport.deserializeUser((user, done) => {
  // The user object is already available in the session
  return done(null, user);
});



