import React, { Component } from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";

interface AnswersProps {
  currentQuestion?: QuestionData;
  toggleCorrect: (userId: string) => void;
  onFinished: () => void;
}

interface AnswersState {}

export default class Answers extends Component<AnswersProps, AnswersState> {
  constructor(props: AnswersProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { currentQuestion, toggleCorrect, onFinished } = this.props;
    if (!currentQuestion) {
      return null;
    }
    return (
      <div className="answers">
        <h1 className="header">Answers!</h1>
        <h2 className="question-text">{currentQuestion.question}</h2>
        <div className="user-answers">
          {Array.from(currentQuestion.answers.entries()).map(
            ([userId, answer]) => {
              const user = quip.apps.getUserById(userId);
              return (
                <div
                  className="user-answer"
                  key={userId}
                  onClick={() => toggleCorrect(userId)}
                >
                  <div className="user-name">
                    <h2>{user ? user.getName() : userId}</h2>
                    <span>
                      {currentQuestion.correctUserIds.has(userId) ? "🏆" : "❌"}
                    </span>
                  </div>
                  <p className="answer">{answer}</p>
                </div>
              );
            }
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
