import * as http from "http";
import * as https from "https";
import * as fs from "fs";
import { User } from "./user";
import * as SocketIO from "socket.io";
import { Test } from "./test";
import { emit } from "cluster";

//import * as request = from "request"

var statusPage = "";
var Users: { [key: string]: User } = {};
var Tests: { [key: string]: Test } = {};

var MainServer = http.createServer((req, res) => {
    if (req.method == "GET") {
        if (req.url == "/") {
            fs.readFile("./dist/pages/main/page.html", (err, file) => {
                if (err) throw err;

                res.writeHead(200, "OK", {
                    "Content-Type": "text/html"
                });
                res.end(file);
            });
        } else if (req.url == "/main.js") {
            fs.readFile("./dist/pages/main/main.js", (err, file) => {
                if (err) throw err;

                res.writeHead(200, "OK", {
                    "Content-Type": "script/plain"
                });
                res.end(file);
            });
        } else if (req.url == "/status") {
            res.writeHead(200, "OK", {
                "Content-Type": "text/html"
            });
            res.end(statusPage);
        } else {
            res.writeHead(404);
            res.end();
        }
    } else {
        var queryData = "";

        req.on('data', function (data) {
            queryData += data;
        });

        req.on('end', function () {
            console.log(queryData);
            if (req.url == "/login") {
                let uuid = GenerateUUID();
                let data: loginData = JSON.parse(queryData);

                Users[uuid] = new User(data.id, data.username, data.password);

                Users[uuid].LoginUser(() => {
                    if (Tests[data.id]) {
                        let temp = {
                            questions: Tests[data.id].questions,
                            uuid: uuid
                        };

                        res.writeHead(200, "OK", {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(temp));
                    } else {
                        let temp = {
                            questions: Users[uuid].questions,
                            uuid: uuid
                        };

                        console.log("Created new test lobby at: " + data.id);
                        Tests[data.id] = new Test(data.id, JSON.parse(JSON.stringify(Users[uuid].questions)));

                        res.writeHead(200, "OK", {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify(temp));
                    }
                });
            } else if (req.url == "/predaj") {
                let data : PredajData = JSON.parse(queryData);

                Users[data.uuid].PreadjTest(data.data);
            } else {
                res.writeHead(404);
                res.end();
            }
        });
    }
}).listen(8080);

interface PredajData {
    uuid : string,
    data: string
}

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
            Tests[Users[data.indentification].id].OdgovoriNaPitanje(newData.questionId, newData.answerId, newData.username, (question) => {
                io.emit("update", question);
            });
        });
    });
});

interface loginData {
    id: string;
    username: string;
    password: string;
}

var testUser = new User("1828576", "test", "password");
//testUser.LoginUser();
//new User("1828576", "test123", "password").LoginUser();
//new User("1828576", "test123", "password").LoginUser();
//new User("1828576", "test12332", "password").LoginUser();
//new User("1828576", "test1234343", "password").LoginUser();

function GenerateUUID(a?) {
    //@ts-ignore
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, GenerateUUID)
}