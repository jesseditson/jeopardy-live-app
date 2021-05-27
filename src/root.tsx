import quip from "quip-apps-api";
import React from "react";
import ReactDOM from "react-dom";
import Main from "./components/main";
import { Menu } from "./menus";
import { RootEntity } from "./model/root";
import { Topic } from "./model/topic";
import { Question } from "./model/question";
import { Answer } from "./model/answer";
import { UserImage } from "./model/user-image";

quip.apps.registerClass(RootEntity, RootEntity.ID);
quip.apps.registerClass(Topic, Topic.ID);
quip.apps.registerClass(Question, Question.ID);
quip.apps.registerClass(Answer, Answer.ID);
quip.apps.registerClass(UserImage, UserImage.ID);

const menu = new Menu();

quip.apps.initialize({
  initializationCallback: function (
    rootNode: Element,
    params: {
      isCreation: boolean;
      creationUrl?: string;
    }
  ) {
    const rootRecord = quip.apps.getRootRecord() as RootEntity;
    ReactDOM.render(
      <Main
        rootRecord={rootRecord}
        menu={menu}
        isCreation={params.isCreation}
        creationUrl={params.creationUrl}
      />,
      rootNode
    );
  },
});
