import React, { Component, FunctionComponent, ReactNode } from "react";
import quip from "quip-apps-api";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import { menuActions, Menu } from "../menus";
import { AppData, RootEntity } from "../model/root";
import { Question, QuestionData } from "../model/question";
import { TopicData } from "../model/topic";
import Modal from "./modal";
import EditGamePrefs, { GamePreferences } from "./edit-game-prefs";
import Leaderboard from "./leaderboard";
import Answer from "./answer";
import Answers from "./answers";
import CorrectAnswers from "./correct-answers";
import WaitingRoom from "./waiting-room";
import EditName from "./edit-name";

interface MainProps {
  rootRecord: RootEntity;
  menu: Menu;
  isCreation: boolean;
  creationUrl?: string;
}

export interface MainState {
  data: AppData;
  showingLeaderboard: boolean;
  showingPreferences: boolean;
  showingQuestions: boolean;
  showingEditName: boolean;
  userMode: boolean;
}

type QuestionRow = {
  q?: QuestionData;
  t: TopicData;
  add?: boolean;
  ref?: React.Ref<HTMLDivElement>;
}[];

const Fade: FunctionComponent<{ in: boolean }> = (props) => (
  <CSSTransition
    mountOnEnter={true}
    in={props.in}
    timeout={300}
    classNames="fade"
    unmountOnExit={true}
  >
    {props.children}
  </CSSTransition>
);

const Zoom: FunctionComponent<{ in: boolean; origin?: string }> = (props) => (
  <CSSTransition
    mountOnEnter={true}
    in={props.in}
    timeout={800}
    classNames="zoom"
    style={{ transformOrigin: props.origin }}
    unmountOnExit={true}
  >
    {props.children}
  </CSSTransition>
);

export default class Main extends Component<MainProps, MainState> {
  setupMenuActions_(rootRecord: RootEntity) {
    menuActions.toggleLeaderboard = () => {
      this.setState(
        ({ showingLeaderboard }) => ({
          showingLeaderboard: !showingLeaderboard,
        }),
        () => {
          this.props.menu.updateToolbar(rootRecord.getData(), this.state);
        }
      );
    };
    menuActions.showPreferences = () => {
      this.setState({ showingPreferences: true });
    };
    menuActions.toggleShowQuestions = () => {
      this.setState(
        ({ showingQuestions }) => ({ showingQuestions: !showingQuestions }),
        () => {
          this.props.menu.updateToolbar(rootRecord.getData(), this.state);
        }
      );
    };
    menuActions.toggleUserMode = () => {
      this.setState(
        ({ userMode }) => ({ userMode: !userMode }),
        () => {
          this.props.menu.updateToolbar(rootRecord.getData(), this.state);
        }
      );
    };
    menuActions.toggleEditName = () => {
      this.setState(
        ({ showingEditName }) => ({ showingEditName: !showingEditName }),
        () => {
          this.props.menu.updateToolbar(rootRecord.getData(), this.state);
        }
      );
    };
    menuActions.togglePlayMode = () => {
      rootRecord.togglePlayMode();
    };
    menuActions.addTopic = () => {
      const { addTopic } = rootRecord.getActions();
      addTopic("New Topic");
    };
  }

  private questionElements: Map<
    string,
    React.RefObject<HTMLDivElement>
  > = new Map();

  constructor(props: MainProps) {
    super(props);
    const { rootRecord } = props;
    this.setupMenuActions_(rootRecord);
    const data = rootRecord.getData();
    this.state = {
      data,
      showingLeaderboard: false,
      showingPreferences: false,
      showingQuestions: false,
      showingEditName: false,
      userMode: false,
    };
  }

  componentDidMount() {
    // Set up the listener on the rootRecord (RootEntity). The listener
    // will propogate changes to the render() method in this component
    // using setState
    const { rootRecord } = this.props;
    rootRecord.listen(this.refreshData_);
    this.refreshData_();
  }

