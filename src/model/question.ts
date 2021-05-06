import quip from "quip-apps-api";

export interface QuestionData {
    uuid: string;
    value?: number;
    question?: string;
    answers: Map<string, string>;
    correctUserIds: Set<string>;
}

export class Question extends quip.apps.Record {
    static ID = "question";

    static getProperties() {
        return {
            value: "number",
            question: "string",
            answers: "object",
            correctUserIds: "array"
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        return {
            answers: {},
            correctUserId: []
        };
    }

    addAnswer(userId: string, answer: string) {
        const answers = this.get("answers");
        if (answers[userId]) {
            throw new Error("Can't replace your answer.");
        }
        answers[userId] = answer;
        this.set("answers", answers);
    }

    setValue(value: number) {
        this.set("value", value);
    }

    getData(): QuestionData {
        const answersObj = this.get("answers")
        let answers: Map<string, string> = new Map();
        for (const answer in answersObj) {
            answers.set(answer, answersObj[answer]);
        }
        const correctUserIds: Set<string> = new Set(this.get("correctUserIds"));
        return {
            uuid: this.getId(),
            value: this.get("value") as number | undefined,
            question: this.get("question") as string | undefined,
            answers,
            correctUserIds
        };
    }
}
