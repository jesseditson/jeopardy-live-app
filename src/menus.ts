import quip, {MenuCommand} from "quip-apps-api";
import {AppData} from "./model/root";
import {MainState} from "./components/main";

/**
 * Menu Actions are created at runtime based on a root record in
 * our Main component (since they can call actions on the main component and
 * trigger methods there). However, the menu is created before this component
 * and passed into it. The menuActions object is a lookup for menu actions
 * that may not exist yet but are guaranteed to exist at runtime.
 */
const err = (name: string) => () => {
    throw new Error(`MenuAction not implemented: ${name}`);
};
export interface MenuActions {
    toggleLeaderboard: () => void,
    togglePlayMode: () => void,
    toggleShowQuestions: () => void,
    toggleUserMode: () => void,
    addTopic: () => void,
    showPreferences: () => void,
}
export const menuActions: MenuActions = {
    // Set the default implementation of menu actions here.
    // At runtime this `err` implementation should be replaced
    // by the constructor of the Main component
    toggleLeaderboard: err("toggleLeaderboard"),
    togglePlayMode: err("togglePlayMode"),
    toggleShowQuestions: err("toggleShowQuestions"),
    toggleUserMode: err("toggleUserMode"),
    addTopic: err("addTopic"),
    showPreferences: err("showPreferences"),
};

export class Menu {
    /**
     * Update the app's displayed data as a function of the app data. This
     * method is called by the Main components listener on the RootEntity.
     * @param data
     */
    updateToolbar(data: AppData, state: MainState) {
        const subCommands: string[] = this.getMainMenuSubCommandIds_(data);
        const commands = this.allCommands_.map(command => {
            if (command.id === "togglePlayMode") {
                command.label = data.isPlaying ? "Edit" : "Play";
            }
            if (command.id === "toggleUserMode") {
                command.label = state.userMode ? "User Mode" : "Emulate User";
            }
            return command
        })
        const menuCommands: MenuCommand[] = subCommands.length ? [
            {
                id: quip.apps.DocumentMenuCommands.MENU_MAIN,
                subCommands,
            },
            ...commands,
        ] : commands;

        quip.apps.updateToolbar({
            toolbarCommandIds: this.getToolbarCommandIds_(data, state),
            menuCommands,
            highlightedCommandIds: this.getHighlightedCommandIds_(data, state),
            disabledCommandIds: this.getDisabledCommandIds_(data),
        });
    }

    /**
     * This property defines all the available MenuCommands for the app.
     * The actual menu commands that appear on the app are defined
     * within the `updateToolbar` method in this class.
     */
    private readonly allCommands_: MenuCommand[] = [
        {
            id: "toggleLeaderboard",
            label: "Show Leaderboard",
            handler: () => {
                menuActions.toggleLeaderboard();
                return true;
            },
        },
        {
            id: "togglePlayMode",
            label: "Play",
            handler: () => {
                menuActions.togglePlayMode();
                return true;
            },
        },
        {
            id: "toggleShowQuestions",
            label: "Peek Questions",
            handler: () => {
                menuActions.toggleShowQuestions();
                return true;
            },
        },
        {
            id: "toggleUserMode",
            label: "Emulate User",
            handler: () => {
                menuActions.toggleUserMode();
                return true;
            },
        },
        {
            id: "addTopic",
            label: "Add Topic",
            handler: () => {
                menuActions.addTopic();
                return true;
            },
        },
        {
            id: "showPreferences",
            label: "Preferences...",
            handler: () => {
                menuActions.showPreferences();
                return true;
            },
        },
    ];

    private getToolbarCommandIds_(data: AppData, state: MainState): string[] {
        const isOwner = data.isOwner && !state.userMode
        const toolbarCommandIds_: string[] = isOwner ? ["togglePlayMode", quip.apps.DocumentMenuCommands.SEPARATOR] : [];
        if (data.isPlaying) {
            toolbarCommandIds_.push("toggleLeaderboard");
            if (isOwner) {
                toolbarCommandIds_.push(quip.apps.DocumentMenuCommands.SEPARATOR, "toggleShowQuestions", quip.apps.DocumentMenuCommands.SEPARATOR, "toggleUserMode")
            } else if (data.isOwner) {
                toolbarCommandIds_.push(quip.apps.DocumentMenuCommands.SEPARATOR, "toggleUserMode")
            }
        } else if (isOwner) {
            toolbarCommandIds_.push("addTopic", quip.apps.DocumentMenuCommands.SEPARATOR, "toggleUserMode", quip.apps.DocumentMenuCommands.SEPARATOR, "showPreferences");
        } else if (data.isOwner) {
            toolbarCommandIds_.push(quip.apps.DocumentMenuCommands.SEPARATOR, "toggleUserMode")
        }
        return toolbarCommandIds_;
    }

    private getMainMenuSubCommandIds_(data: AppData): string[] {
        const mainMenuSubCommandIds: string[] = [];
        if (data.isOwner) {
            mainMenuSubCommandIds.push("showPreferences")
        }
        return mainMenuSubCommandIds;
    }

    private getHighlightedCommandIds_(data: AppData, state: MainState): string[] {
        const highlightedCommandIds: string[] = [];
        if (state.showingQuestions) {
            highlightedCommandIds.push("toggleShowQuestions");
        }
        if (state.userMode) {
            highlightedCommandIds.push("toggleUserMode")
        }
        if (state.showingLeaderboard) {
            highlightedCommandIds.push("toggleLeaderboard")
        }
        return highlightedCommandIds;
    }

    private getDisabledCommandIds_(data: AppData): string[] {
        const disabledCommandIds: string[] = [];
        return disabledCommandIds;
    }
}
