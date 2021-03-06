import { ModuleDetails, Package } from "@adjust/core/types";
/**
 * Data to represent a module in the index
 */
export declare type ISettingsIndexModule = {
    type: "module";
    path: string;
    package: Package;
} & ModuleDetails;
