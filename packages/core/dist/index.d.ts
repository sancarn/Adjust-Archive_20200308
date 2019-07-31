export * from "./registry/registry";
export * from "./registry/moduleProviders/instanceModuleProvider";
export * from "./registry/moduleProviders/classModuleProvider";
export * from "./state/programState";
export * from "./module/moduleID";
export * from "./module/module";
export * from "./module/moduleClassCreator";
export * from "./module/moduleView";
export * from "./module/moduleViewClassCreator";
export * from "./module/moduleProxy";
export * from "./module/remoteModuleProxy";
export * from "./state/window/windowManager";
import OrReact from "react";
export declare const React: typeof OrReact;
export * from "./utils/isMain";
export * from "./utils/extendedObject";
export * from "./communication/ipcMain";
export * from "./communication/ipcRenderer";
export * from "./storage/settings/settingsManager";
export * from "./storage/settings/settingsDataID";
export * from "./storage/settings/settingsFile";
export * from "./storage/settings/settings";
export * from "./storage/settings/settingsConditions/types/functionSettingsConditions";
export * from "./storage/settings/settingsConditions/types/dataSettingsConditions";
export * from "./storage/settings/settingsConditions/abstractSettingsConditions";
