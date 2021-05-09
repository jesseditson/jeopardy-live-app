import React, { Component } from "react";
import quip from "quip-apps-api";

interface UserNameProps {
  userId: string;
  userImages: Map<string, string>;
}

interface UserNameState {
  newURI?: string;
}

export default class UserName extends Component<UserNameProps, UserNameState> {
  constructor(props: UserNameProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { userId, userImages } = this.props;
    const user = quip.apps.getUserById(userId);
    const userImage = userImages.get(userId)
    const textName = user ? user.getName() : userId;
    return (
      <div className="user-name">
        {userImage
            ? <img src={userImage} alt={textName}/>
            : <h2>{textName}</h2>}
      </div>
    );
  }
}
