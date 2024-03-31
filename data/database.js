const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host:'localhost',
    database: 'vital',
    user: 'lulu',
    password : 'luckisbuck99'

});


 module.exports = pool;
