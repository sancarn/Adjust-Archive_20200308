import {Registry} from "../registry";
import {ClassModuleProvider} from "../moduleProviders/classModuleProvider";
import {InstanceModuleProvider} from "../moduleProviders/instanceModuleProvider";
import {ParameterizedModule} from "../../module/module";
import {createModule} from "../../module/moduleClassCreator";
import {DummyModule as DM} from "../../module/_tests/dummyModules.helper";
import {ModuleID} from "../../module/moduleID";
import {ChildModule} from "../../module/_types/moduleContract";

export type dummyInterface = ChildModule<{
    test: () => Promise<number>;
}>;
export type dummyParentInterface = {
    something: () => Promise<void>;
};
export const dummyInterfaceID = Registry.createContractID<{
    parent: dummyParentInterface;
    child: dummyInterface;
}>(__filename + "1");
export class DummyModule
    extends createModule({state: {}, settings: {}, type: dummyInterfaceID}, DM)
    implements dummyInterface {
    protected instanceVal: number = 0;

    public async test(): Promise<number> {
        return ++this.instanceVal;
    }
}
// @ts-ignore
DummyModule.path = "../module/_tests/dummyModules.helper.js"; // A path that can be imported (doesn't matter that it doesn't import this)

class DummyParent
    extends createModule({type: dummyInterfaceID, state: {}, settings: {}}, DM)
    implements dummyParentInterface {
    protected someMethod: () => void;

    static async createCustomInstance(someMethod: () => void = () => {}) {
        const moduleID = new ModuleID("test", 3);
        const instance = await (this as any).createDummy();
        instance.someMethod = someMethod;

        return instance;
    }

    async something(): Promise<void> {
        this.someMethod();
    }
}
// @ts-ignore
DummyParent.path = "../module/_tests/dummyModules.helper.js"; // A path that can be imported (doesn't matter that it doesn't import this)
let dummyParent;

describe("InstanceModuleProvider", () => {
    beforeEach(async () => {
        Registry["moduleProviders"] = {};
        Registry.addProvider(
            new ClassModuleProvider(DummyModule.getConfig().type, DummyModule)
        );
        dummyParent = await DummyParent.createCustomInstance();
    });
    it("Should be used by the registry", async () => {
        // Retrieve such a module
        const module = await Registry.request({
            type: dummyInterfaceID,
            use: "one",
            parent: dummyParent,
        });
        const m: ParameterizedModule = module as any;

        // Add a instance provider
        Registry.addProvider(new InstanceModuleProvider(m.getConfig().type, m, () => 2));

        // Retrieve a module
        const module2 = await Registry.request({
            type: dummyInterfaceID,
            use: "one",
            parent: dummyParent,
        });

        // Check if it's the same, by testing whether the instanceVal is shared
        await module.test();
        expect(await module2.test()).toBe(2);
    });
    it("Should notify of new connections", async () => {
        let notifyCalled = false;
        let dummyParentCalled = false;

        const module = await Registry.request({
            type: dummyInterfaceID,
            use: "one",
            parent: dummyParent,
        });
        const m: ParameterizedModule = module as any;

        // Add a instance provider
        Registry.addProvider(
            new InstanceModuleProvider(
                m.getConfig().type,
                m,
                () => 2,
                (parent: ParameterizedModule & dummyParentInterface) => {
                    notifyCalled = true;
                    parent.something();
                }
            )
        );

        // Retrieve this module hopefulyl same module
        const module2 = await Registry.request({
            type: dummyInterfaceID,
            use: "one",
            parent: await DummyParent.createCustomInstance(
                () => (dummyParentCalled = true)
            ),
        });

        // Check if both methods are called
        expect(notifyCalled).toBeTruthy();
        expect(dummyParentCalled).toBeTruthy();
    });
});
