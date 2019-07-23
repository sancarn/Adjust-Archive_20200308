import {ClassModuleProvider, createModule as createAdjustCoreModule} from "@adjust/core";
import {LocationPath} from "../_types/LocationPath";
import {
    LocationAncestorID,
    LocationAncestor,
    LocationAncestorParent,
} from "./locationAncestor.type";
// import {createModule} from "../../../module/moduleClassCreator";
import {LocationsMoveData} from "../_types/LocationsMoveData";
import {ModuleLocation} from "../../../module/_types/ModuleLocation";
import {LocationAncestorIDs} from "../_types/LocationAncestorIDs";

export const config = {
    initialState: {},
    settings: {},
    type: LocationAncestorID,
    abstract: true, // This is just inteded as module to be extended
};

/**
 * A base class for location ancestors to extend,
 * provides some common methods that location ancestors might use
 * Note that we use adjust core's createModule, since location ancestors shouldn't have any location data themselves
 */
export default class LocationAncestorModule extends createAdjustCoreModule(config)
    implements LocationAncestorParent {
    // The name of the ancestor module
    protected ancestorName: string;

    // Location creation related methods
    /**
     * Either gets the next ID from the path, or generates it and stores it in the path
     * @param path The location path to get the ID from
     * @returns the obtained or generated ID as well as the passed or updated path
     */
    protected getExtractID(path: LocationPath): {path: LocationPath; ID: string} {
        let ID = path.nodes[0];

        // If no ID is present, generate and store it
        if (!ID) {
            // ID = Math.round(Math.random() * 1e10) + "";
            ID = "default";
        }

        // Return the path and the id
        return {
            path: {
                ...path,
                nodes: path.nodes.slice(1),
            },
            ID,
        };
    }

    /**
     * Extracts the relevant hints for this ancestor from a module locatio;n
     * @param location The location and its creation hints
     * @returns Any hints that might have been provided
     */
    protected getLocationHints(location: ModuleLocation): object {
        return location.hints[this.ancestorName];
    }

    /**
     * Gets the child location ancestor given a specified location path
     * @param inpPath The path to obtain the child by
     * @returns The ID of the child, as well as the child itself
     */
    protected async getChildLocationAncestorFromPath(
        inpPath: LocationPath
    ): Promise<{ID: string; path: LocationPath; locationAncestor: LocationAncestor}> {
        // Get the ID to open
        const {ID, path} = this.getExtractID(inpPath);

        // Get the ancestor itself
        const locationAncestor = await this.getChildLocationAncestor(ID);

        // Return the data
        return {
            ID,
            path,
            locationAncestor,
        };
    }

    /**
     * Gets the child location ancestor given a specified location path
     * @param ID The ID of the child, may be left out if the child has the same ID
     * Leaving it out would result in this instance and child sharing the same ID and path
     * @returns The child ancestor
     */
    protected async getChildLocationAncestor(ID?: string): Promise<LocationAncestor> {
        // Determine the ID if not present
        const isNewID = ID != undefined;
        if (ID == undefined) ID = this.getData().ID;

        // Request the location
        const locationAncestor = (await this.request({
            type: LocationAncestorID,
            use: providers => {
                // Get the index of this module class
                const index = providers.findIndex(p => {
                    const provider = p.provider;
                    if (provider instanceof ClassModuleProvider)
                        return provider.getModuleClass() == this.getClass();
                });

                // Get the module with the next (lower) index
                const provider = providers[index + 1].provider;
                return [provider];
            },
            data: {
                ID: ID,
                path: isNewID
                    ? [...(this.getData().path || []), ID]
                    : this.getData().path,
            },
        }))[0];

        // Return the ancestor
        return locationAncestor;
    }

    // Location moving related methods
    /** @override */
    public async setLocationsMoveData(data: LocationsMoveData): Promise<boolean> {
        return this.getParent().setLocationsMoveData(data);
    }

    /** @override */
    public async updateLocationsMoveData(data: LocationsMoveData): Promise<boolean> {
        return this.getParent().updateLocationsMoveData(data);
    }

    /** @override */
    public async getLocationsMoveData(): Promise<LocationsMoveData> {
        return this.getParent().getLocationsMoveData();
    }

    /** @override */
    public async getLocationsAtPath(
        partialPath: LocationAncestorIDs
    ): Promise<ModuleLocation[]> {
        return this.getParent().getLocationsAtPath(partialPath);
    }
}