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
            {Array.from(currentQuestion.answers.entries())
                .filter(([userId]) => currentQuestion.correctUserIds.has(userId))
                .map(([userId, answer]) => {
                    const user = quip.apps.getUserById(userId)
                    return <div key={userId}>
                        <h2 className="user-name">{user ? user.getName() : userId}</h2>
                        <p className="answer">{answer}</p>
                    </div>
                })}
        </div>
    }
}