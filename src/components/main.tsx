import React, {Component} from "react";
import quip from "quip-apps-api";
import {menuActions, Menu} from "../menus";
import {AppData, RootEntity} from "../model/root";

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
}

export default class Main extends Component<MainProps, MainState> {
    setupMenuActions_(rootRecord: RootEntity) {
        menuActions.showLeaderboard = () => {
            this.setState({showingLeaderboard: true});
        }
        menuActions.showPreferences = () => {
            this.setState({showingPreferences: true});
        }
        menuActions.togglePlayMode = () => {
            rootRecord.togglePlayMode();
        }
    }

    constructor(props: MainProps) {
        super(props);
        const {rootRecord} = props;
        this.setupMenuActions_(rootRecord);
        const data = rootRecord.getData();
        this.state = {data, showingLeaderboard: false, showingPreferences: false};
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
        menu.updateToolbar(data);
        this.setState({data: rootRecord.getData()});
    };

    private addTopic = () => {
        const {rootRecord} = this.props;
        const {addTopic} = rootRecord.getActions();
        addTopic("New Topic");
    }

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

    render() {
        const {data} = this.state;
        const {topics, isOwner} = data;
        const gridStyles = {
            gridTemplateColumns: (isOwner ? ["1fr"] : []).concat(topics.map(t => "1fr")).join(" ")
        }
        return (
            <div className="root">
                <div className="topics">
                    <div className="topic-names" style={gridStyles}>
                        {topics.map(t => isOwner ? <input onChange={(e) => this.changeTopicName(t.uuid, e.target.value)} value={t.name}/> : <h2>t.name</h2>)}
                        {isOwner ? <div className="add-topic" onClick={this.addTopic}>+ Add Topic</div> : null}
                    </div>
                    <div className="questions" style={gridStyles}>
                        {topics.map(t => <>
                            {t.questions.map(q => <div className="question">
                            {topics.map(t => isOwner ? <input onChange={(e) => this.changeQuestion(q.uuid, e.target.value)} value={q.question}/> : <h2>q.question</h2>)}
                            </div>)}
                            {isOwner ? <div className="add-question" onClick={() => this.addQuestion(t.uuid)}>+ Add Question</div> : null}
                        </>)}
                    </div>
                </div>
            </div>
        );
    }
}
