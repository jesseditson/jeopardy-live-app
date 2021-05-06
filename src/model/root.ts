import quip from "quip-apps-api";
import { Question } from "./question";
import { Topic, TopicData } from "./topic";

export interface AppData {
    ownerId: string;
    topics: TopicData[]
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "root";

    static getProperties() {
        return {
            ownerId: "string",
            topics: quip.apps.RecordList.Type(Topic)
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        const viewingUser = quip.apps.getViewingUser()
        if (!viewingUser) {
            throw new Error("can't initialize if you're not logged in.");
        }
        return {
            ownerId: viewingUser?.id(),
            topics: []
        };
    }

    getTopics = () => this.get("topics") as quip.apps.RecordList<Topic>;

    initialize() {
        this.getTopics().listen(() => {
            this.notifyListeners();
        })
    }

    getData(): AppData {
        const topics = this.getTopics().getRecords().map(t => t.getData())
        return {
            ownerId: this.get("ownerId"),
            topics
        };
    }

    getActions() {
        return {
            onAnswer: (questionId: string, answer: string) => {
                const question = quip.apps.getRecordById(questionId) as Question;
                const userId = quip.apps.getViewingUser()?.id();
                if (!userId || !question) {
                    return;
                }
                question.addAnswer(userId, answer);
            },
            addTopic: (name: string) => {
                this.getTopics().add({name});
            },
            addQuestion: (topicId: string, text: string, value: number) => {
                const topic = quip.apps.getRecordById(topicId) as Topic;
                if (!topic) {
                    return;
                }
                topic.addQuestion(text, value);
            },
            setQuestionValue: (questionId: string, value: number) => {
                const question = quip.apps.getRecordById(questionId) as Question;
                if (!question) {
                    return;
                }
                question.setValue(value);
            }
        };
    }
}
