var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@adjust/core");
const locationAncestor_1 = __importDefault(require("../../../locationAncestor/locationAncestor"));
const windowSelector_type_1 = require("./windowSelector/windowSelector.type");
const window_type_1 = require("./window/window.type");
const locationAncestor_type_1 = require("../../locationAncestor.type");
exports.windowManagerConfig = core_1.createConfig({
    state: {
        // Keep track of currently opened windows
        windows: {},
        // The window selector to handle windpws that are currently not opened
        windowSelector: null,
    },
    settings: {
        // Keep track of direct child locations
        windows: {
            default: {},
            type: core_1.SettingJsonType,
        },
    },
    getPriority: () => 3,
    type: locationAncestor_type_1.LocationAncestorType,
});
/**
 * type "Window" Accepts one of location hints:
 * - ID: String (The ID of the window to open)
 * - sameAs: String (The ID of a location in the same window)
 * - new: String (Whether a new window should be created)
 *
 * And if 'new' is set:
 * - name: String (The name that any newly created window should have)
 */
/**
 * The window manager, responsible for keeping track and opening all windows that are used as locations
 */
class WindowManagerModule extends core_1.createModule(exports.windowManagerConfig, locationAncestor_1.default) {
    constructor() {
        super(...arguments);
        // The name of this ancestor type to be used in the location path and hints
        this.ancestorName = "window";
    }
    /** @override */
    async onInit() {
        await super.onInit();
        this.changeState({
            windowSelector: await this.request({
                type: windowSelector_type_1.WindowSelectorType,
                data: { path: this.getData().path },
            }),
        });
    }
    // Window module managment
    /**
     * Retrieves the window with a given ID, or creates it if absent and open is true
     * @param windowID The ID of the window to retrieve
     * @param open Whether or not to open the window if not present
     * @param create Whether or not to create the window if not existent and requested to open
     * @param name THe name of the window
     * @returns The window hat was either already loaded, or was just opened
     */
    async getWindow(windowID, open = true, create = true, name) {
        // Check if the window is already opened
        let windowData = this.state.windows[windowID];
        if (!windowData && open) {
            if (!create && !this.settings.windows[windowID])
                return;
            // Request the window
            windowData = {
                window: this.request({
                    type: window_type_1.WindowType,
                    data: {
                        ID: windowID,
                        path: [windowID],
                    },
                }),
                opened: false,
            };
            const window = windowData.window;
            // Update the state to contain this location ancestor
            this.changeState({
                windows: {
                    [windowID]: windowData,
                },
            });
            // Define the window data if absent
            if (!this.settings.windows[windowID])
                await this.changeSettings({
                    windows: {
                        [windowID]: {
                            name: name || windowID,
                        },
                    },
                }, this.settingsConditions);
            // Make sure to initialise the correct state
            if (this.state.inEditMode)
                (await window).setEditMode(true);
            if (this.state.inDropMode)
                (await window).setDropMode(true);
            // Send updated data to the window selector
            await this.updateWindowSelectorData();
            // Set the window's name
            (await window).setName(this.settings.windows[windowID].name);
        }
        // Return the window
        return windowData && (await windowData.window);
    }
    /**
     * Closes the window with a given ID if currently opened
     * @param windowID The ID of the window to close
     */
    async closeWindow(windowID) {
        // Get the window if opened
        let windowData = this.state.windows[windowID];
        if (windowData) {
            const window = await windowData.window;
            // Remove it from the state
            this.changeState({
                windows: {
                    [windowID]: undefined,
                },
            });
            // Close it
            await window.close();
            // Send updated data to the window selector
            await this.updateWindowSelectorData();
        }
    }
    /**
     * Removes all the associated data of a window
     * @param windowID The ID of the window to remove
     */
    async removeWindow(windowID) {
        // Retrieve the window in order to remove all its data
        const window = await this.getWindow(windowID, true, false);
        // Remove the window completely
        if (window)
            await window.removeAncestor();
        // Remove the associated data
        await this.changeSettings({
            windows: {
                [windowID]: undefined,
            },
        }, this.settingsConditions);
        // Close the window
        await this.closeWindow(windowID);
    }
    /** @override */
    async changeWindowName(name, windowID) {
        await this.changeSettings({
            windows: {
                [windowID]: {
                    name: name,
                },
            },
        }, this.settingsConditions);
        // Rename the window if opened
        const window = await this.getWindow(windowID, false);
        if (window)
            window.setName(name);
        // Send updated data to the window selector
        await this.updateWindowSelectorData();
    }
    /** @override */
    async setWindowVisibility(visible, windowID) {
        // Make sure we haven't fully removed the window already
        if (this.state.windows[windowID]) {
            await this.changeState({
                windows: {
                    [windowID]: {
                        opened: visible,
                    },
                },
            });
            // Send updated data to the window selector
            await this.updateWindowSelectorData();
        }
    }
    /**
     * Passes the updated window data to the window selector
     */
    async updateWindowSelectorData() {
        // Collect which windows are closed and which are opened
        const closed = core_1.ExtendedObject.filter(this.settings.windows, (data, ID) => !this.state.windows[ID] || !this.state.windows[ID].opened);
        const opened = core_1.ExtendedObject.filter(this.settings.windows, (data, ID) => this.state.windows[ID] && this.state.windows[ID].opened);
        // Pass the data to the window selector
        await this.state.windowSelector.setWindows(closed, opened);
    }
    // Location management
    /** @override */
    async createLocation(location) {
        // Get the ID of new window for the module, using the new hints
        let windowID;
        let hints = this.getLocationHints(location);
        if (hints["new"]) {
            windowID = core_1.UUID.generateShort();
        }
        else if ("sameAs" in hints) {
            const locationPath = await this.getLocationPath(hints["sameAs"]);
            windowID = locationPath.nodes[0];
        }
        else if ("ID" in hints) {
            windowID = hints["ID"];
        }
        // Default to default
        if (!windowID)
            windowID = Object.keys(this.settings.windows)[0] || "default";
        // Obtain the window
        const name = hints["name"];
        const window = await this.getWindow(windowID, true, true, name);
        // Create the new location path, and return it
        return window.createLocation(location);
    }
    /** @override */
    async removeLocation(locationPath) {
        // Retrieve the window ID
        const { ID, path } = this.getExtractID(locationPath);
        // Obtain the window
        const window = await this.getWindow(ID, true, false);
        if (!window)
            return false;
        // Remove the location from the window
        const removed = await window.removeLocation(path);
        if (removed) {
            // Check if there are any locations left in this window
            const locationsAtPath = await this.getLocationsAtPath([
                ...this.getData().path,
                ID,
            ]);
            // Remove the entire window when empty
            if (locationsAtPath.length == 0) {
                // Remove all of the window data
                await this.removeWindow(ID);
            }
            // Close the window if there are no more modules opened in it
            const modulesAtPath = await this.getModulesAtPath([
                ...this.getData().path,
                ID,
            ]);
            if (modulesAtPath.length == 0)
                await this.closeWindow(ID);
        }
        // Return whether or not the location existed here, and was removed
        return removed;
    }
    /** @override (probably wont ever be called) */
    async removeAncestor() {
        const promises = Object.entries(this.settings.windows).map(async ([ID, data]) => {
            // Obtain the window
            const window = await this.getWindow(ID, true, false);
            // Dispose the window
            await window.removeAncestor();
            // Close the window
            window.close();
        });
        // Await all the windows disposals
        await Promise.all(promises);
        // Clear the settings
        await this.changeSettings({ windows: undefined }, this.settingsConditions);
        await this.changeSettings({ windows: {} }, this.settingsConditions);
        // Send updated data to the window selector
        await this.updateWindowSelectorData();
    }
    // Module management
    /** @override */
    async openModule(module, locationPath) {
        // Retrieve the window ID
        const { ID, path } = this.getExtractID(locationPath);
        // Obtain the window
        const window = await this.getWindow(ID, true);
        // Forward opening the module to the window
        return window.openModule(module, path);
    }
    /** @override */
    async closeModule(module, locationPath) {
        // Retrieve the window ID
        const { ID, path } = this.getExtractID(locationPath);
        // Obtain the window if present
        const window = await this.getWindow(ID, false);
        if (window) {
            // Forward closing the module to the window
            const closed = await window.closeModule(module, path);
            if (closed) {
                // Close the window if there are no more modules opened in it
                const modulesAtPath = await this.getModulesAtPath([
                    ...this.getData().path,
                    ID,
                ]);
                if (modulesAtPath.length == 0)
                    await this.closeWindow(ID);
            }
            return closed;
        }
        return false;
    }
    /** @override */
    async showModule(module, locationPath) {
        // Retrieve the window ID
        const { ID, path } = this.getExtractID(locationPath);
        // Obtain the window if present
        const window = await this.getWindow(ID, false, false);
        if (window) {
            // Forward closing the module to the window
            return await window.showModule(module, path);
        }
        return false;
    }
    // Edit management
    /** @override */
    async setDropMode(drop) {
        // Update the state
        await super.setDropMode(drop);
        // Enable or disable the window selector
        this.state.windowSelector.setEnabled(drop);
        // Inform ancestors
        const promises = Object.values(this.state.windows).map(async (windowData) => (await windowData.window).setDropMode(drop));
        await Promise.all(promises);
    }
    /** @override */
    async setEditMode(edit) {
        // Update the state
        await super.setEditMode(edit);
        // Inform ancestors
        const promises = Object.values(this.state.windows).map(async (windowData) => (await windowData.window).setEditMode(edit));
        await Promise.all(promises);
    }
}
exports.WindowManagerModule = WindowManagerModule;
exports.default = WindowManagerModule;
//# sourceMappingURL=windowManager.js.map