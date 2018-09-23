"use strict";
exports.__esModule = true;
var https = require("https");
var cheerio = require("cheerio");
var zlib = require("zlib");
var question_1 = require("./question");
var User = /** @class */ (function () {
    function User(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.questions = new Array();
    }
    User.prototype.LoginUser = function (callback) {
        var _this = this;
        https.get("https://testmoz.com/" + this.id, function (res) {
            var queryData = "";
            res.on('data', function (data) {
                queryData += data;
            });
            res.on('end', function () {
                _this.csfrtoken = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
                console.log("Token:" + _this.csfrtoken);
                var data = "bogusField=&csrfmiddlewaretoken=" + _this.csfrtoken + "&student-name=" + _this.username + "&student-passcode=" + _this.password + "&admin=student&student=Continue";
                var length = Buffer.byteLength(data, 'utf8');
                var req = https.request({
                    hostname: 'testmozusercontent.com',
                    port: 443,
                    path: "https://testmozusercontent.com/" + _this.id + "/student/login",
                    method: 'POST',
                    headers: {
                        "Host": "testmozusercontent.com",
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Referer": "https://testmozusercontent.com/" + _this.id + "/student/login",
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Content-Length": length,
                        "Cookie": "csrftoken=" + _this.csfrtoken,
                        "Connection": "keep-alive",
                        "Upgrade-Insecure-Requests": "1"
                    }
                }, function (res) {
                    var queryData1 = "";
                    res.on('data', function (data) {
                        queryData1 += data;
                    });
                    res.on('end', function () {
                        _this.sessionId = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
                        console.log("ses: " + _this.sessionId);
                        var req2 = https.request({
                            hostname: 'testmozusercontent.com',
                            port: 443,
                            path: "https://testmozusercontent.com/" + _this.id + "/student",
                            method: "GET",
                            headers: {
                                "Host": "testmozusercontent.com",
                                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
                                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                                "Accept-Language": "en-US,en;q=0.5",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Referer": "https://testmozusercontent.com/" + _this.id + "/student/login",
                                "Cookie": "csrftoken=" + _this.csfrtoken + "; sessionid=" + _this.sessionId,
                                "Connection": "keep-alive",
                                "Upgrade-Insecure-Requests": "1"
                            }
                        }, function (res) {
                            var gunzip = zlib.createGunzip();
                            res.pipe(gunzip);
                            var buffer = [];
                            gunzip.on('data', function (data) {
                                buffer.push(data.toString());
                            }).on("end", function () {
                                //console.log(buffer.join(""));
                                _this.pageTest = buffer.join("");
                                _this.ProcesTest(callback);
                            }).on("error", function (e) {
                                console.log(e);
                            });
                        });
                        req2.on("error", function (err) {
                            throw err;
                        });
                        req2.end();
                    });
                });
                req.on('error', function (e) {
                    console.error(e);
                });
                req.end(data);
            });
        });
    };
    User.prototype.ProcesTest = function (callback) {
        var $ = cheerio.load(this.pageTest);
        var questions = $(".question-table");
        console.log(questions);
        for (var i = 0; i < questions.length; i++) {
            var pitanje = questions[i].children[1].children[2].children[1].children[0].children[0].data;
            var questionId = questions[i].attribs["id"].split("n")[1];
            var answers = $("[name=" + "q-" + questionId + "]");
            var tip = answers[0].attribs["type"];
            var odgovori = Array();
            var vrijedonsti = Array();
            for (var a = 0; a < answers.length; a++) {
                if (answers[a].attribs["type"] != "text")
                    vrijedonsti.push(answers[a].attribs["value"]);
                try {
                    if ($("[for=" + questionId + "_" + a + "]").length == 0) {
                    }
                    else {
                        odgovori.push($("[for=" + questionId + "_" + a + "]")[0].children[0].data);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
            this.questions.push(new question_1.Question(questionId, pitanje, odgovori, tip, vrijedonsti));
        }
        console.log(this.questions);
        callback();
    };
    User.prototype.PreadjTest = function (odgovori) {
        var data = "csrfmiddlewaretoken=" + this.csfrtoken + "&" + odgovori + "&submit=Submit";
        var length = Buffer.byteLength(data, 'utf8');
        var req = https.request({
            hostname: 'testmozusercontent.com',
            port: 443,
            path: "https://testmozusercontent.com/" + this.id + "/student",
            method: 'POST',
            headers: {
                "Host": "testmozusercontent.com",
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                "Referer": "https://testmozusercontent.com/" + this.id + "/student",
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": length,
                "Cookie": "csrftoken=" + this.csfrtoken + "; sessionid=" + this.sessionId + ";",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1"
            }
        }, function (res) {
            var queryData1 = "";
            res.on('data', function (data) {
                queryData1 += data;
            });
            res.on('end', function () {
                console.log(data);
            });
        });
        req.on('error', function (e) {
            console.error(e);
        });
        req.end(data);
    };
    return User;
}());
exports.User = User;
