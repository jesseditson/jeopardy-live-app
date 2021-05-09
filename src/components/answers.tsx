import React, {Component} from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";

interface AnswersProps {
    currentQuestion?: QuestionData;
    toggleCorrect: (userId: string) => void
    onFinished: () => void
}

interface AnswersState {
}

export default class Answers extends Component<AnswersProps, AnswersState> {
    constructor(props: AnswersProps) {
        super(props);
        this.state = {};
    }

    render() {
        const {currentQuestion, toggleCorrect, onFinished} = this.props;
        if (!currentQuestion) {
            return null;
        }
        return <div className="answers">
            {Array.from(currentQuestion.answers.entries()).map(([userId, answer]) => {
                const user = quip.apps.getUserById(userId)
                return <div key={userId} onClick={() => toggleCorrect(userId)}>
                    <h2 className="user-name">{user ? user.getName() : userId}</h2>
                    <p className="answer">{answer}</p>
                </div>
            })}
            <div className="footer">
                <button type="submit" onClick={() => onFinished()}>Done</button>
            </div>
        </div>
    }
}