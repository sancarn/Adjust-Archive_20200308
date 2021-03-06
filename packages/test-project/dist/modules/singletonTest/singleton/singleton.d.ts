/// <reference types="react" />
import { Singleton } from "./singleton.type";
export declare const config: {
    state: {
        text: string;
    };
    settings: {};
    type: import("@adjust/core/types").ContractID<import("./singleton.type").SingletonContract>;
};
declare const SingletonModule_base: import("@adjust/core/types").ExtendedModuleClass<{
    state: {
        text: string;
    };
    settings: {};
    type: import("@adjust/core/types").ContractID<import("./singleton.type").SingletonContract>;
}, import("@adjust/core/types").ExtendsClass<typeof import("@adjust/gui").Module, import("@adjust/gui").Module>>;
export default class SingletonModule extends SingletonModule_base implements Singleton {
    /** @override */
    onPreInit(): Promise<void>;
    /** @override */
    onInit(): Promise<void>;
    /** @override */
    onStop(): Promise<void>;
    /** @override */
    setText(text: string): Promise<void>;
}
declare const SingletonView_base: import("@adjust/core/types").ExtendedModuleViewClass<typeof SingletonModule, {}, import("@adjust/core/types").ExtendsClass<typeof import("@adjust/gui").ModuleView, import("@adjust/gui").ModuleView<{}, {}, import("@adjust/gui").Module, {}>>>;
export declare class SingletonView extends SingletonView_base {
    protected renderView(): JSX.Element;
}
export {};
