import React, { Component } from "react";
import quip from "quip-apps-api";
import DrawName from "./draw-name";

interface EditNameProps {
  currentImageURI?: string;
  onSave: (imageURI?: string) => void;
}

interface EditNameState {
  newURI?: string;
}

export default class EditName extends Component<EditNameProps, EditNameState> {
  constructor(props: EditNameProps) {
    super(props);
    this.state = {};
  }

  onSave = () => {
    const {onSave} = this.props;
    const {newURI} = this.state;
    onSave(newURI);
  };

  render() {
    const { currentImageURI } = this.props;
    return (
      <div className="edit-name">
        <DrawName
          currentImageURI={currentImageURI}
          onSave={(newURI) => this.setState({ newURI })}
        />
        <div className="footer">
          <button type="submit" onClick={this.onSave}>
            Save
          </button>
        </div>
      </div>
    );
  }
}
