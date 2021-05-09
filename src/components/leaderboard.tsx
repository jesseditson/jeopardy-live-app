import React, { Component } from "react";
import quip from "quip-apps-api";
import UserName from "./user-name";

interface LeaderboardProps {
  userScores: Map<string, number>;
  userImages: Map<string, string>;
}

interface LeaderboardState {}

export default class Leaderboard extends Component<
  LeaderboardProps,
  LeaderboardState
> {
  constructor(props: LeaderboardProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { userScores, userImages } = this.props;
    return (
      <div className="leaderboard">
        {Array.from(userScores.entries()).map(([userId, score]) => {
          const user = quip.apps.getUserById(userId);
          return (
            <div className="user">
              <span className="score">${score}</span>
              <div className="user-name">
                <UserName userId={userId} userImages={userImages} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