  componentWillUnmount() {
    const { rootRecord } = this.props;
    rootRecord.unlisten(this.refreshData_);
  }

  /**
   * Update the app state using the RootEntity's AppData.
   * This component will render based on the values of `this.state.data`.
   * This function will set `this.state.data` using the RootEntity's AppData.
   */
  private refreshData_ = () => {
    const { rootRecord, menu } = this.props;
    const data = rootRecord.getData();
    // Update the app menu to reflect most recent app data
    menu.updateToolbar(data, this.state);
    this.setState({ data: rootRecord.getData() });
  };

  private addQuestion = (topicId: string) => {
    const { rootRecord } = this.props;
    const { addQuestion } = rootRecord.getActions();
    addQuestion(topicId, "New Question");
  };

  private changeTopicName = (topicId: string, name: string) => {
    const { rootRecord } = this.props;
    const { setTopicName } = rootRecord.getActions();
    setTopicName(topicId, name);
  };
  private changeQuestion = (questionId: string, question: string) => {
    const { rootRecord } = this.props;
    const { setQuestion } = rootRecord.getActions();
    setQuestion(questionId, question);
  };

  private removeQuestion = (topicId: string, questionId: string) => {
    const { rootRecord } = this.props;
    const { removeQuestion } = rootRecord.getActions();
    removeQuestion(topicId, questionId);
  };
  private removeTopic = (topicId: string) => {
    const { rootRecord } = this.props;
    const { removeTopic } = rootRecord.getActions();
    removeTopic(topicId);
  };

  private updatePreferences = (preferences: GamePreferences) => {
    const { rootRecord } = this.props;
    const { updatePreferences } = rootRecord.getActions();
    updatePreferences(preferences);
    this.closeModal();
  };

  private setCurrentQuestion = (questionId: string) => {
    const { rootRecord } = this.props;
    const { setCurrentQuestion } = rootRecord.getActions();
    setCurrentQuestion(questionId);
  };

  private answerChanged = (answer: string) => {
    const { rootRecord } = this.props;
    const { onAnswer } = rootRecord.getActions();
    onAnswer(answer);
  };

  private updateUserImage = (imageURI?: string) => {
    const { rootRecord } = this.props;
    const { updateUserImage } = rootRecord.getActions();
    updateUserImage(imageURI);
  };

  private toggleAnswerCorrect = (userId: string) => {
    const { rootRecord } = this.props;
    const { toggleAnswerCorrect } = rootRecord.getActions();
    toggleAnswerCorrect(userId);
  };

  private finishedMarkingAnswers = () => {
    const { rootRecord } = this.props;
    const { finishMarkingAnswers } = rootRecord.getActions();
    finishMarkingAnswers();
  };
  private addMoreTime = () => {
    const { rootRecord } = this.props;
    const { addMoreTime } = rootRecord.getActions();
    addMoreTime();
  };
  private skipToAnswers = () => {
    const { rootRecord } = this.props;
    const { skipToAnswers } = rootRecord.getActions();
    skipToAnswers();
  };

  private closeModal = () => {
    const { rootRecord } = this.props;
    this.setState(
      {
        showingPreferences: false,
        showingLeaderboard: false,
        showingEditName: false,
      },
      () => {
        this.props.menu.updateToolbar(rootRecord.getData(), this.state);
      }
    );
  };

  // Returns a matrix of questions
  private getQuestions = (topics: TopicData[]): QuestionRow[] => {
    const { data, userMode } = this.state;
    const { isPlaying } = data;
    const isOwner = data.isOwner && !userMode;
    const questions: QuestionRow[] = [];
    const maxQuestions: Map<number, number> = new Map();
    this.questionElements = new Map();
    const numQuestions = Math.max(...topics.map((t) => t.questions.length));
    topics.forEach((topic, tnum) => {
      maxQuestions.set(tnum, topic.questions.length);
      for (let i = 0; i < numQuestions; i++) {
        const q = topic.questions[i];
        questions[i] = questions[i] || [];
        const ref = React.createRef<HTMLDivElement>();
        if (q) {
          this.questionElements.set(q.uuid, ref);
        }
        questions[i][tnum] = { q, t: topic, ref };
      }
    });
    if (isOwner && !isPlaying) {
      for (const [col, loc] of maxQuestions) {
        questions[loc] = questions[loc] || [];
        const t = topics[col]!;
        questions[loc][col] = { add: true, t };
      }
    }
    return questions;
  };

