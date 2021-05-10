import quip from "quip-apps-api";
import {Answer} from "./answer";

export interface QuestionData {
  uuid: string;
  question?: string;
  answers: Map<string, string>;
  correctUserIds: Set<string>;
}

export class Question extends quip.apps.Record {
  static ID = "question";

  static getProperties() {
    return {
      question: "string",
      answers: quip.apps.RecordList.Type(Answer),
      correctUserIds: "array",
    };
  }

  static getDefaultProperties(): { [property: string]: any } {
    return {
      answers: [],
      correctUserIds: [],
    };
  }

  private answersChanged = () => this.notifyListeners();
  private currentAnswers: Set<Answer> = new Set();

  initialize() {
    const listenToAnswers = () => {
      this.currentAnswers.forEach((answer) => {
        answer.unlisten(this.answersChanged);
      });
      this.currentAnswers = new Set();
      this.getAnswers()
        .getRecords()
        .forEach((answer) => {
          this.currentAnswers.add(answer);
          answer.listen(this.answersChanged);
        });
    };
    this.getAnswers().listen(() => {
      listenToAnswers();
      this.answersChanged();
    });
    listenToAnswers();
  }

  private getAnswers = () => this.get("answers") as quip.apps.RecordList<Answer>

  setQuestion = (question: string) => this.set("question", question);

  setAnswer(userId: string, answer: string) {
    const answers = this.getAnswers().getRecords();
    for (const record of answers) {
      if (record.getData().userId === userId) {
        record.updateAnswer(answer);
        return;
      }
    }
    this.getAnswers().add({userId, answer});
  }

  toggleCorrect(userId: string) {
    const correctUserIds = this.get("correctUserIds");
    const existingIndex = correctUserIds.indexOf(userId);
    if (existingIndex === -1) {
      correctUserIds.push(userId);
    } else {
      correctUserIds.splice(existingIndex, 1);
    }
    this.set("correctUserIds", correctUserIds);
  }

  getData(): QuestionData {
    const answerRecords = this.getAnswers();
    let answers: Map<string, string> = new Map();
    for (const record of answerRecords.getRecords()) {
      const {userId, answer} = record.getData();
      answers.set(userId!, answer!);
    }
    const correctUserIds: Set<string> = new Set(this.get("correctUserIds"));
    return {
      uuid: this.getId(),
      question: this.get("question") as string | undefined,
      answers,
      correctUserIds,
    };
  }
}
