import quip from "quip-apps-api";
import { Question, QuestionData } from "./question";
import { Topic, TopicData } from "./topic";

export interface AppData {
    isOwner: boolean;
    isPlaying: boolean;
    topics: TopicData[]
    baseValue: number,
    valueIncrement: number,
    questionDuration: number,
    showingQuestion?: QuestionData,
    questionStart?: number,
}

export class RootEntity extends quip.apps.RootRecord {
    static ID = "root";

    static getProperties() {
        return {
            ownerId: "string",
            topics: quip.apps.RecordList.Type(Topic),
            isPlaying: "boolean",
            baseValue: "number",
            questionDuration: "number",
            valueIncrement: "number",
            showingQuestion: "object",
            questionStart: "number"
        };
    }

    static getDefaultProperties(): {[property: string]: any} {
        const viewingUser = quip.apps.getViewingUser()
        if (!viewingUser) {
            throw new Error("can't initialize if you're not logged in.");
        }
        return {
            ownerId: viewingUser?.id(),
            topics: [],
            baseValue: 100,
            valueIncrement: 100,
            questionDuration: 30 * 1000, // 30 seconds
            isPlaying: false,
        };
    }

    getTopics = () => this.get("topics") as quip.apps.RecordList<Topic>;
    togglePlayMode = () => this.set("isPlaying", !this.get("isPlaying"));

    initialize() {
        const listenToTopics = () => {
            this.getTopics().getRecords().forEach(topics => {
                topics.unlisten(this.notifyListeners);
                topics.listen(this.notifyListeners);
            })
        }
        this.getTopics().listen(() => {
            this.notifyListeners();
            listenToTopics();
        })
    }

    getData(): AppData {
        const topics = this.getTopics().getRecords().map(t => t.getData());
        const viewingUser = quip.apps.getViewingUser();
        const isOwner = viewingUser?.id() === this.get("ownerId");
        return {
            isOwner,
            isPlaying: this.get("isPlaying"),
            valueIncrement: this.get("valueIncrement"),
            baseValue: this.get("baseValue"),
            questionDuration: this.get("questionDuration"),
            questionStart: this.get("questionStart"),
            showingQuestion: this.get("showingQuestion"),
            topics,
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
            addQuestion: (topicId: string, text: string) => {
                const topic = quip.apps.getRecordById(topicId) as Topic;
                if (!topic) {
                    return;
                }
                topic.addQuestion(text);
            },
            setTopicName: (topicId: string, name: string) => {
                const topic = quip.apps.getRecordById(topicId) as Topic;
                if (!topic) {
                    return;
                }
                topic.setName(name);
            },
            setQuestion: (questionId: string, text: string) => {
                const question = quip.apps.getRecordById(questionId) as Question;
                if (!question) {
                    return;
                }
                question.setQuestion(text);
            },
            setShowingQuestion: (questionId?: string) => {
                this.set("questionStart", undefined);
                if (!questionId) {
                    this.set("showingQuestion", undefined);
                    return;
                }
                const question = quip.apps.getRecordById(questionId) as Question;
                if (!question) {
                    return;
                }
                this.set("questionStart", new Date().getTime());
                this.set("showingQuestion", question.getData());
            }
        };
    }
}
