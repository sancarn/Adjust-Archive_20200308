import {Registry} from "@adjust/core";
import {LocationsMoveData} from "../../../../_types/LocationsMoveData";
import {WindowsData} from "../_types/windowData";
import {LocationAncestorParent} from "../../../locationAncestor.type";
import {ChildModule, ParentModule} from "@adjust/core/types";
/**
 * A type used by the location manager to move a location to a new, or currently not opened window
 */
export type WindowSelector = ChildModule<{
    /**
     * Sets the available windows
     * @param closed The windows that are currently closed
     * @param opened The windows that are currently opened
     */
    setWindows(closed: WindowsData, opened: WindowsData): Promise<void>;

    /**
     * Sets whether or not the selector should be visible
     * @param enabled Whether or not the selector is visible
     */
    setEnabled(enabled: boolean): Promise<void>;
}>;
export type WindowSelectorParent = LocationAncestorParent & {
    /**
     * Updates the data of where teh locations are being moved to, by updating their hints
     * @param data The data, containing the hints for the new location(s)
     * @returns Whether or not the data was successfully set (won't be the case if there is no current data)
     */
    updateLocationsMoveData(data: LocationsMoveData): Promise<boolean>;

    /**
     * Retrieves the current locations move data
     * @returns The currently set locations move data
     */
    getLocationsMoveData(): Promise<LocationsMoveData>;

    /**
     * Updates the name of the window
     * @param name The name that the window wants to have
     * @param windowID The ID of the window whose name to change
     */
    changeWindowName(name: string, windowID: string): Promise<void>;

    /**
     * Indicates whether or not the window is currently visible
     * @param visible Whether or not the window is visible
     * @param windowID The ID of the window to be visible or not
     */
    setWindowVisibility(visible: boolean, windowID: string): Promise<void>;
};
export type WindowSelectorContract = {
    parent: WindowSelectorParent;
    child: WindowSelector;
    data: {
        path: string[];
    };
};

// Export the windowSelectorID type
export const WindowSelectorType = Registry.createContractID<WindowSelectorContract>(
    __filename
);
