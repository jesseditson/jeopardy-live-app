import React, { Component } from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";
import UserName from "./user-name";

interface AnswersProps {
  currentQuestion?: QuestionData;
  toggleCorrect: (userId: string) => void;
  onFinished: () => void;
  userImages: Map<string, string>;
}

interface AnswersState {}

export default class Answers extends Component<AnswersProps, AnswersState> {
  constructor(props: AnswersProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { currentQuestion, toggleCorrect, onFinished, userImages } = this.props;
    if (!currentQuestion) {
      return null;
    }
    const answers = Array.from(currentQuestion.answers.entries())
    return (
      <div className="answers">
        <h1 className="header">Choose Correct Answers!</h1>
        <h2 className="question-text">{currentQuestion.question}</h2>
        <div className="user-answers">
          {answers.map(
            ([userId, answer]) => (
              <div
                className="user-answer"
                key={userId}
                onClick={() => toggleCorrect(userId)}
              >
                <div className="user-answer-header">
                  <UserName userId={userId} userImages={userImages}/>
                  <span>
                    {currentQuestion.correctUserIds.has(userId) ? "🏆" : "❌"}
                  </span>
                </div>
                <p className="answer">{answer}</p>
              </div>
            )
          )}
        </div>
        <div className="footer">
          <button type="submit" onClick={() => onFinished()}>
            Done
          </button>
        </div>
      </div>
    );
  }
}
