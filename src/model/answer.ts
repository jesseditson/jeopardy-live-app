import quip from "quip-apps-api";

export interface AnswerData {
  uuid: string;
  userId?: string;
  answer?: string;
}

export class Answer extends quip.apps.Record {
  static ID = "answer";

  static getProperties() {
    return {
      userId: "string",
      answer: "string"
    };
  }

  static getDefaultProperties(): { [property: string]: any } {
    return {};
  }

  updateAnswer = (answer: string) => {
    this.set("answer", answer);
  }

  getData(): AnswerData {
    return {
      uuid: this.getId(),
      userId: this.get("userId") as string | undefined,
      answer: this.get("answer") as string | undefined,
    };
  }
}