  private originForQuestion = (questionId?: string): string | undefined => {
    if (!questionId) {
      return;
    }
    const ref = this.questionElements.get(questionId);
    // TODO: this is never set, proabaly racing.
    if (ref && ref.current) {
      const { x, y } = ref.current.getBoundingClientRect();
      return `${x}px ${y}px`;
    }
  };

  private getUserScores = (topics: TopicData[]) => {
    const { data } = this.state;
    const { baseValue, valueIncrement, userImages } = data;
    const userScores: Map<string, number> = new Map();
    for (const [uid] of userImages) {
      userScores.set(uid, 0);
    }
    topics.forEach((topic, tnum) => {
      topic.questions.forEach((q, i) => {
        const value = baseValue + i * valueIncrement;
        for (const uid of q.answers.keys()) {
          if (q.correctUserIds.has(uid)) {
            userScores.set(uid, (userScores.get(uid) || 0) + value);
          }
        }
      });
    });
    return userScores;
  };

  private getCurrentQuestion = () => {
    const { currentQuestionId } = this.state.data;
    if (currentQuestionId) {
      const record = quip.apps.getRecordById(currentQuestionId) as
        | Question
        | undefined;
      return record?.getData();
    }
  };

  renderQuestions = (row: QuestionRow, rowIdx: number) => {
    const { data, showingQuestions, userMode } = this.state;
    const { isPlaying, baseValue, valueIncrement, finishedQuestions } = data;
    const isOwner = data.isOwner && !userMode;

    const elements = [];
    for (let i = 0; i < row.length; i++) {
      const d = row[i];
      const finished = d && d.q && finishedQuestions.has(d.q.uuid);
      if (d.add) {
        elements.push(
          <div className="question">
            <h2
              className="add-question"
              onClick={() => this.addQuestion(d.t.uuid)}
            >
              + Add Question
            </h2>
          </div>
        );
      } else if (!d || !d.q) {
        elements.push(<div className="question empty" />);
      } else if (isOwner) {
        elements.push(
          isPlaying ? (
            <div
              className={classNames("question", {
                showing: showingQuestions,
                finished: finished,
              })}
              onClick={
                !finished ? () => this.setCurrentQuestion(d.q!.uuid) : undefined
              }
              ref={d.ref}
            >
              <h2>
                {showingQuestions || finished
                  ? d.q!.question
                  : `$${baseValue + rowIdx * valueIncrement}`}
              </h2>
            </div>
          ) : (
            <div className="question showing" ref={d.ref}>
              <span>${baseValue + rowIdx * valueIncrement}</span>
              <textarea
                onChange={(e) => this.changeQuestion(d.q!.uuid, e.target.value)}
                value={d.q!.question}
              />
              <a onClick={() => this.removeQuestion(d.t.uuid, d.q!.uuid)}>❌</a>
            </div>
          )
        );
      } else {
        elements.push(
          <div
            className={classNames("question", {
              finished: finished,
            })}
            ref={d.ref}
          >
            <h2>
              {finished
                ? d.q!.question
                : `$${baseValue + rowIdx * valueIncrement}`}
            </h2>
          </div>
        );
      }
    }
    return elements;
  };

