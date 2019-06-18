import {Json} from "../utils/_types/standardTypes";
import {ProgramState} from "./programState";
import {SerializeableData} from "../utils/_types/serializeableData";
import {Data} from "../storage/data";
import {Serialize} from "../utils/serialize";
import {ModuleProxy} from "../module/moduleProxy";
import {ParameterizedModule} from "../module/module";

export class StateData<
    S extends {
        [key: string]: SerializeableData;
    }
> extends Data<S> {
    /**@override  */
    public serialize(): Json {
        return Serialize.serialize(this.get as SerializeableData);
    }

    /**
     * Loads the passed data into the module
     * @param data The actual data to load into this module instance
     * @param context The module whose state this is
     */
    public deserialize(data: Json, context?: ParameterizedModule): void {
        this.changeData(Serialize.deserialize(data, path => {
            // Get the module from the state
            const module = ProgramState.getModule(path);

            // Create a proxy for the module
            const moduleProxy = module.createProxy();

            // Check if there is a context to connect to
            const contextProxy = module.parents.find(
                parent => (parent._target as any) == context
            ) as any;
            if (!contextProxy) {
                // TODO: add error once architecture has been changed such that locations don't require passing modules around
                // throw Error(`module doesn't specify context as parent`);
                return moduleProxy;
            }

            // Connect the procies, and return the module proxy
            moduleProxy.connect(contextProxy);
            return moduleProxy;
        }) as any);
    }
}
