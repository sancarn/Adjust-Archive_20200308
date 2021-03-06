import Path from "path";
import {Registry} from "../../registry/registry";
import {createModule} from "../moduleClassCreator";
import {ModuleState} from "../_types/moduleState";
import {SettingsConfig} from "../../storage/settings/_types/settingsConfig";
import {ModuleContract, ChildModule, ParentModule} from "../_types/moduleContract";
import {ModuleRequestData} from "../_types/moduleRequestData";
import {ModuleID} from "../moduleID";
import {Module} from "../module";

export type dummyInterface = {
    smth: (text: string) => Promise<string>;
};
export const dummyInterfaceID = Registry.createContractID<{
    parent: ParentModule<{}>;
    child: ChildModule<dummyInterface>;
}>(__filename + "1");
export class DummyModule
    extends createModule({state: {}, settings: {}, type: dummyInterfaceID})
    implements dummyInterface {
    /**
     * Creates a dummy instance of this module, which wont be registered to the program state
     * @param data The optional data to create a module
     * @returns A dummy module
     */
    public static createDummy(
        data: {
            parent?: any;
            data?: any;
            type?: any;
            moduleID?: ModuleID;
        } = {}
    ): Promise<DummyModule> {
        return this.createUnregisteredInstance(
            {
                parent: data.parent || null,
                data: data.data || null,
                type: data.type || null,
            },
            data.moduleID || new ModuleID("path", 0)
        ) as any;
    }

    public async smth(text: string): Promise<string> {
        return text;
    }
}
export default DummyModule; // In order to import it as a module from the registry

// @ts-ignore
DummyModule.path = ["", "..", "module", "_tests", "dummyModules.helper.js"].join(
    Path.sep
); // A path that can be imported

export type dummyInterface2 = {
    test2: (test: string) => Promise<void>;
};
export const dummyInterfaceID2 = Registry.createContractID<{
    parent: ParentModule<{someMethod: () => Promise<void>}>;
    child: ChildModule<dummyInterface2>;
    data: {shit: string};
}>(__filename + "2");
export class DummyModule2
    extends createModule({state: {}, settings: {}, type: dummyInterfaceID2})
    implements dummyInterface2 {
    public async test2(text: string) {
        // Example of type safe detection of what module called it
        const callContext = this.getCallContext();
        if (callContext.isInstanceof(dummyInterfaceID2)) {
            console.log(callContext.test2);
        } else if (callContext.isParentof(this)) {
            console.log(callContext.someMethod);
        }
    }
}
// @ts-ignore
DummyModule2.path = "test2";

export type dummyInterface3 = {
    test2: (test: string) => Promise<void>;
};
export const dummyInterfaceID3 = Registry.createContractID<{
    parent: ParentModule<{}>;
    child: ChildModule<dummyInterface3>;
}>(__filename + "3");

export class DummyModule4
    extends createModule({state: {}, settings: {}, type: dummyInterfaceID})
    implements dummyInterface {
    public async smth(text: string): Promise<string> {
        return text + "4";
    }

    // Just something to identify this class by
    public static something(): boolean {
        return true;
    }
}
// @ts-ignore
DummyModule4.path = "test4";
