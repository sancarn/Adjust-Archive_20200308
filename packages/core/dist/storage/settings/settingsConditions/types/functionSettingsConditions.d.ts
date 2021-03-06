import { ParameterizedModule } from "../../../../module/module";
import { Condition } from "../_types/condition";
import { SettingsConditions } from "../abstractSettingsConditions";
import { Json } from "../../../../utils/_types/standardTypes";
export declare class FunctionSettingsConditions extends SettingsConditions {
    static typeName: string;
    protected condition: Condition;
    protected conditionString: string;
    protected data: Json[];
    protected dataString: string;
    /**
     * Creates a new instance of these settings conditions
     * @param condition The condition function to use (may not use ANY scope variables)
     * @param priority The priority of the settings set
     * @param data Any data to forward to the condition function as a third argument
     * @param disabled Whether or not these settings are disabled
     * @param name The name of the conditions
     */
    constructor(condition: Condition | string, priority: number, data?: Json[], disabled?: boolean, name?: string);
    /** @override */
    static deserialize(data: Json, priority: number, disabled: boolean, name: string): SettingsConditions;
    /** @override */
    serialize(): Json;
    /** @override */
    matches(module: ParameterizedModule): boolean;
    /** @override */
    equals(condition: SettingsConditions): boolean;
}
