import React, { Component } from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";
import UserName from "./user-name";

interface CorrectAnswersProps {
  currentQuestion?: QuestionData;
  userImages: Map<string, string>;
}

interface CorrectAnswersState {}

export default class CorrectAnswers extends Component<
  CorrectAnswersProps,
  CorrectAnswersState
> {
  constructor(props: CorrectAnswersProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { currentQuestion, userImages } = this.props;
    if (!currentQuestion) {
      return null;
    }
    const answers = Array.from(currentQuestion.answers.entries())
    return (
      <div className="answers">
        <h1 className="header">Answers!</h1>
        <h2 className="question-text">{currentQuestion.question}</h2>
        {answers.length > 0 ? <h2 className="correct-answers-title">🏆 Correct Answers 🏆</h2> : null}
        <div className="correct-answers">
          {answers
            .filter(([userId]) => currentQuestion.correctUserIds.has(userId))
            .map(([userId, answer]) => {
              const user = quip.apps.getUserById(userId);
              return (
                <div className="user-correct-answer" key={userId}>
                  <div className="user-name">
                    <UserName userId={userId} userImages={userImages} />
                  </div>
                  <p className="answer">{answer}</p>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
