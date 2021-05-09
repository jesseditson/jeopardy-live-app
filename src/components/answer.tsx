import React, {Component} from "react";
import quip from "quip-apps-api";
import { QuestionData } from "../model/question";

interface AnswerProps {
    isOwner: boolean;
    questionDuration: number,
    questionStart?: number,
    currentQuestion?: QuestionData,
    answerChanged: (answer: string) => void
}

interface AnswerState {
    remainingSeconds: number;
    answer: string;
}

export default class Answer extends Component<AnswerProps, AnswerState> {
    constructor(props: AnswerProps) {
        super(props);
        this.state = { remainingSeconds: props.questionDuration / 1000, answer: "" };
    }

    componentDidMount() {
        if (this.props.questionStart) {
            this.startCountdownTimer()
        }
    }

    private countdownInterval: number | undefined;
    private startCountdownTimer = () => {
        this.countdownInterval = window.setInterval(() => {
            const {questionStart, questionDuration} = this.props;
            const now = new Date().getTime();
            const msRemaining = questionDuration - (now - (questionStart || 0))
            const remainingSeconds = Math.ceil(msRemaining / 1000);
            this.setState({ remainingSeconds });
        }, 500)
    }

    componentDidUpdate(prevProps: AnswerProps) {
        if (prevProps.currentQuestion?.uuid !== this.props.currentQuestion?.uuid) {
            if (this.props.currentQuestion) {
                this.startCountdownTimer()
            } else {
                window.clearInterval(this.countdownInterval)
            }
        }
    }

    private ref = React.createRef<HTMLDivElement>()
    
    private updateAnswer = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const {answerChanged} = this.props;
        const answer = event.target.value
        this.setState({answer})
        answerChanged(answer)
    }

    render() {
        const {currentQuestion, isOwner} = this.props;
        const {remainingSeconds, answer} = this.state;
        let inputWidth = 0;
        if (this.ref.current) {
            inputWidth = this.ref.current?.getBoundingClientRect().width - 20
        }
        return <div className="question-answer" ref={this.ref}>
            <div className="countdown">{remainingSeconds} Second{remainingSeconds > 1 ? "s" : ""} Remaining</div>
            <div className="question finished">
                <h2>{currentQuestion?.question}</h2>
            </div>
            {!isOwner ? <div className="answer-text" style={{width: inputWidth}}>
                <textarea value={answer} placeholder="Enter Answer" onChange={this.updateAnswer}/>
            </div> : null}
        </div>
    }
}