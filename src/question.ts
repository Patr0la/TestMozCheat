export class Question {
    public type: string;

    public id: string;
    public odgovori: Array<string>;
    public vrijednosti: Array<string>;
    public pitanje: string;

    public odgovoreno: { [key: string]: number } = {};
    public odgovorili: { [key: string]: Array<string>} = {};
    constructor(id: string, pitanje: string, odgovori: Array<string>, type: string, vrijednosti?: Array<string>) {
        this.id = id;
        this.pitanje = pitanje;
        this.odgovori = odgovori;
        this.type = type;

        if (type != "text")
            this.vrijednosti = vrijednosti;
    }
}

export type QuestionType = "zaokruzivanje" | "viseZaokruzivanje" | "nadopunjivanje";