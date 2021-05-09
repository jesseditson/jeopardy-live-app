import quip from "quip-apps-api";
import { GamePreferences } from "../components/edit-game-prefs";
import { Question, QuestionData } from "./question";
import { Topic, TopicData } from "./topic";

export interface AppData {
  isOwner: boolean;
  ownerId: string;
  isPlaying: boolean;
  topics: TopicData[];
  baseValue: number;
  valueIncrement: number;
  questionDuration: number;
  currentQuestionId?: string;
  questionStart?: number;
  finishedQuestions: Set<string>;
  showingCorrectAnswers: boolean;
  userImages: Map<string, string>;
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
      currentQuestionId: "string",
      questionStart: "number",
      finishedQuestions: "array",
      showingCorrectAnswers: "boolean",
      userImages: "object",
    };
  }

  static getDefaultProperties(): { [property: string]: any } {
    const viewingUser = quip.apps.getViewingUser();
    if (!viewingUser) {
      throw new Error("can't initialize if you're not logged in.");
    }
    return {
      ownerId: viewingUser?.id(),
      topics: [{ name: "New Topic" }],
      baseValue: 100,
      valueIncrement: 100,
      questionDuration: 30 * 1000, // 30 seconds
      isPlaying: false,
      finishedQuestions: [],
      showingCorrectAnswers: false,
      userImages: {},
    };
  }

  getTopics = () => this.get("topics") as quip.apps.RecordList<Topic>;
  togglePlayMode = () => this.set("isPlaying", !this.get("isPlaying"));

  private topicsChanged = () => this.notifyListeners();
  private currentTopics: Set<Topic> = new Set();

  private countdownInterval: number | undefined;
  private startCountingDown = () => {
    this.set("showingCorrectAnswers", false);
    this.countdownInterval = window.setInterval(() => {
      const start = this.get("questionStart");
      const now = new Date().getTime();
      const duration = this.get("questionDuration");
      if (now - start > duration) {
        // When complete, show the correct answers to everyone
        this.set("showingCorrectAnswers", true);
        window.clearInterval(this.countdownInterval);
      }
    }, 500);
  };

  initialize() {
    const listenToTopics = () => {
      this.currentTopics.forEach((topic) => {
        topic.unlisten(this.topicsChanged);
      });
      this.currentTopics = new Set();
      this.getTopics()
        .getRecords()
        .forEach((topic) => {
          this.currentTopics.add(topic);
          topic.listen(this.topicsChanged);
        });
    };
    this.getTopics().listen(() => {
      listenToTopics();
      this.topicsChanged();
    });
    listenToTopics();
    if (this.get("currentQuestionId")) {
      this.startCountingDown();
    }
  }

  getData(): AppData {
    const topics = this.getTopics()
      .getRecords()
      .map((t) => t.getData());
    const viewingUser = quip.apps.getViewingUser();
    const isOwner = viewingUser?.id() === this.get("ownerId");
    const userImages = new Map();
    const userImagesObj = this.get("userImages") as { [key: string]: string };
    for (const userId in userImagesObj) {
      userImages.set(userId, userImagesObj[userId]);
    }
    return {
      ownerId: this.get("ownerId"),
      isOwner,
      isPlaying: this.get("isPlaying"),
      valueIncrement: this.get("valueIncrement"),
      baseValue: this.get("baseValue"),
      questionDuration: this.get("questionDuration"),
      questionStart: this.get("questionStart"),
      currentQuestionId: this.get("currentQuestionId"),
      topics,
      finishedQuestions: new Set(this.get("finishedQuestions")),
      showingCorrectAnswers: this.get("showingCorrectAnswers"),
      userImages,
    };
  }

  getActions() {
    return {
      onAnswer: (answer: string) => {
        const currentQuestionId = this.get("currentQuestionId");
        if (!currentQuestionId) {
          return;
        }
        const question = quip.apps.getRecordById(currentQuestionId) as Question;
        const userId = quip.apps.getViewingUser()?.id();
        if (!userId || !question) {
          return;
        }
        question.addAnswer(userId, answer);
      },
      addTopic: (name: string) => {
        this.getTopics().add({ name });
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
        const { baseValue, valueIncrement, questionDuration } = preferences;
        this.set("baseValue", baseValue);
        this.set("valueIncrement", valueIncrement);
        this.set("questionDuration", questionDuration);
      },
      setCurrentQuestion: (questionId?: string) => {
        this.set("questionStart", undefined);
        if (!questionId) {
          this.set("currentQuestionId", undefined);
          return;
        }
        const question = quip.apps.getRecordById(questionId) as Question;
        if (!question) {
          return;
        }
        this.set("questionStart", new Date().getTime());
        this.set("currentQuestionId", question.id());
        this.startCountingDown();
      },
      toggleAnswerCorrect: (userId: string) => {
        const currentQuestionId = this.get("currentQuestionId");
        if (!currentQuestionId) {
          return;
        }
        const question = quip.apps.getRecordById(currentQuestionId) as Question;
        if (!question) {
          return;
        }
        question.toggleCorrect(userId);
        // this.set("currentQuestionId", question.id());
      },
      finishMarkingAnswers: () => {
        const currentQuestionId = this.get("currentQuestionId");
        if (!currentQuestionId) {
          return;
        }
        const finishedQuestions = this.get("finishedQuestions");
        finishedQuestions.push(currentQuestionId);
        this.set("finishedQuestions", finishedQuestions);
        this.set("currentQuestionId", undefined);
      },
      updateUserImage: (imageURI?: string) => {
        const userImages: { [id: string]: string } = this.get("userImages");
        const userId = quip.apps.getViewingUser()?.id();
        if (userId) {
          if (!imageURI) {
            delete userImages[userId];
          } else {
            userImages[userId] = imageURI;
          }
          this.set("userImages", userImages);
        }
      },
    };
  }
}
