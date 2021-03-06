import {ConditionValue} from "./conditionalValue";
import {SortedList} from "../../../utils/sortedList";

/**
 * Stores a certain settings variable and all its values that apply to this target
 */
export type SettingPriorityList<C> = SortedList<ConditionValue<C>>;

/**
 * Stores a certain settings variable and all its values that apply to this target, with a default parameter provided
 */
export type ParameterizedSettingPriorityList<C = any> = SettingPriorityList<C>;
