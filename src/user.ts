import * as https from "https"
import * as cheerio from "cheerio"
import * as zlib from "zlib"
import { Question } from "./question";


export class User {
    public id: string;
    public username: string;
    public password: string;

    public csfrtoken: string;
    public sessionId: string;

    public pageTest: string;

    public questions: Array<Question>;
    constructor(id: string, username: string, password: string) {
        this.id = id;
        this.username = username;
        this.password = password;

        this.questions = new Array<Question>();
    }

    public LoginUser(callback: () => void): void {
        https.get("https://testmoz.com/" + this.id, (res) => {
            var queryData = "";

            res.on('data', (data) => {
                queryData += data;
            });

            res.on('end', () => {

                this.csfrtoken = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
                console.log("Token:" + this.csfrtoken);

                let data = "bogusField=&csrfmiddlewaretoken=" + this.csfrtoken + "&student-name=" + this.username + "&student-passcode=" + this.password + "&admin=student&student=Continue";
                let length = Buffer.byteLength(data, 'utf8');
                var req = https.request({
                    hostname: 'testmozusercontent.com',
                    port: 443,
                    path: "https://testmozusercontent.com/" + this.id + "/student/login",
                    method: 'POST',
                    headers:
                    {
                        "Host": "testmozusercontent.com",
                        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.5",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Referer": "https://testmozusercontent.com/" + this.id + "/student/login",
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Content-Length": length,
                        "Cookie": "csrftoken=" + this.csfrtoken,
                        "Connection": "keep-alive",
                        "Upgrade-Insecure-Requests": "1",
                    },
                }, (res) => {

                    var queryData1 = "";
                    res.on('data', (data) => {
                        queryData1 += data;
                    });

                    res.on('end', () => {
                        this.sessionId = res.headers["set-cookie"][0].split(";")[0].split("=")[1];
                        console.log("ses: " + this.sessionId);


                        var req2 = https.request({
                            hostname: 'testmozusercontent.com',
                            port: 443,
                            path: "https://testmozusercontent.com/" + this.id + "/student",
                            method: "GET",
                            headers:
                            {
                                "Host": "testmozusercontent.com",
                                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0",
                                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                                "Accept-Language": "en-US,en;q=0.5",
                                "Accept-Encoding": "gzip, deflate, br",
                                "Referer": "https://testmozusercontent.com/" + this.id + "/student/login",
                                "Cookie": "csrftoken=" + this.csfrtoken + "; sessionid=" + this.sessionId,
                                "Connection": "keep-alive",
                                "Upgrade-Insecure-Requests": "1",
                            }
                        }, (res) => {

                            var gunzip = zlib.createGunzip();
                            res.pipe(gunzip);
                            var buffer = [];

                            gunzip.on('data', (data) => {
                                buffer.push(data.toString())

                            }).on("end", () => {
                                //console.log(buffer.join(""));
                                this.pageTest = buffer.join("");

                                this.ProcesTest(callback);
                            }).on("error", (e) => {
                                console.log(e);
                            });

                        });
                        req2.on("error", (err) => {
                            throw err;
                        })
                        req2.end();
                    });
                });

                req.on('error', (e) => {
                    console.error(e);
                });

                req.end(data);
            });
        });
    }

    public ProcesTest(callback: () => void): void {
        var $ = cheerio.load(this.pageTest);

        var questions = $(".question-table");
        console.log(questions);
        for (var i = 0; i < questions.length; i++) {
            var pitanje = questions[i].children[1].children[2].children[1].children[0].children[0].data;

            var questionId = questions[i].attribs["id"].split("n")[1];
            var answers = $("[name=" + "q-" + questionId + "]");

            var tip = answers[0].attribs["type"];

            var odgovori = Array<string>();
            var vrijedonsti = Array<string>();
            for (var a = 0; a < answers.length; a++) {
                if (answers[a].attribs["type"] != "text")
                    vrijedonsti.push(answers[a].attribs["value"]);
                try {
                    if ($("[for=" + questionId + "_" + a + "]").length == 0) {
                    } else {
                        odgovori.push($("[for=" + questionId + "_" + a + "]")[0].children[0].data);
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            this.questions.push(new Question(questionId, pitanje, odgovori, tip, vrijedonsti));
        }

        console.log(this.questions);

        callback();
    }

    public PreadjTest(odgovori): void {
        let data = "csrfmiddlewaretoken=" + this.csfrtoken + "&" + odgovori + "&submit=Submit";
        let length = Buffer.byteLength(data, 'utf8');
        var req = https.request({
            hostname: 'testmozusercontent.com',
            port: 443,
            path: "https://testmozusercontent.com/" + this.id + "/student",
            method: 'POST',
            headers:
            {
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
                "Upgrade-Insecure-Requests": "1",
            },
        }, (res) => {
            var queryData1 = "";
            res.on('data', (data) => {
                queryData1 += data;
            });

            res.on('end', () => {
                console.log(data);
            });
        });

        req.on('error', (e) => {
            console.error(e);
        });

        req.end(data);
    }
}