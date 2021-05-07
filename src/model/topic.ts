import quip from "quip-apps-api";
import { Question, QuestionData } from "./question";

export interface TopicData {
    uuid: string;
    name?: string;
    questions: QuestionData[];
}

export class Topic extends quip.apps.Record {
    static ID = "topic";

    static getProperties() {
        return {
            name: "string",
            questions: quip.apps.RecordList.Type(Question)
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        return {
            questions: []
        };
    }

    getQuestions = () => this.get("questions") as quip.apps.RecordList<Question>
    setName = (name: string) => this.set("name", name)

    initialize() {
        const listenToQuestions = () => {
            this.getQuestions().getRecords().forEach(question => {
                question.unlisten(this.notifyListeners);
                question.listen(this.notifyListeners);
            })
        }
        this.getQuestions().listen(() => {
            this.notifyListeners();
            listenToQuestions();
        })
    }

    addQuestion(text: string) {
        const questions = this.getQuestions();
        questions.add({question: text});
    }

    getData(): TopicData {
        const questions = this.getQuestions().getRecords().map(q => q.getData())
        return {
            uuid: this.getId(),
            name: this.get("name") as string | undefined,
            questions,
        };
    }
}
