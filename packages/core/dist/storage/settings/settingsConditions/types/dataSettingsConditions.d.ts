import { SettingsConditions } from "../abstractSettingsConditions";
import { Json } from "../../../../utils/_types/standardTypes";
import { ParameterizedModule } from "../../../../module/module";
export declare class DataSettingsConditions extends SettingsConditions {
    static typeName: string;
    protected data: {
        [key: string]: Json;
    };
    protected dataString: string;
    /**
     * Creates a new instance of these settings conditions
     * @param data The data to check for
     * @param priority The priority of the settings set
     * @param disabled Whether or not these settings are disabled
     * @param name The name of the conditions
     */
    constructor(data: {
        [key: string]: Json;
    } | string, priority: number, disabled?: boolean, name?: string);
    /** @override */
    static deserialize(data: Json, priority: number, disabled: boolean, name: string): SettingsConditions;
    /** @override */
    serialize(): Json;
    /** @override */
    matches(module: ParameterizedModule): boolean;
    /** @override */
    equals(condition: SettingsConditions): boolean;
}
