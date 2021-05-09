import React, {Component} from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";

interface CorrectAnswersProps {
    currentQuestion?: QuestionData
}

interface CorrectAnswersState {
}

export default class CorrectAnswers extends Component<CorrectAnswersProps, CorrectAnswersState> {
    constructor(props: CorrectAnswersProps) {
        super(props);
        this.state = {};
    }

    render() {
        const {currentQuestion} = this.props;
        if (!currentQuestion) {
            return null;
        }
        return <div className="answers">
            <h1 className="header">Answers!</h1>
            <h2 className="question-text">{currentQuestion.question}</h2>
            <h2 className="correct-answers-title">🏆 Correct 🏆</h2>
            <div className="correct-answers">
                {Array.from(currentQuestion.answers.entries())
                    .filter(([userId]) => currentQuestion.correctUserIds.has(userId))
                    .map(([userId, answer]) => {
                        const user = quip.apps.getUserById(userId)
                        return <div className="user-correct-answer" key={userId}>
                            <div className="user-name"><h2>{user ? user.getName() : userId}:</h2></div>
                            <p className="answer">{answer}</p>
                        </div>
                    })}
            </div>
        </div>
    }
}