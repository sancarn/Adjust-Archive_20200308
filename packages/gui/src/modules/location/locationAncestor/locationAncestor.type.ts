import {Registry, ModuleReference} from "@adjust/core";
import {ChildModule, ParentModule} from "@adjust/core/types";
import {LocationPath} from "../_types/LocationPath";
import {ModuleLocation} from "../../../module/_types/ModuleLocation";
import {LocationsMoveData} from "../_types/LocationsMoveData";
import {LocationAncestorIDs} from "../_types/LocationAncestorIDs";

/**
 * A type used by the location manager, represents a node of the path to a location
 */
export type LocationAncestor = ChildModule<{
    /**
     * Opens a module at the given location
     * @param module The module to open
     * @param location The location to open it in, and the path of nodes along the way
     * @returns The location path that ended up being used (including own data)
     */
    openModule(
        module: ModuleReference,
        locationPath: LocationPath
    ): Promise<LocationPath>;

    /**
     * Close a module from the given location
     * @param module The module to close
     * @param location The location to close it from
     * @returns Whether or not the module was successfully closed from this location
     */
    closeModule(module: ModuleReference, locationPath: LocationPath): Promise<boolean>;

    /**
     * Makes sure a module is shown at the given location, if the location path is known/correct
     * @param module The module to show
     * @param location The location at which the module should be shown (A module might be opened in multiple locations)
     * @returns Whether or not the given location path is known and contains the passed module
     */
    showModule(module: ModuleReference, locationPath: LocationPath): Promise<boolean>;

    /**
     * Creates a location such that modules can be opened here
     * @param location The location ID and hints for how to create the path
     * @returns The actual path that was created to reach the location
     */
    createLocation(location: ModuleLocation): Promise<LocationPath>;

    /**
     * Removes a location if existent, or returns fals otherwise
     * @param location The path of the location to remove
     * @returns Whether or not a location was found and removed
     */
    removeLocation(locationPath: LocationPath): Promise<boolean>;

    /**
     * A callback for when this ancestor is completely removed from memory,
     * such that it can dispose it's data
     */
    removeAncestor(): Promise<void>;

    /**
     * Sets whether or not the user is currently able to change the locations and their ancestors
     * @param edit Whether or not editing will be enabled
     */
    setEditMode(edit: boolean): Promise<void>;

    /**
     * Sets whether or not drop indicators should be shown on the ancestor
     * @param drop Whether or not droping will be enabled
     */
    setDropMode(drop: boolean): Promise<void>;
}>;
export type LocationAncestorParent = ParentModule<{
    /**
     * Sets the data of what locations are being moved
     * @param data The data, containing all the hints required to recreate the locations in their current form
     * @returns Whether or not the data was successfully set (won't be the case if there is other data already)
     */
    setLocationsMoveData(data: LocationsMoveData): Promise<boolean>;

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
     * Make use of the location move data in order to actually move the locations
     * @param delay The number of miliseconds that should be waited to perform updateLocationsMoveData calls
     */
    updateMovedLocations(delay?: number): Promise<void>;

    /**
     * Retrieves the locations that are located somewhere along the given partial path
     * @param partialPath The partial path too get the locations from
     * @returns The module locations at the path
     */
    getLocationsAtPath(partialPath: string[]): Promise<ModuleLocation[]>;

    /**
     * Retrieves the modules that are located somewhere along the given partial path
     * @param partialPath The partial path too get the modules from
     * @returns The modules at the path
     */
    getModulesAtPath(partialPath: string[]): Promise<ModuleReference[]>;

    /**
     * Retrieves a location path for the given location
     * @param location The module location to get the path for
     * @returns The retrieve location path
     */
    getLocationPath(location: string): Promise<LocationPath>;
}>;
export type LocationAncestorContract = {
    parent: LocationAncestorParent;
    child: LocationAncestor;
    data: {
        ID: string; // The ID of this location ancestor itself
        path: string[]; // The IDs of locationAncestor along the way to the location, including ID of location ancestor itself
    };
};

// Export the interfaceID type
export const LocationAncestorType = Registry.createContractID<LocationAncestorContract>(
    __filename
);

// Export a name that drag and drop data should be tagged with
export const dragAndDropName = "Adjust drop";
