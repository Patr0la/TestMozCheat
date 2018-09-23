var uuid;
var questions;
var socket;
var username;

var NUMBER_START = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -";
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login").addEventListener("click", () => {
        document.getElementById("loginDiv").style.display = "none";
        var id = document.getElementById("id").value;
        username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        if (id && username && password) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/login", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                id: id,
                username: username,
                password: password
            }));
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    var data = JSON.parse(xhr.responseText);

                    uuid = data.uuid;
                    questions = data.questions;

                    socket = io('http://indexroute-testmozcheat.1d35.starter-us-east-1.openshiftapps.com/');
                    console.log(socket);
                    socket.on('indentification', function (data) {
                        console.log(data);
                        console.log(this);
                        if (data.indentification == "expected"){
                            socket.emit('indentification', { indentification: uuid });
                        }else if (data.indentification == "connected"){
                            document.getElementById("predajDiv").style.display = "block";
                            PrepSocket();
                        }
                    });

                    console.log(questions);
                    LoadQuestions();
                }
            }
        }
    });

    document.getElementById("predaj").addEventListener("click", () => {
        var data = "";
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].type == "text") {
                data += "q-" + questions[i].id + "=" + questions[i].polja[0].value + "&";
            } else if (questions[i].type == "radio") {
                for (let a = 0; a < questions[i].polja.length; a++) {
                    if (questions[i].polja[a].checked) {
                        data += "q-" + questions[i].id + "=" + questions[i].polja[a].value + "&";
                        break;
                    }
                }
            } else if (questions[i].type == "checkbox") {
                for (let a = 0; a < questions[i].polja.length; a++) {
                    if (questions[i].polja[a].checked) {
                        data += "q-" + questions[i].id + "=" + questions[i].polja[a].value + "&";
                    }
                }
            }
        }
        console.log(data);
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/predaj", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            uuid : uuid,
            data: data
        }));
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var data = JSON.parse(xhr.responseText);
                console.log(data);
            }
        }
    });
});


function PrepSocket() {
    alert("ready");
    socket.on("update", (data) => {
        console.log("update")
        for (let i in data.odgovoreno) {
            if (data.odgovoreno.hasOwnProperty(i)) {
                console.log(i);
                if (document.getElementById(data.id + "_" + i) != null) {
                    console.log("???????????????");
                    if(data.odgovoreno[i])
                        document.getElementById(data.id + "_" + i).innerHTML = NUMBER_START + data.odgovoreno[i];
                    else
                    document.getElementById(data.id + "_" + i).innerHTML = "";
                }
            }
        }
        console.log(data);
    });
}

function LoadQuestions() {
    var mainDiv = document.getElementById("pitanja");
    for (var i = 0; i < questions.length; i++) {
        questions[i].polja = [];

        var div = document.createElement("div");
        div.id = "q" + i;
        let temptempremp = document.createElement("p");
        temptempremp.innerHTML = questions[i].pitanje;

        div.appendChild(temptempremp);

        console.log(i);

        if (questions[i].type == "text") {
            let box = document.createElement("input");
            box.setAttribute("type", "text");
            questions[i].polja.push(box);
            div.appendChild(box);
        } else if (questions[i].type == "radio") {
            var radioButtons = [];
            for (var a = 0; a < questions[i].odgovori.length; a++) {
                let inDiv = document.createElement("div");

                var radioButton = document.createElement("input");
                radioButton.setAttribute("type", "radio");
                radioButton.setAttribute("value", questions[i].vrijednosti[a]);

                questions[i].polja.push(radioButton);
                inDiv.appendChild(radioButton);
                radioButtons.push(radioButton);

                inDiv.appendChild(document.createTextNode(questions[i].odgovori[a]));

                var para = document.createElement("div");
                para.style.display = "inline";

                if (JSON.stringify(questions[i].odgovoreno) != "{}" && questions[i].odgovoreno[questions[i].vrijednosti[a]]) {
                    para.innerHTML = NUMBER_START + questions[i].odgovoreno[questions[i].vrijednosti[a]];
                }

                para.id = questions[i].id + "_" + questions[i].vrijednosti[a];

                inDiv.appendChild(para);
                div.appendChild(inDiv);
            }
            RadioButtonManager(radioButtons, questions[i]);
        } else if (questions[i].type == "checkbox") {
            var checkboxbuttons = [];
            for (var a = 0; a < questions[i].odgovori.length; a++) {
                let inDiv = document.createElement("div");

                var box = document.createElement("input");
                box.setAttribute("type", "checkbox");
                box.setAttribute("value", questions[i].vrijednosti[a]);

                questions[i].polja.push(box);
                inDiv.appendChild(box);
                checkboxbuttons.push(box);

                inDiv.appendChild(document.createTextNode(questions[i].odgovori[a]));

                var para = document.createElement("div");
                para.style.display = "inline";

                if (JSON.stringify(questions[i].odgovoreno) != "{}" && questions[i].odgovoreno[questions[i].vrijednosti[a]]) {
                    para.innerHTML = NUMBER_START + questions[i].odgovoreno[questions[i].vrijednosti[a]];
                }

                para.id = questions[i].id + "_" + questions[i].vrijednosti[a];

                inDiv.appendChild(para);

                div.appendChild(inDiv);
            }

            CheckboxManager(checkboxbuttons, questions[i]);
        }

        mainDiv.appendChild(div);
    }
}


function CheckboxManager(buttons, question) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function (e) {
            socket.emit("update", {
                username: username,
                questionId: question.id,
                answerId: this.value
            });
        });
    }
}

function RadioButtonManager(buttons, question) {
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function (e) {
            for (var b = 0; b < buttons.length; b++) {
                if (this.value != buttons[b].value) {
                    console.log("UNCHEKED");
                    buttons[b].checked = false;
                }
            }

            socket.emit("update", {
                username: username,
                questionId: question.id,
                answerId: this.value
            });
        });
    }
}