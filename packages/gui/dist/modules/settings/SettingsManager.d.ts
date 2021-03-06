/// <reference types="react" />
import { SettingsManager } from "./SettingsManager.type";
import { ISettingsIndex } from "./_types/ISettingsIndex";
import { ISettingsIndexModuleTree } from "./_types/ISettingsIndexModuleTree";
import { ISettingsIndexTypeTree } from "./_types/ISettingsIndexTypeTree";
import { ISettingsIndexType } from "./_types/ISettingsIndexType";
import { ISettingsIndexModule } from "./_types/ISettingsIndexModule";
import { Module } from "../../module/module";
declare const SettingsManagerModule_base: import("@adjust/core/types").ExtendedModuleClass<{
    state: {
        index: ISettingsIndex;
        components: {
            index: import("@adjust/core/types").ChildModule<{
                setData(index: ISettingsIndex): Promise<void>;
                setSearch(search: string | RegExp): Promise<void>;
            }>;
            searchbar: {
                close(): Promise<void>;
            };
        };
    };
    settings: {};
    type: import("@adjust/core/types").ContractID<import("./SettingsManager.type").SettingsManagerContract>;
}, import("@adjust/core/types").ExtendsClass<typeof Module, Module>>;
export declare class SettingsManagerModule extends SettingsManagerModule_base implements SettingsManager {
    /** @override */
    protected onPreInit(): Promise<void>;
    /** @override */
    onInit(): Promise<void>;
    /**
     * Loads the contract types data into the state
     */
    protected retrieveContractTypes(): Promise<void>;
    /**
     * Creates a contract type in the tree at the passed path
     * @param tree The tree to add the field to
     * @param path The path to the field
     * @param value The value to store at the path
     * @modifies tree
     */
    protected createTreeType(tree: ISettingsIndexTypeTree, path: string[], type: ISettingsIndexType): void;
    /**
     * Loads the module data into the state
     */
    protected retrieveModules(): Promise<void>;
    /**
     * Creates a contract type in the tree at the passed path
     * @param tree The tree to add the field to
     * @param path The path to the field
     * @param value The value to store at the path
     * @modifies tree
     */
    protected createTreeModule(tree: ISettingsIndexModuleTree, path: string[], type: ISettingsIndexModule): void;
    /**
     * Filters the modules tree based on the search
     * @param filter The text to filter based on
     */
    protected filterModuleTree(filter: string): void;
    protected filterModule(filter: string, node: ISettingsIndexModuleTree): ISettingsIndexModuleTree;
    /** @override */
    updateSearch(search: string): Promise<void>;
    /** @override */
    selectModule(path: string): Promise<void>;
    /** @override */
    selectType(path: string): Promise<void>;
    /** @override */
    openView(): Promise<void>;
    /** @override */
    selectSetting(modulePath: string, settingPath?: string): Promise<void>;
}
export default SettingsManagerModule;
declare const SettingsManagerView_base: import("@adjust/core/types").ExtendedModuleViewClass<typeof SettingsManagerModule, {}, import("@adjust/core/types").ExtendsClass<typeof import("../..").ModuleView, import("../..").ModuleView<{}, {}, Module, {}>>>;
export declare class SettingsManagerView extends SettingsManagerView_base {
    /** @override */
    renderView(): JSX.Element;
}
