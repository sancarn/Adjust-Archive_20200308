import { ModuleConfig as AdjustModuleConfig, ModuleInterface, SettingsConfig, ModuleState } from "@adjust/core/types";
import { ModuleLocation } from "./ModuleLocation";
/**
 * The config type for all Adjust GUI modules
 */
export declare type ModuleConfig<S extends ModuleState, C extends SettingsConfig, I extends ModuleInterface> = AdjustModuleConfig<S, C, I> & {
    defineLocation?: ModuleLocation;
    location?: string | string[];
};
/**
 * Default parameterized version of ModuleConfig
 */
export declare type ParameterizedModuleConfig = ModuleConfig<ModuleState, SettingsConfig, ModuleInterface>;
/**
 * An interface that contains all config data for the module
 */
export declare type NormalizedModuleConfig<S extends ModuleState, C extends SettingsConfig, I extends ModuleInterface> = {
    [P in keyof ModuleConfig<S, C, I>]-?: ModuleConfig<S, C, I>[P];
};
/**
 * Default parameterized version of ModuleConfig
 */
export declare type ParameterizedNormalizedModuleConfig = NormalizedModuleConfig<ModuleState, SettingsConfig, ModuleInterface>;