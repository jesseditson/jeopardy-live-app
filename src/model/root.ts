import quip from "quip-apps-api";
import { GamePreferences } from "../components/edit-game-prefs";
import { Question, QuestionData } from "./question";
import { Topic, TopicData } from "./topic";

export interface AppData {
    isOwner: boolean;
    isPlaying: boolean;
    topics: TopicData[]
    baseValue: number,
    valueIncrement: number,
    questionDuration: number,
    currentQuestion?: QuestionData,
    questionStart?: number,
    finishedQuestions: Set<string>
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
            currentQuestion: "object",
            questionStart: "number",
            finishedQuestions: "array",
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
            finishedQuestions: []
        };
    }

    getTopics = () => this.get("topics") as quip.apps.RecordList<Topic>;
    togglePlayMode = () => this.set("isPlaying", !this.get("isPlaying"));

    private topicsChanged = () => this.notifyListeners();
    private currentTopics: Set<Topic> = new Set();

    private countdownInterval: number | undefined;
    private startCountingDown = () => {
        this.countdownInterval = window.setInterval(() => {
            const start = this.get("questionStart");
            const now = new Date().getTime();
            const duration = this.get("questionDuration");
            if (now - start > duration) {
                this.set("currentQuestion", undefined);
                window.clearInterval(this.countdownInterval)
            }
        }, 500);
    }

    initialize() {
        const listenToTopics = () => {
            this.currentTopics.forEach(topic => {
                topic.unlisten(this.topicsChanged);
            })
            this.currentTopics = new Set();
            this.getTopics().getRecords().forEach(topic => {
                this.currentTopics.add(topic);
                topic.listen(this.topicsChanged);
            })
        }
        this.getTopics().listen(() => {
            listenToTopics();
            this.topicsChanged();
        })
        listenToTopics();
        if (this.get("currentQuestion")) {
            this.startCountingDown()
        }
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
            currentQuestion: this.get("currentQuestion"),
            topics,
            finishedQuestions: new Set(this.get("finishedQuestions"))
        };
    }

    getActions() {
        return {
            onAnswer: (answer: string) => {
                const currentQuestion = this.get("currentQuestion")
                if (!currentQuestion) {
                    return;
                }
                const question = quip.apps.getRecordById(currentQuestion.uuid) as Question;
                const userId = quip.apps.getViewingUser()?.id();
                if (!userId || !question) {
                    return;
                }
                question.addAnswer(userId, answer);
            },
            addTopic: (name: string) => {
                this.getTopics().add({name});
            },
            removeTopic: (topicId: string) => {
                const topic = quip.apps.getRecordById(topicId) as Topic;
                if (!topic) {
                    return;
                }
                this.getTopics().remove(topic);
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
            removeQuestion: (topicId: string, questionId: string) => {
                const topic = quip.apps.getRecordById(topicId) as Topic;
                if (!topic) {
                    return;
                }
                topic.removeQuestion(questionId);
            },
            setQuestion: (questionId: string, text: string) => {
                const question = quip.apps.getRecordById(questionId) as Question;
                if (!question) {
                    return;
                }
                question.setQuestion(text);
            },
            updatePreferences: (preferences: GamePreferences) => {
                const {baseValue, valueIncrement, questionDuration} = preferences;
                this.set("baseValue", baseValue);
                this.set("valueIncrement", valueIncrement);
                this.set("questionDuration", questionDuration);
            },
            setCurrentQuestion: (questionId?: string) => {
                this.set("questionStart", undefined);
                if (!questionId) {
                    this.set("currentQuestion", undefined);
                    return;
                }
                const question = quip.apps.getRecordById(questionId) as Question;
                if (!question) {
                    return;
                }
                const finishedQuestions = this.get("finishedQuestions");
                finishedQuestions.push(questionId);
                this.set("finishedQuestions", finishedQuestions);
                this.set("questionStart", new Date().getTime());
                this.set("currentQuestion", question.getData());
                this.startCountingDown();
            }
        };
    }
}
