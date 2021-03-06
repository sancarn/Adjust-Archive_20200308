var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@adjust/core");
const locationManager_type_1 = require("./locationManager.type");
const registry_1 = require("../../registry/registry");
const locationAncestor_1 = __importDefault(require("./locationAncestor/locationAncestor"));
exports.config = core_1.createConfig({
    state: {
        // Keep track of currently used locations, and modules opened here in this session
        locations: {},
        // The data of locations currently being moved
        locationMoveData: null,
        // The location ancestor to use
        locationAncestor: null,
    },
    settings: {
        // Keeps permanent track of all locations and modules that should be opened here
        locations: {
            default: {},
            type: core_1.SettingJsonType,
        },
    },
    type: locationManager_type_1.LocationManagerType,
});
/**
 * The location manager, responsible for keeping track of all locations in the system, and linking them with modules
 */
class LocationManagerModule extends core_1.createModule(exports.config, locationAncestor_1.default) {
    /** @override */
    async onPreInit() {
        registry_1.Registry.addProvider(new core_1.InstanceModuleProvider(locationManager_type_1.LocationManagerType, this, () => 2));
    }
    /**
     * Retrieves the location ancestor to be used
     * @returns The obtained location ancestor
     */
    async getAncestor() {
        if (!this.state.locationAncestor) {
            this.changeState({ locationAncestor: this.getChildLocationAncestor() });
        }
        return this.state.locationAncestor;
    }
    // Path/locations management
    /**
     * Retrieves a location path for the given location
     * @param location The module location to get the path for
     * @returns The retrieve location path
     */
    async getLocationPath(location) {
        // Check whether the passed location was a location or identifier
        if (typeof location == "string") {
            const data = this.settings.locations[location];
            return data && data.path
                ? { nodes: [...data.path.nodes], location: data.path.location }
                : { nodes: [], location: { ID: location, hints: {} } };
        }
        else {
            const data = this.settings.locations[location.ID];
            return data && data.path
                ? { nodes: [...data.path.nodes], location: data.path.location }
                : { nodes: [], location: location };
        }
    }
    /**
     * Updates the location path in the settings
     * @param locationPath The location path to be stored
     */
    updateLocationPath(locationPath) {
        const current = this.settings.locations[locationPath.location.ID];
        this.changeSettings({
            locations: {
                [locationPath.location.ID]: {
                    path: locationPath,
                    modules: current ? current.modules : [],
                },
            },
        });
    }
    /** @override */
    async updateLocation(location) {
        // Block system from saving
        const allowSave = core_1.SettingsManager.preventSave();
        // Retrieve the location ancestor
        const locationAncestor = await this.getAncestor();
        // Get the location ID and the location's current path
        const currentPath = await this.getLocationPath(location);
        // Create the new location path, and update the path
        const newPath = await locationAncestor.createLocation(location);
        this.updateLocationPath(newPath);
        // Only perform the updates if the location actually changed
        if (!core_1.ExtendedObject.equals(currentPath.nodes, newPath.nodes)) {
            // Remove the location from the ancestor
            await locationAncestor.removeLocation(currentPath);
            // Reopen the modules from this location
            const modules = this.getModulesAtLocation(location.ID);
            const promises = modules.map(moduleReference => this.openModule(moduleReference, location.ID));
            await Promise.all(promises);
        }
        // Allow saving again
        allowSave();
    }
    /** @override */
    async updateModuleLocation(settingsDataID, newLocationIDs, oldLocationIDs) {
        // Block system from saving
        const allowSave = core_1.SettingsManager.preventSave();
        // Normalize the location ids
        if (!newLocationIDs)
            newLocationIDs = [];
        if (!oldLocationIDs)
            oldLocationIDs = [];
        // Add the module to the new location
        const addPromises = newLocationIDs.map(async (newLocationID) => {
            // Only remove locations that got removed
            if (oldLocationIDs.includes(newLocationID))
                return;
            let current = this.settings.locations[newLocationID];
            await await this.changeSettings({
                locations: {
                    [newLocationID]: {
                        path: current && current.path,
                        modules: [
                            // Keep everything that is not the new ID to prevent duplicates
                            ...((current && current.modules) || []).filter(ms => !settingsDataID.equals(ms)),
                            // Add the new ID
                            settingsDataID,
                        ],
                    },
                },
            });
        });
        await Promise.all(addPromises);
        // Remove the module from the old location
        const removePromises = oldLocationIDs.map(async (oldLocationID) => {
            // Only remove locations that got removed
            if (newLocationIDs.includes(oldLocationID))
                return;
            let current = this.settings.locations[oldLocationID];
            if (current) {
                await this.changeSettings({
                    locations: {
                        [oldLocationID]: {
                            path: current.path,
                            modules: current.modules.filter(ms => !settingsDataID.equals(ms)),
                        },
                    },
                });
                // Check if there are still modules at this location, if not, remove it
                current = this.settings.locations[oldLocationID];
                if (current.modules.length == 0) {
                    // Retrieve the location path and obtain the window
                    const path = await this.getLocationPath(oldLocationID);
                    // Remove the location from the settings
                    await await this.changeSettings({
                        locations: {
                            [oldLocationID]: undefined,
                        },
                    });
                    // Retrieve the location ancestor
                    const locationAncestor = await this.getAncestor();
                    // Remove the location
                    await locationAncestor.removeLocation(path);
                }
            }
        });
        await Promise.all(removePromises);
        // Allow saving again
        allowSave();
    }
    // Location editing
    /**
     * General approach:
     * - User enables edit mode
     * - User selects some locationAncestor to move by dragging (which calls setLocationsMoveData)
     * - User selects a target by dropping (which calls getLocationsMoveData and updateLocationsMoveData)
     * - updateMovedLocations to finalize the movement of data
     */
    /** @override */
    async setEditMode(edit) {
        if (this.state.inEditMode == edit)
            return false;
        // Update the state
        await super.setEditMode(edit);
        // Inform ancestor
        const locationAncestor = await this.getAncestor();
        await locationAncestor.setEditMode(edit);
        // Return that the change was successful
        return true;
    }
    /** @override */
    async setLocationsMoveData(data) {
        // Make sure there is no current data, if replacing it with data
        if (this.state.locationMoveData && data)
            return false;
        // Update own state
        this.changeState({ locationMoveData: data });
        // Update whether we are able to drop elements now
        const locationAncestor = await this.getAncestor();
        await locationAncestor.setDropMode(data != null);
        // Return that the movement data was successfully set
        return true;
    }
    /** @override */
    async updateLocationsMoveData(data) {
        // Make sure there is current data
        if (!this.state.locationMoveData)
            return false;
        // Update state
        this.changeState({ locationMoveData: data });
        // Return that the movement data was successfully updated
        return true;
    }
    /** @override */
    async getLocationsMoveData() {
        return this.state.locationMoveData;
    }
    /** @override */
    async getLocationsAtPath(partialPath) {
        return Object.values(this.settings.locations)
            .filter(location => 
        // Make sure all the parts of the path correspond
        partialPath.reduce((res, ancestorID, index) => location.path && location.path.nodes[index] == ancestorID && res, true))
            .map(location => location.path.location);
    }
    /** @override */
    async updateMovedLocations(delay = 100) {
        // Uses own locations move cata to create these new locations
        const moveData = this.state.locationMoveData;
        if (!moveData)
            return;
        // Give some time for ancestors to register their moved locations updates
        await new Promise(r => setTimeout(r, delay));
        // Create the locations
        const promises = moveData.locations.map(location => this.updateLocation(location));
        await Promise.all(promises);
        // Remove the move data
        await this.setLocationsMoveData(undefined);
    }
    // Opening/closing modules
    /** @override */
    async openModule(module, location) {
        // Block system from saving
        const allowSave = core_1.SettingsManager.preventSave();
        // Retrieve the location path
        const path = await this.getLocationPath(location);
        // Obtain the ancestor
        const locationAncestor = await this.getAncestor();
        // Store the module at this path
        this.changeState({
            locations: {
                [location]: {
                    modules: [
                        ...(this.state.locations[location] || { modules: [] }).modules.filter(m => !m.equals(module)),
                        module,
                    ],
                },
            },
        });
        // Open the path in the location ancestor
        const obtainedPath = await locationAncestor.openModule(module, path);
        // Update location path
        this.updateLocationPath(obtainedPath);
        // Allow saving again
        allowSave();
    }
    /** @override */
    async closeModule(module, location) {
        // Retrieve the location path
        const path = await this.getLocationPath(location);
        // Obtain the ancestor
        const locationAncestor = await this.getAncestor();
        // Remove the module at this path
        this.changeState({
            locations: {
                [location]: {
                    modules: (this.state.locations[location] || { modules: [] }).modules.filter(m => !m.equals(module)),
                },
            },
        });
        // Open the path in the location ancestor
        await locationAncestor.closeModule(module, path);
    }
    /** @override */
    async showModule(module, location) {
        // Retrieve the location path
        const path = await this.getLocationPath(location);
        // Obtain the ancestor
        const locationAncestor = await this.getAncestor();
        // Attempt to show the module
        return locationAncestor.showModule(module, path);
    }
    /** @override */
    async isModuleOpened(module, locationID) {
        return (this.state.locations[locationID].modules.find(m => m.equals(module)) != null);
    }
    /**
     * Retrieves the modules that are opened at a given location
     * @param location The ID of the location to get the opened modules of
     * @returns The modules that are opened at this location in this settions
     */
    getModulesAtLocation(location) {
        const locData = this.state.locations[location];
        return (locData && locData.modules) || [];
    }
    /** @override */
    async getModulesAtPath(partialPath) {
        // Define the modules to retrieve
        const modules = [];
        // Get all locations, and retriev its modules
        (await this.getLocationsAtPath(partialPath)).forEach(location => {
            modules.push(...this.getModulesAtLocation(location.ID));
        });
        // Return all modules
        return modules;
    }
}
exports.default = LocationManagerModule;
//# sourceMappingURL=locationManager.js.map