  render() {
    const {
      data,
      showingPreferences,
      showingLeaderboard,
      userMode,
      showingEditName,
    } = this.state;
    const {
      topics,
      isPlaying,
      ownerId,
      baseValue,
      valueIncrement,
      currentQuestionId,
      questionDuration,
      questionStart,
      showingCorrectAnswers,
      finishedQuestions,
      userImages,
    } = data;
    const isOwner = data.isOwner && !userMode;
    const gridStyles = {
      gridTemplateColumns: topics.map((t) => "1fr").join(" "),
    };
    const choosingCorrectAnswers = currentQuestionId
      ? isOwner && !finishedQuestions.has(currentQuestionId)
      : false;
    const currentUserImageURI = userImages.get(
      quip.apps.getViewingUser()?.id() || ""
    );
    const currentQuestion = this.getCurrentQuestion();
    return (
      <div className="root">
        <div className="topics">
          <div className="topic-names" style={gridStyles}>
            {topics.map((t) => (
              <div className="topic-name">
                {isOwner ? (
                  <>
                    <input
                      onChange={(e) =>
                        this.changeTopicName(t.uuid, e.target.value)
                      }
                      value={t.name}
                    />
                    {isPlaying ? null : (
                      <a onClick={() => this.removeTopic(t.uuid)}>❌</a>
                    )}
                  </>
                ) : (
                  <h2>{t.name}</h2>
                )}
              </div>
            ))}
          </div>
          <div className="questions" style={gridStyles}>
            {this.getQuestions(topics).map(this.renderQuestions)}
          </div>
        </div>
        {
          <Zoom
            in={isPlaying && !!currentQuestion && !showingCorrectAnswers}
            origin={this.originForQuestion(currentQuestion?.uuid)}
          >
            <Answer
              isOwner={isOwner}
              questionDuration={questionDuration}
              questionStart={questionStart}
              currentQuestion={currentQuestion}
              answerChanged={this.answerChanged}
              addMoreTime={this.addMoreTime}
              skipToAnswers={this.skipToAnswers}
            />
          </Zoom>
        }
        {
          <Fade
            in={isPlaying && showingCorrectAnswers && choosingCorrectAnswers}
          >
            <Modal
              showing={isPlaying && showingCorrectAnswers && choosingCorrectAnswers}
            >
              <Answers
                userImages={userImages}
                currentQuestion={currentQuestion}
                toggleCorrect={this.toggleAnswerCorrect}
                onFinished={this.finishedMarkingAnswers}
              />
            </Modal>
          </Fade>
        }
        {
          <Fade
            in={isPlaying && showingCorrectAnswers && !choosingCorrectAnswers}
          >
            <Modal
              showing={isPlaying && showingCorrectAnswers && !choosingCorrectAnswers}
            >
              <CorrectAnswers
                userImages={userImages}
                currentQuestion={currentQuestion}
              />
            </Modal>
          </Fade>
        }
        {
          <Fade in={!isPlaying && !isOwner}>
            <WaitingRoom
              ownerId={ownerId}
              currentImageURI={currentUserImageURI}
              onUpdateImage={this.updateUserImage}
            />
          </Fade>
        }
        {
          <Fade in={showingPreferences}>
            <Modal
              showing={showingPreferences}
              title="Game Preferences"
              onClose={this.closeModal}
            >
              <EditGamePrefs
                preferences={{ baseValue, valueIncrement, questionDuration }}
                onSetPreferences={this.updatePreferences}
              />
            </Modal>
          </Fade>
        }
        {
          <Fade in={showingLeaderboard}>
            <Modal
              showing={showingLeaderboard}
              title="Leaderboard"
              onClose={this.closeModal}
            >
              <Leaderboard
                userImages={userImages}
                userScores={this.getUserScores(topics)}
              />
            </Modal>
          </Fade>
        }
        {
          <Fade in={showingEditName}>
            <Modal
              showing={showingEditName}
              title="Edit Name"
              onClose={this.closeModal}
            >
              <EditName
                currentImageURI={currentUserImageURI}
                onSave={(newImageURI) => {
                  this.updateUserImage(newImageURI);
                  this.closeModal();
                }}
              />
            </Modal>
          </Fade>
        }
      </div>
    );
  }
}
