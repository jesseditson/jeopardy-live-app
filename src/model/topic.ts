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

    private questionsChanged = () => this.notifyListeners();
    private currentQuestions: Set<Question> = new Set();

    initialize() {
        const listenToQuestions = () => {
            this.currentQuestions.forEach(question => {
                question.unlisten(this.questionsChanged);
            })
            this.currentQuestions = new Set();
            this.getQuestions().getRecords().forEach(question => {
                this.currentQuestions.add(question);
                question.listen(this.questionsChanged);
            })
        }
        this.getQuestions().listen(() => {
            listenToQuestions();
            this.questionsChanged();
        })
        listenToQuestions();
    }

    addQuestion(text: string) {
        const questions = this.getQuestions();
        questions.add({question: text});
    }
    removeQuestion(uuid: string) {
        const question = quip.apps.getRecordById(uuid) as Question
        if (question) {
            this.getQuestions().remove(question)
        }
    }

    getData(): TopicData {
        const questions = this.getQuestions().getRecords().map(q => q.getData());
        return {
            uuid: this.getId(),
            name: this.get("name") as string | undefined,
            questions,
        };
    }
}
