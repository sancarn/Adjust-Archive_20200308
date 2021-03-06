import { SettingsFile } from "./settingsFile";
import { SettingsConfig } from "./_types/settingsConfig";
import { Module } from "../../module/module";
declare class SettingsManagerSingleton {
    protected settings: {
        [file: string]: Promise<SettingsFile<any>>;
    };
    protected dirtySettings: SettingsFile<any>[];
    protected dataPath: string;
    protected preventPromises: Promise<void>[];
    protected canSaveTimeout: any;
    protected canSaveTimeoutDelay: number;
    constructor();
    /**
     * Returns the absolute path to the data directory
     * @param path - The path to append to the data directory
     * @returns The absolute path to the directory
     */
    protected getAbsoluteDataPath(path?: string): string;
    /**
     * Stores the given data at the given path
     * @param path The path at which to store the data
     * @param contents The json data to store
     */
    saveFile(path: string, contents: any): void;
    /**
     * Deletes the file at the given path
     * @param path The path at which to store the data
     * @returns Whether there was a file to delete
     */
    deleteFile(path: string): boolean;
    /**
     * Loads the previously stored data at the given path
     * @param path The path from which to load the data
     * @returns The json data that was loaded
     */
    loadFile(path: string): any;
    /**
     * Check whether a settings file exists with this path
     * @param path The path to check
     * @returns Whether or not the settings file exists
     */
    fileExists(path: string): boolean;
    /**
     * Makes sure that the path has a valid extension
     * @param path The path to normalize
     * @returns The normalized path
     */
    normalizeExtension(path: string): string;
    /**
     * Retrieves the settings file for the specified path, creates it if necessary
     * @param path The path to obtain the settings file for
     * @param config The config of the settings
     * @returns The settings file for the give path
     */
    getSettingsFile<S extends SettingsConfig>(path: string, config: S): Promise<SettingsFile<S>>;
    /**
     * Retrieves the settings file for the specified path, creates it if necessary
     * @param moduleClass The module class to retrieve the settings file for
     * @returns The settings file for the give path
     */
    getSettingsFile<S extends SettingsConfig>(moduleClass: typeof Module): Promise<SettingsFile<S>>;
    /**
     * Removes a settings file for if it is no longer being used
     * @param path The path of the settings file
     * @param settingsFile The instance of the settings file
     * @returns Whether or not the settings file instance was removed
     */
    removeSettingsFile(path: string, settingsFile: SettingsFile<any>): Promise<boolean>;
    /**
     * Destroys all settings file instances that have no listeners
     */
    destroySettingsFiles(): Promise<void>;
    /**
     * Marks a settings file as dirty or 'undirty'
     * @param settingsFile The file to mark as diry
     * @param dirty Whether or not the file should be dirty
     */
    setDirty(settingsFile: SettingsFile<any>, dirty: boolean): void;
    /**
     * Save all of the dirty settings files
     */
    saveAll(): Promise<void>;
    /**
     * Reload all of the dirty settings files
     */
    reloadAll(): Promise<void>;
    /**
     * Prevents saving and reloading until the returned callback has been called
     * @returns The callback to wait for
     */
    preventSave(): () => void;
    /**
     * Prevents saving and reloading until the given promise is resolved
     * @param promise The promise to await
     */
    preventSave(promise: Promise<void>): void;
    /**
     * A method that resolves once the state allows for saving
     * @return A promise that resolves when saving is allowed
     */
    protected canSave(): Promise<void>;
}
export declare const SettingsManager: SettingsManagerSingleton;
export {};
