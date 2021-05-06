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
}
export default class Main extends Component<MainProps, MainState> {
    setupMenuActions_(rootRecord: RootEntity) {
    }

    constructor(props: MainProps) {
        super(props);
        const {rootRecord} = props;
        this.setupMenuActions_(rootRecord);
        const data = rootRecord.getData();
        this.state = {data};
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

    render() {
        const viewingUser = quip.apps.getViewingUser()
        const {data} = this.state;
        const {topics, ownerId} = data;
        return (
            <div className="root">
                <div className="topics">
                    <div className="topic-names">
                        {topics.map(t => <h2>{t.name}</h2>)}
                        {viewingUser?.id() === ownerId ? <div className="add-topic">Add Topic</div> : null}
                    </div>
                    <div className="questions">
                        {topics.map(t => t.questions.map(q => <div className="question">
                            {q.question}
                            {viewingUser?.id() === ownerId ? <div className="add-question">Add Question</div> : null}
                        </div>))}
                    </div>
                </div>
            </div>
        );
    }
}
