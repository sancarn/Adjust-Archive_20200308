import {Json} from "../../../../utils/_types/standardTypes";

/**
 * A type representing any settings condition in its serialized form
 */
export type SerializedSettingsConditions = {
    type: string;
    data: Json;
    priority: number;
};