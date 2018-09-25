"use strict";
exports.__esModule = true;
var http = require("http");
var fs = require("fs");
var user_1 = require("./user");
var SocketIO = require("socket.io");
var test_1 = require("./test");
//import * as request = from "request"
var statusPage = "";
var Users = {};
var Tests = {};
var MainServer = http.createServer(function (req, res) {
    if (req.method == "GET") {
        if (req.url == "/") {
            fs.readFile("./dist/pages/main/page.html", function (err, file) {
                if (err)
                    throw err;
                res.writeHead(200, "OK", {
                    "Content-Type": "text/html"
                });
                res.end(file);
            });
        }
        else if (req.url == "/main.js") {
            fs.readFile("./dist/pages/main/main.js", function (err, file) {
                if (err)
                    throw err;
                res.writeHead(200, "OK", {
                    "Content-Type": "script/plain"
                });
                res.end(file);
            });
        }
        else if (req.url == "/main.css") {
            fs.readFile("./dist/pages/main/main.css", function (err, file) {
                if (err)
                    throw err;
                res.writeHead(200, "OK", {
                    "Content-Type": "css/stylesheet"
                });
                res.end(file);
            });
        }
        else if (req.url == "/status") {
            res.writeHead(200, "OK", {
                "Content-Type": "text/html"
            });
            res.end(statusPage);
        }
        else {
            res.writeHead(404);
            res.end();
        }
    }
    else {
        var queryData = "";
        req.on('data', function (data) {
            queryData += data;
        });
        req.on('end', function () {
            console.log(queryData);
            if (req.url == "/login") {
                var uuid_1 = GenerateUUID();
                var data_1 = JSON.parse(queryData);
                Users[uuid_1] = new user_1.User(data_1.id, data_1.username, data_1.password);
                Users[uuid_1].LoginUser(function () {
                    if (Tests[data_1.id]) {
                        var temp = {
                            questions: Tests[data_1.id].questions,
                            uuid: uuid_1
                        };
                        res.writeHead(200, "OK", {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(temp));
                    }
                    else {
                        var temp = {
                            questions: Users[uuid_1].questions,
                            uuid: uuid_1
                        };
                        console.log("Created new test lobby at: " + data_1.id);
                        Tests[data_1.id] = new test_1.Test(data_1.id, JSON.parse(JSON.stringify(Users[uuid_1].questions)));
                        res.writeHead(200, "OK", {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(temp));
                    }
                });
            }
            else if (req.url == "/predaj") {
                var data = JSON.parse(queryData);
                Users[data.uuid].PreadjTest(data.data);
            }
            else {
                res.writeHead(404);
                res.end();
            }
        });
    }
}).listen(80);
var io = SocketIO(MainServer);
io.on("connection", function (socket) {
    socket.emit("indentification", { indentification: "expected" });
    socket.on("indentification", function (data) {
        if (data.indentification && !Users[data.indentification]) {
            socket.disconnect();
        }
        if (data.indentification && Users[data.indentification] && Tests[Users[data.indentification].id]) {
            socket.emit("all", Tests[Users[data.indentification].id]);
            socket.emit("indentification", { indentification: "connected" });
        }
        console.log("hooked new user: " + data.indentification);
        socket.on("update", function (newData) {
            console.log(newData.username);
            console.log(data.indentification);
            Tests[Users[data.indentification].id].OdgovoriNaPitanje(newData.questionId, newData.answerId, newData.username, function (question) {
                io.emit("update", question);
            });
        });
    });
});
var testUser = new user_1.User("1828576", "test", "password");
//testUser.LoginUser();
//new User("1828576", "test123", "password").LoginUser();
//new User("1828576", "test123", "password").LoginUser();
//new User("1828576", "test12332", "password").LoginUser();
//new User("1828576", "test1234343", "password").LoginUser();
function GenerateUUID(a) {
    //@ts-ignore
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, GenerateUUID);
}
