/// <reference types="react" />
import { SettingsIndexCategories } from "./SettingsIndexCategories.type";
import { ISettingsIndexTypeTree } from "../../../_types/ISettingsIndexTypeTree";
import { ISettingsIndexModuleTree } from "../../../_types/ISettingsIndexModuleTree";
import { ISettingsIndexTreeModules } from "./_types/ISettingsIndexTreeModules";
declare const SettingsIndexCategoriesModule_base: import("@adjust/core/types").ExtendedModuleClass<{
    state: {
        data: ISettingsIndexTreeModules;
    };
    settings: {};
    type: import("@adjust/core/types").ContractID<import("./SettingsIndexCategories.type").SettingsIndexCategoriesContract>;
}, import("@adjust/core/types").ExtendsClass<typeof import("../../../../..").Module, import("../../../../..").Module>>;
export declare class SettingsIndexCategoriesModule extends SettingsIndexCategoriesModule_base implements SettingsIndexCategories {
    /** @override*/
    protected onInit(fromReload: boolean): Promise<void>;
    /**
     * Maps the leaves of the tree to their module
     * @param tree The tree to map
     * @returns The mapped tree
     */
    protected mapTree(tree: ISettingsIndexTypeTree | ISettingsIndexModuleTree): Promise<ISettingsIndexTreeModules>;
}
export default SettingsIndexCategoriesModule;
declare const SettingsIndexCategoriesView_base: import("@adjust/core/types").ExtendedModuleViewClass<typeof SettingsIndexCategoriesModule, {}, import("@adjust/core/types").ExtendsClass<typeof import("../../../../..").ModuleView, import("@adjust/core").ModuleView<{}, {}, import("@adjust/core").Module<import("@adjust/core/types").ModuleState, import("@adjust/core/types").SettingsConfig<any>, import("@adjust/core/types").ModuleContract>, {}>>>;
export declare class SettingsIndexCategoriesView extends SettingsIndexCategoriesView_base {
    /** @override */
    renderView(): JSX.Element;
}