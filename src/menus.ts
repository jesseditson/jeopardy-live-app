import quip, {MenuCommand} from "quip-apps-api";
import {AppData} from "./model/root";

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
    showLeaderboard: () => void,
    togglePlayMode: () => void,
    showPreferences: () => void,
}
export const menuActions: MenuActions = {
    // Set the default implementation of menu actions here.
    // At runtime this `err` implementation should be replaced
    // by the constructor of the Main component
    showLeaderboard: err("showLeaderboard"),
    togglePlayMode: err("togglePlayMode"),
    showPreferences: err("showPreferences"),
};

export class Menu {
    /**
     * Update the app's displayed data as a function of the app data. This
     * method is called by the Main components listener on the RootEntity.
     * @param data
     */
    updateToolbar(data: AppData) {
        const subCommands: string[] = this.getMainMenuSubCommandIds_(data);
        const commands = this.allCommands_.map(command => {
            if (command.id === "togglePlayMode") {
                command.label = data.isPlaying ? "Edit" : "Play";
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
            toolbarCommandIds: this.getToolbarCommandIds_(data),
            menuCommands,
            highlightedCommandIds: this.getHighlightedCommandIds_(data),
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
            id: "showLeaderboard",
            label: "Show Leaderboard",
            handler: () => {
                menuActions.showLeaderboard();
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
            id: "showPreferences",
            label: "Preferences...",
            handler: () => {
                menuActions.showPreferences();
                return true;
            },
        },
    ];

    private getToolbarCommandIds_(data: AppData): string[] {
        const toolbarCommandIds_: string[] = data.isOwner ? ["togglePlayMode", quip.apps.DocumentMenuCommands.SEPARATOR] : [];
        if (data.isPlaying) {
            toolbarCommandIds_.push("showLeaderboard");
        } else if (data.isOwner) {
            toolbarCommandIds_.push("showPreferences");
        }
        return toolbarCommandIds_;
    }

    private getMainMenuSubCommandIds_(data: AppData): string[] {
        const mainMenuSubCommandIds: string[] = [];
        return mainMenuSubCommandIds;
    }

    private getHighlightedCommandIds_(data: AppData): string[] {
        const highlightedCommandIds: string[] = [];
        return highlightedCommandIds;
    }

    private getDisabledCommandIds_(data: AppData): string[] {
        const disabledCommandIds: string[] = [];
        return disabledCommandIds;
    }
}
