const sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('user.db');

// USERテーブルの情報を確認
db.serialize(function () {
    db.each('SELECT name FROM user ',
    function (err, row){
        console.log(row.name);
    });
});