"use strict";
exports.__esModule = true;
var Question = /** @class */ (function () {
    function Question(id, pitanje, odgovori, type, vrijednosti) {
        this.odgovoreno = {};
        this.odgovorili = {};
        this.id = id;
        this.pitanje = pitanje;
        this.odgovori = odgovori;
        this.type = type;
        if (type != "text")
            this.vrijednosti = vrijednosti;
    }
    return Question;
}());
exports.Question = Question;
