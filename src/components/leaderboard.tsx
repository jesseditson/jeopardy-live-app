import React, {Component} from "react";
import quip from "quip-apps-api";

interface LeaderboardProps {
    userScores: Map<string, number>
}

interface LeaderboardState {
}

export default class Leaderboard extends Component<LeaderboardProps, LeaderboardState> {
    constructor(props: LeaderboardProps) {
        super(props);
        this.state = {};
    }

    render() {
        const {userScores} = this.props;
        return <div className="leaderboard">
            {Array.from(userScores.entries()).map(([userId, score]) => {
                const user = quip.apps.getUserById(userId)
                return <div className="user">
                    <span className="score">${score}</span>
                    <div className="user-name"><h2>{user ? user.getName() : userId}</h2></div>
                </div>
            })}
        </div>
    }
}