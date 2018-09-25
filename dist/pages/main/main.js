var uuid;
var questions;
var socket;
var username;

var NUMBER_START = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -";

var POLJA = ["Wilhelm Wundt", "Leipzigu", "Ramiro Bujas", "1959", "1879"];
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

                    setTimeout(() => {
                        document.getElementById("predajDiv").style.display = "block";
                        PrepSocket();
                    }, 5000);
                    try {
                        socket = io(window.location.href);
                        console.log(socket);
                        socket.on('indentification', function (data) {
                            console.log(data);
                            console.log(this);
                            if (data.indentification == "expected") {
                                socket.emit('indentification', { indentification: uuid });
                            } else if (data.indentification == "connected") {
                                document.getElementById("predajDiv").style.display = "block";
                                PrepSocket();
                            }
                        });
                    } catch (e) {
                        console.log(e);
                    }
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
            uuid: uuid,
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
                    if (data.odgovoreno[i])
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
            box.classList.add("autocomplete");
            autocomplete(box, POLJA);
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
    try {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", function (e) {
                socket.emit("update", {
                    username: username,
                    questionId: question.id,
                    answerId: this.value
                });
            });
        }
    } catch (e) {
        console.log(e);
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
            try {
                socket.emit("update", {
                    username: username,
                    questionId: question.id,
                    answerId: this.value
                });
            } catch (e) {
                console.log(e);
            }
        });
    }
}









function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
} 