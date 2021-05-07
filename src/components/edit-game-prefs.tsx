import React, {Component} from "react";
import quip from "quip-apps-api";

interface EditGamePrefsProps {
}

interface EditGamePrefsState {
}

export default class EditGamePrefs extends Component<EditGamePrefsProps, EditGamePrefsState> {
    constructor(props: EditGamePrefsProps) {
        super(props);
        this.state = {};
    }

    render() {
        // TODO:
        // Set base value, set increment
        // Set question answer timeout
        // Set daily double to either a square or "Random" (which will choose when you hit play)
        return <div></div>
    }
}