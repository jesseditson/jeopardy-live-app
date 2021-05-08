import React, {Component, FunctionComponent, ReactNode} from "react";
import quip from "quip-apps-api";
import { CSSTransition } from 'react-transition-group';
import {menuActions, Menu} from "../menus";
import {AppData, RootEntity} from "../model/root";
import { QuestionData } from "../model/question";
import { TopicData } from "../model/topic";
import Modal from "./modal";
import EditGamePrefs, { GamePreferences } from "./edit-game-prefs";

interface MainProps {
    rootRecord: RootEntity;
    menu: Menu;
    isCreation: boolean;
    creationUrl?: string;
}

interface MainState {
    data: AppData;
    showingLeaderboard: boolean;
    showingPreferences: boolean;
    showingQuestions: boolean;
}

type QuestionRow = ({q?: QuestionData, t: TopicData, add?: boolean})[]

const Fade: FunctionComponent<{in: boolean}> = (props) => 
    <CSSTransition
        mountOnEnter={true}
        in={props.in}
        timeout={300}
        classNames="fade"
        unmountOnExit
    >{props.children}</CSSTransition>

export default class Main extends Component<MainProps, MainState> {
    setupMenuActions_(rootRecord: RootEntity) {
        menuActions.showLeaderboard = () => {
            this.setState({showingLeaderboard: true});
        }
        menuActions.showPreferences = () => {
            this.setState({showingPreferences: true});
        }
        menuActions.toggleShowQuestions = () => {
            this.setState(({showingQuestions}) => ({showingQuestions: !showingQuestions}), () => {
                this.props.menu.updateToolbar(rootRecord.getData(), {showingQuestions: this.state.showingQuestions});
            });
        }
        menuActions.togglePlayMode = () => {
            rootRecord.togglePlayMode();
        }
        menuActions.addTopic = () => {
            const {addTopic} = rootRecord.getActions();
            addTopic("New Topic");
        }
    }

    constructor(props: MainProps) {
        super(props);
        const {rootRecord} = props;
        this.setupMenuActions_(rootRecord);
        const data = rootRecord.getData();
        this.state = {data, showingLeaderboard: false, showingPreferences: false, showingQuestions: false};
    }

    componentDidMount() {
        // Set up the listener on the rootRecord (RootEntity). The listener
        // will propogate changes to the render() method in this component
        // using setState
        const {rootRecord} = this.props;
        rootRecord.listen(this.refreshData_);
        this.refreshData_();
    }

    componentWillUnmount() {
        const {rootRecord} = this.props;
        rootRecord.unlisten(this.refreshData_);
    }

    /**
     * Update the app state using the RootEntity's AppData.
     * This component will render based on the values of `this.state.data`.
     * This function will set `this.state.data` using the RootEntity's AppData.
     */
    private refreshData_ = () => {
        const {rootRecord, menu} = this.props;
        const data = rootRecord.getData();
        // Update the app menu to reflect most recent app data
        menu.updateToolbar(data, {showingQuestions: this.state.showingQuestions});
        this.setState({data: rootRecord.getData()});
    };

    private addQuestion = (topicId: string) => {
    const {rootRecord} = this.props;
        const {addQuestion} = rootRecord.getActions();
        addQuestion(topicId, "New Question");
    }

    private changeTopicName = (topicId: string, name: string) => {
        const {rootRecord} = this.props;
        const {setTopicName} = rootRecord.getActions();
        setTopicName(topicId, name)
    }
    private changeQuestion = (questionId: string, question: string) => {
        const {rootRecord} = this.props;
        const {setQuestion} = rootRecord.getActions();
        setQuestion(questionId, question)
    }

    private removeQuestion = (topicId: string, questionId: string) => {
        const {rootRecord} = this.props;
        const {removeQuestion} = rootRecord.getActions();
        removeQuestion(topicId, questionId)
    }
    private removeTopic = (topicId: string) => {
        const {rootRecord} = this.props;
        const {removeTopic} = rootRecord.getActions();
        removeTopic(topicId)
    }

    private updatePreferences = (preferences: GamePreferences) => {
        const {rootRecord} = this.props;
        const {updatePreferences} = rootRecord.getActions();
        updatePreferences(preferences)
        this.closeModal()
    }

    private closeModal = () => {
        this.setState({showingPreferences: false, showingLeaderboard: false})
    }

    // Returns a matrix of questions
    private getQuestions = (topics: TopicData[]): QuestionRow[] => {
        const questions: QuestionRow[] = []
        const maxQuestions: Map<number, number> = new Map()
        topics.forEach((topic, tnum) => {
            maxQuestions.set(tnum, 0)
            topic.questions.forEach((q, i) => {
                questions[i] = questions[i] || []
                questions[i][tnum] = {q, t: topic}
                maxQuestions.set(tnum, Math.max(maxQuestions.get(tnum)!, i + 1))
            })
        })
        for (const [col, loc] of maxQuestions.entries()) {
            questions[loc] = questions[loc] || []
            const t = topics[col]!
            questions[loc][col] = {add: true, t}
        }
        return questions
    }

    renderQuestions = (row: QuestionRow, rowIdx: number) => {
        const {data, showingQuestions} = this.state;
        const {isOwner, isPlaying, baseValue, valueIncrement} = data;

        const elements = []
        for (let i = 0; i < row.length; i++) {
            const d = row[i];
            if (!d) {
                elements.push(<div className="question empty"/>);
            } else if (d.add) {
                elements.push(<div className="question">
                    <h2 className="add-question" onClick={() => this.addQuestion(d.t.uuid)}>+ Add Question</h2>
                </div>)
            } else if (isOwner) {
                elements.push(!isPlaying
                    ? <div className="question">
                        <span>${baseValue + (rowIdx * valueIncrement)}</span>
                        <input onChange={(e) => this.changeQuestion(d.q!.uuid, e.target.value)} value={d.q!.question}/>
                        <a onClick={() => this.removeQuestion(d.t.uuid, d.q!.uuid)}>❌</a>
                    </div>
                    : <div className="question">
                        <h2>{showingQuestions ? d.q!.question : `$${baseValue + (rowIdx * valueIncrement)}`}</h2>
                    </div>)
            } else {
                elements.push(
                    <div className="question"><h2>${baseValue + (rowIdx * valueIncrement)}</h2></div>
                )
            }
        }
        return elements
    }

    render() {
        const {data, showingPreferences} = this.state;
        const {topics, isPlaying, isOwner, baseValue, valueIncrement, questionDuration} = data;
        const gridStyles = {
            gridTemplateColumns: topics.map(t => "1fr").join(" ")
        }
        return (
            <div className="root">
                <div className="topics">
                    <div className="topic-names" style={gridStyles}>
                        {topics.map(t => <div className="topic-name">
                            {isOwner 
                                ? <>
                                    <input onChange={(e) => this.changeTopicName(t.uuid, e.target.value)} value={t.name}/>
                                    {isPlaying ? null : <a onClick={() => this.removeTopic(t.uuid)}>❌</a>}
                                </>
                                : <h2>t.name</h2>}
                        </div>)}
                    </div>
                    <div className="questions" style={gridStyles}>
                        {this.getQuestions(topics).map(this.renderQuestions)}
                    </div>
                </div>
                {<Fade in={showingPreferences}>
                    <Modal showing={showingPreferences} title="Game Preferences" onClose={this.closeModal}>
                        <EditGamePrefs preferences={{baseValue, valueIncrement, questionDuration}} onSetPreferences={this.updatePreferences}/>
                    </Modal>
                </Fade>}
            </div>
        );
    }
}
