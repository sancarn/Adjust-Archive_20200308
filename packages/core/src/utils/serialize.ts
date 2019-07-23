import {Json} from "./_types/standardTypes";
import {SerializeableData} from "./_types/serializeableData";
import {Module, ParameterizedModule} from "../module/module";
import {ExtendedObject} from "./extendedObject";
import {ModuleProxy} from "../module/moduleProxy";
import {PublicModuleMethods} from "../module/_types/publicModuleMethods";
import {ModuleReference} from "../module/moduleID";

function isModule(data): data is ParameterizedModule | ModuleProxy | PublicModuleMethods {
    return data instanceof Module || data instanceof ModuleProxy;
}

export class Serialize {
    /**
     * Serializes a passed value
     * @param data The data to serialize
     * @returns The serialized data
     */
    public static serialize(data: SerializeableData): Json {
        // Check if the data has to be serialized
        if (data == null) {
            return null;
        } else if (typeof data == "object") {
            // If the data is a module, serialize it
            if (isModule(data))
                return {
                    $type: "ModuleReference",
                    data: ((data as any) as ParameterizedModule).getID().toString(),
                };

            // If the data is a module ID, serialize it
            if (data instanceof ModuleReference)
                return {
                    $type: "ModuleReference",
                    data: data.toString(),
                };

            // If it is an arbitrary object, map its values
            return ExtendedObject.mapPairs(data, (key, value) => [
                key.replace(/^(\$*type)/g, "$$$1"),
                this.serialize(value),
            ]) as Json;
        } else {
            // Simply return the data
            return data;
        }
    }

    /**
     * Deserializes arbitraty data structures that have been serialized by this class
     * @param data The data to ve deserialized
     * @param getModule A method to obtain a module representation from its path
     * @returns The deserialized version of the data
     */
    public static deserialize(
        data: Json,
        getModule: (path: string) => any
    ): SerializeableData {
        // Check if the data has to be deserialized
        if (data == null) {
            return null;
        } else if (typeof data == "object") {
            // Check if the data is a module
            if ("$type" in data && "data" in data) {
                // Check if the type is a module reference
                if (data.$type == "ModuleReference") {
                    return getModule(data.data as string);
                }
            }

            // If it is an arbitrary object, map its values
            return ExtendedObject.mapPairs(data, (key, value) => [
                key.replace(/^\$(\$*type)/g, "$1"),
                this.deserialize(value, getModule),
            ]) as SerializeableData;
        } else {
            // Simply return the data
            return data;
        }
    }
}