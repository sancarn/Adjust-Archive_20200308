/// <reference types="react" />
import { ModuleReference } from "@adjust/core";
import { LocationAncestor } from "../../../locationAncestor.type";
import LocationAncestorModule from "../../../locationAncestor";
import { LocationPath } from "../../../../_types/LocationPath";
import { ModuleLocation } from "../../../../../../module/_types/ModuleLocation";
import { Window } from "./window.type";
export declare const config: {
    initialState: {
        childLocationAncestor: Promise<LocationAncestor>;
        windowName: string;
    };
    settings: {};
    type: import("@adjust/core/types").InterfaceID<import("./window.type").WindowContract>;
};
declare const WindowModule_base: import("@adjust/core/types").ExtendedModuleClass<{
    initialState: {
        childLocationAncestor: Promise<LocationAncestor>;
        windowName: string;
    };
    settings: {};
    type: import("@adjust/core/types").InterfaceID<import("./window.type").WindowContract>;
}, typeof LocationAncestorModule>;
export default class WindowModule extends WindowModule_base implements Window {
    protected ancestorName: string;
    protected window: Promise<Electron.BrowserWindow>;
    /**
     * Opens the window that this module instance represents
     * @returns The opened or retrieved window
     */
    protected openWindow(): Promise<Electron.BrowserWindow>;
    /**
     * Closes the window if it had been opened already
     */
    protected closeWindow(): Promise<void>;
    /** @override */
    protected onStop(): Promise<void>;
    /** @override */
    createLocation(location: ModuleLocation): Promise<LocationPath>;
    /** @override */
    removeLocation(locationPath: LocationPath): Promise<boolean>;
    /**
     * Opens the child location ancestor and returns it
     * @returns The child location ancestor
     */
    protected getChild(): Promise<LocationAncestor>;
    /** @override */
    openModule(module: ModuleReference, locationPath: LocationPath): Promise<LocationPath>;
    /** @override */
    closeModule(module: ModuleReference, locationPath: LocationPath): Promise<boolean>;
    /** @override */
    showModule(module: ModuleReference, locationPath: LocationPath): Promise<boolean>;
    /** @override */
    setEditMode(edit: boolean): Promise<void>;
    /** @override */
    setDropMode(drop: boolean): Promise<void>;
    /** @override */
    setName(name: string): Promise<void>;
    setEdit(edit: boolean): Promise<void>;
    saveSettings(): Promise<void>;
}
declare const WindowView_base: import("@adjust/core/types").ExtendedModuleViewClass<typeof WindowModule, {}, import("@adjust/core/types").ExtendsClass<typeof import("@adjust/core/dist/module/moduleView").ModuleView, import("@adjust/core/dist/module/moduleView").ModuleView<{}, {}, import("@adjust/core/dist/module/module").Module<import("@adjust/core/types").ModuleState, import("@adjust/core/types").SettingsConfig, import("@adjust/core/types").ModuleInterface>, {}>>>;
export declare class WindowView extends WindowView_base {
    /**@override */
    componentWillMount(): void;
    /**
     * Renders the header with the window's controls
     */
    protected renderHeader(): JSX.Element;
    /**@override */
    protected renderView(): JSX.Element;
}
export {};
