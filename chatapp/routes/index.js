'use strict';

const express = require('express');
const { render } = require('../app');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();


// ログイン画面の表示
router.get('/', function (request, response, next) {
    let session = request.session;
    // セッション中のユーザーをリセット
    request.session.username = null;
    response.render('index');
});

// チャット画面の表示
router.post('/user', function (request, response, next) {
    const db = new sqlite3.Database('chatTodo');
    console.log('ユーザ名：' + request.body.userName);
    // DBの処理
    db.serialize(function () {
        // テーブルがなければ作成
        db.run(
            `CREATE TABLE IF NOT EXISTS user (
                name TEXT
            )`
        );

        let create = new Promise(function (resolve, reject) {
            // 名前を取得している
            db.get(`SELECT name FROM user WHERE name = '${request.body.userName}'`, function (err, row) {
                let user_exists = false;
                if (err) {
                    reject(err);
                }
                else {
                    if (row !== undefined) {
                        request.session.username = row.name;
                        response.redirect('/user');
                        user_exists = true;
                    }
                    resolve(user_exists);
                }
            });
        });

        create.then(function (user_exists) {
            if (!user_exists) {
                // prepare Statementでデータ挿入
                let stmt = db.prepare(`INSERT INTO user VALUES (?)`);
                stmt.run([request.body.userName]);
                stmt.finalize();
                request.session.username = request.body.userName;
                response.redirect('/user');
            }
            db.close();
        });
    });
});

// チャット退出後→個人一覧画面(データベースで情報取得の必要性がないためGET)
router.get('/user', function (request, response, next) {
    // requestからユーザー情報を取得する
    response.render('user', { userName: request.session.username });
});

// チャット画面の表示
router.get('/room', function (request, response, next) {
    // requestからユーザー情報を取得する
    response.render('room', { userName: request.session.username });
});

// チャット画面の表示
router.get('/task', function (request, response, next) {
    // requestからユーザー情報を取得する
    response.render('task', { userName: request.session.username });
});

module.exports = router;
