import React, {Component} from "react";
import quip from "quip-apps-api";

export interface GamePreferences {
    baseValue: number,
    valueIncrement: number,
    questionDuration: number,
}

interface EditGamePrefsProps {
    preferences: GamePreferences
    onSetPreferences: (preferences: GamePreferences) => void
}

interface EditGamePrefsState {
    baseValue: number,
    valueIncrement: number,
    questionDuration: number,
}


export default class EditGamePrefs extends Component<EditGamePrefsProps, EditGamePrefsState> {
    constructor(props: EditGamePrefsProps) {
        super(props);
        const {
            baseValue,
            valueIncrement,
            questionDuration,
        } = props.preferences;
        this.state = {
            baseValue,
            valueIncrement,
            questionDuration,
        };
    }

    private setBaseValue = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({baseValue: parseInt(e.target.value, 10)})
    private setValueIncrement = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({valueIncrement: parseInt(e.target.value, 10)})
    private setQuestionDuration = (e: React.ChangeEvent<HTMLInputElement>) => this.setState({questionDuration: parseInt(e.target.value, 10) * 1000})

    private onSave = () => {
        const {onSetPreferences} = this.props;
        const {
            baseValue,
            valueIncrement,
            questionDuration,
        } = this.state;
        onSetPreferences({
            baseValue,
            valueIncrement,
            questionDuration
        })
    }

    render() {
        const {
            baseValue,
            valueIncrement,
            questionDuration,
        } = this.state;
        // TODO:
        // Set daily double to either a square or "Random" (which will choose when you hit play)
        return <div className="preferences">
            <div className="settings">
                <h3>Base Point Value</h3>
                <input name="baseValue" type="number" onChange={this.setBaseValue} value={baseValue}></input>
                <h3>Point Increment</h3>
                <input name="valueIncrement" type="number" onChange={this.setValueIncrement} value={valueIncrement}></input>
                <h3>Question Duration (seconds)</h3>
                <input name="questionDuration" type="number" onChange={this.setQuestionDuration} value={Math.round(questionDuration / 1000)}></input>
            </div>
            <div className="footer">
                <button type="submit" onClick={this.onSave}>Save</button>
            </div>
        </div>
    }
}