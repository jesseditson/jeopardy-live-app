import React, { Component } from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";

interface AnswerProps {
  isOwner: boolean;
  questionDuration: number;
  questionStart?: number;
  currentQuestion?: QuestionData;
  answerChanged: (answer: string) => void;
  addMoreTime: () => void;
  skipToAnswers: () => void;
}

interface AnswerState {
  remainingSeconds: number;
  answer: string;
}

export default class Answer extends Component<AnswerProps, AnswerState> {
  constructor(props: AnswerProps) {
    super(props);
    this.state = {
      remainingSeconds: props.questionDuration / 1000,
      answer: "",
    };
  }

  componentDidMount() {
    if (this.props.questionStart) {
      this.startCountdownTimer();
    }
  }

  private countdownInterval: number | undefined;
  private startCountdownTimer = () => {
    this.countdownInterval = window.setInterval(() => {
      const { questionStart, questionDuration } = this.props;
      const now = new Date().getTime();
      const msRemaining = questionDuration - (now - (questionStart || 0));
      const remainingSeconds = Math.max(Math.ceil(msRemaining / 1000), 0);
      this.setState({ remainingSeconds });
    }, 500);
  };

  componentDidUpdate(prevProps: AnswerProps) {
    if (prevProps.currentQuestion?.uuid !== this.props.currentQuestion?.uuid) {
      if (this.props.currentQuestion) {
        this.startCountdownTimer();
      } else {
        window.clearInterval(this.countdownInterval);
      }
    }
  }

  private updateAnswer = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { answerChanged } = this.props;
    const answer = event.target.value;
    this.setState({ answer });
    answerChanged(answer);
  };

  render() {
    const { currentQuestion, isOwner, addMoreTime, skipToAnswers } = this.props;
    const { remainingSeconds, answer } = this.state;
    return (
      <div className="question-answer">
        {remainingSeconds === 0 ? (
          <h2 className="times-up">Time's Up!</h2>
        ) : null}
        <div className="countdown">
          {remainingSeconds} Second{remainingSeconds === 1 ? "" : "s"} Remaining
        </div>
        <div className="question finished">
          <h2>{currentQuestion?.question}</h2>
        </div>
        {!isOwner ? (
          <div className="answer-text">
            <textarea
              value={answer}
              disabled={remainingSeconds === 0}
              placeholder="Enter Answer"
              onChange={this.updateAnswer}
            />
          </div>
        ) : (
          <div className="answer-text">
            <h2>Users are choosing their answers...</h2>
            <div className="controls">
              <button type="submit" onClick={() => addMoreTime()}>
                Reset Timer
              </button>
              <button type="submit" onClick={() => skipToAnswers()}>
                {remainingSeconds > 0 ? "End Early" : "Choose Correct Answers"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
