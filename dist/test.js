"use strict";
exports.__esModule = true;
var Test = /** @class */ (function () {
    function Test(id, questions) {
        this.questions = questions;
        this.id = id;
    }
    Test.prototype.OdgovoriNaPitanje = function (questionId, answerId, username, callback) {
        for (var q = 0; q < this.questions.length; q++) {
            if (this.questions[q].id == questionId) {
                if (this.questions[q].type == "text") {
                    if (this.questions[q].odgovorili[username]) {
                        if (this.questions[q].odgovoreno[this.questions[q].odgovorili[username][0]])
                            this.questions[q].odgovoreno[this.questions[q].odgovorili[username][0]]--;
                        this.questions[q].odgovorili[username][0] = answerId;
                        if (this.questions[q].odgovoreno[answerId])
                            this.questions[q].odgovoreno[answerId]++;
                        else
                            this.questions[q].odgovoreno[answerId] = 1;
                    }
                    else {
                        this.questions[q].odgovorili[username] = [answerId];
                        if (this.questions[q].odgovoreno[answerId])
                            this.questions[q].odgovoreno[answerId]++;
                        else
                            this.questions[q].odgovoreno[answerId] = 1;
                    }
                }
                else if (this.questions[q].type == "checkbox") {
                    console.log("CHECKOBOXXXXXXXXX");
                    if (this.questions[q].odgovorili[username]) {
                        var uncheked = false;
                        for (var i = 0; i < this.questions[q].odgovorili[username].length; i++) {
                            if (this.questions[q].odgovorili[username][i] == answerId) {
                                uncheked = true;
                                this.questions[q].odgovorili[username][i] = null;
                                this.questions[q].odgovoreno[answerId]--;
                            }
                        }
                        if (!uncheked) {
                            this.questions[q].odgovorili[username].push(answerId);
                            if (this.questions[q].odgovoreno[answerId] != null && this.questions[q].odgovoreno[answerId] != undefined)
                                this.questions[q].odgovoreno[answerId]++;
                            else
                                this.questions[q].odgovoreno[answerId] = 1;
                        }
                    }
                    else {
                        this.questions[q].odgovorili[username] = [answerId];
                        if (this.questions[q].odgovoreno[answerId])
                            this.questions[q].odgovoreno[answerId]++;
                        else
                            this.questions[q].odgovoreno[answerId] = 1;
                    }
                }
                else if (this.questions[q].type == "radio") {
                    if (this.questions[q].odgovorili[username]) {
                        if (this.questions[q].odgovorili[username][0] != answerId) {
                            this.questions[q].odgovoreno[this.questions[q].odgovorili[username][0]]--;
                            this.questions[q].odgovorili[username][0] = answerId;
                            if (this.questions[q].odgovoreno[answerId] != undefined && this.questions[q].odgovoreno[answerId] != null)
                                this.questions[q].odgovoreno[answerId]++;
                            else
                                this.questions[q].odgovoreno[answerId] = 1;
                        }
                    }
                    else {
                        this.questions[q].odgovorili[username] = [answerId];
                        if (this.questions[q].odgovoreno[answerId] != undefined && this.questions[q].odgovoreno[answerId] != null)
                            this.questions[q].odgovoreno[answerId]++;
                        else
                            this.questions[q].odgovoreno[answerId] = 1;
                    }
                }
                callback(this.questions[q]);
                break;
            }
        }
    };
    return Test;
}());
exports.Test = Test;
