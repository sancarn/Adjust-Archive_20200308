import { SettingsConditions, SettingsFile } from "@adjust/core";
import { LocationManager } from "../modules/location/locationManager.type";
/**
 * A method that syncrhonizes the locations with the location manager when a module's location changes
 * @param newValue The new locations of the module
 * @param condition The condition for which the location changed
 * @param oldValue The old locations of the modulei
 * @param settingsFile An instance of the settings file in which these locations are stored
 */
export declare const synchronizedLocations: (newValue: string | string[], condition: SettingsConditions, oldValue: string | string[], settingsFile: SettingsFile<any>) => Promise<void>;
/**
 * The default config for modules, adds location management to the Adjust core modules
 */
export declare const baseConfig: {
    initialState: {};
    settings: {
        location: {
            default: string | string[];
            type: string;
            onChange: (newValue: string | string[], condition: SettingsConditions, oldValue: string | string[], settingsFile: SettingsFile<any>) => Promise<void>;
        };
    };
    type: any;
};
declare const Module_base: import("@adjust/core/types").ExtendedModuleClass<{
    initialState: {};
    settings: {
        location: {
            default: string | string[];
            type: string;
            onChange: (newValue: string | string[], condition: SettingsConditions, oldValue: string | string[], settingsFile: SettingsFile<any>) => Promise<void>;
        };
    };
    type: any;
}, import("@adjust/core/types").ExtendsClass<typeof import("@adjust/core").Module, import("@adjust/core").Module<{
    isStopping: boolean;
    isStopped: boolean;
}, {}, import("@adjust/core/types").ModuleInterface>>>;
/**
 * A class containing data for importing it (its actual file location),
 * a state that can be serialized and deserialized,
 * a settings object that stores settings for this type of component
 */
export declare abstract class Module extends Module_base {
    protected locationManager: LocationManager;
    /** @override */
    init(): Promise<void>;
    /**
     * Opens the module view using the location manager, according to the module's settings
     */
    protected openView(): Promise<void>;
}
export {};