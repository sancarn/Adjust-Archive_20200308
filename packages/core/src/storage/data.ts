import {DeepReadonly, DeepPartial, Json, Omit} from "../utils/_types/standardTypes";
import {Setters} from "./_types/setters";
import {EventEmitter} from "../utils/eventEmitter";
import {ExtendedObject} from "../utils/extendedObject";
import {JsonPartial} from "./_types/jsonPartial";

export class Data<S extends object> extends EventEmitter {
    public readonly get: DeepReadonly<S>; // The data of the object
    public readonly set: DeepReadonly<Setters<S>>; // The setters for the object data

    // TODO: add a way to directly register a listener for a certain field

    protected storeUndefined: boolean; // Whether or not undefined values should be kept in the data

    /**
     * A class that stores data and emits events on changes of the data
     * @param initialData The initial data to store in the system, the set structure will also be based on this
     * @param storeUndefined Whether or not to explicitely store undefined, and whether to keep empty objects
     */
    constructor(initialData: S, storeUndefined: boolean = true) {
        super();
        this.storeUndefined = storeUndefined;

        // Set up the initial data
        // @ts-ignore
        this.get = {};
        this.changeData(initialData as any);

        // Create setters from the initial data (which includes undefined structures if included)
        const Class = (this as any).__proto__.constructor as typeof Data;
        this.set = Class.createSetters(
            initialData,
            this.changeData.bind(this)
        ) as DeepReadonly<Setters<S>>;
    }

    /**
     * Changes properties in the data of the module, and rerenders the associated GUI
     * @param changedProps An object with all the changed properties and their values
     */
    public async changeData(changedProps: JsonPartial<S>): Promise<void> {
        // Get the current values for the changed properties
        const originalProps = ExtendedObject.copyData(this.get, {}, changedProps);

        // Alter the values in the Data of the passed properties
        ExtendedObject.copyData(changedProps, this.get, undefined, this.storeUndefined);

        // Emit an event to notify listeners of the change
        await this.emitAsync("change", changedProps, originalProps);
    }

    /**
     * Goes through the initial data in order to map all fields to setter methods on the set object
     * @param object The object for which to create setter functions
     * @param path The path of the given object from the root in this data
     * @returns The mapped object where all values are callable setter functions
     */
    public static createSetters<T extends object>(
        object: T,
        change: (path: object) => any,
        path: string = ""
    ): Setters<T> {
        return ExtendedObject.map(object, (value, key) => {
            // Make sure it's not a disallowed property name
            if (["name", "length", "caller", "arguments", "__proto__"].includes(key))
                throw Error(`property name '${key}' is not allowed`);

            // Create an object path from the string path, an leave the property value blank
            const top = {};
            const propPath = ExtendedObject.translatePathToObject(path, top);

            // Create the set method
            const setter = value => {
                // Change the top most part of the data path (the value)
                top[key] = value;

                // Emit the change
                return change(propPath);
            };

            // Add any subsetters to the setter if necessary by recursing
            if (value instanceof Object) {
                const p = (path ? path + "." : "") + key;

                // Assign the child setters
                Object.assign(
                    setter,
                    this.createSetters((value as any) as object, change, p)
                );
            }

            // Map the data to the setter
            return setter;
        }) as Setters<T>;
    }

    // Serialization
    /**
     * Serializes the data in order to store it
     * @returns The data of the module
     */
    public serialize(): Json {
        return ExtendedObject.copyData(this.get as S, {});
    }

    /**
     * Loads the passed data into the module
     * @param data The actual data to load into this module instance
     */
    public deserialize(data: Json): void {
        this.changeData(data as any);
    }

    // Events
    /**
     * Adds a listener for the alteration of data data
     * @param type The type of listener, I.e. data change
     * @param listener The function to call when an event of the given type is emited
     * @param name A name for this particular listener for identification
     * @returns The name of the listener (generated if none was supplied)
     */
    public on(
        type: "change",
        listener: (
            changedProps: DeepReadonly<DeepPartial<S>>,
            previousProps: DeepReadonly<DeepPartial<S>>
        ) => void | Promise<any>,
        name?: string
    ): string;

    /**
     * Simply registers any event type using EventEmitter
     */
    public on(
        type: string,
        listener: (...args: any) => void | Promise<any>,
        name?: string
    ): string;
    public on(
        type: string,
        listener: (...args: any) => void | Promise<any>,
        name?: string
    ): string {
        return super.on(type, listener, name);
    }
}