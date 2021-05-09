import React, { Component } from "react";
import quip from "quip-apps-api";
import DrawName from "./draw-name";

interface WaitingRoomProps {
  ownerId: string;
  onUpdateImage: (imageURI: string) => void;
}

interface WaitingRoomState {}

export default class WaitingRoom extends Component<
  WaitingRoomProps,
  WaitingRoomState
> {
  constructor(props: WaitingRoomProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { ownerId, onUpdateImage } = this.props;
    const owner = quip.apps.getUserById(ownerId);
    const ownerName = owner ? owner.getFirstName() : "The Host";
    return (
      <div className="waiting-room">
        <div className="header">
          <h2>Waiting for {ownerName} to start the game.</h2>
          <p>Draw your name below while you wait.</p>
        </div>
        <DrawName onSave={(uri) => onUpdateImage(uri)} />
      </div>
    );
  }
}
