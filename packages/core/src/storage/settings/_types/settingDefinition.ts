/**
 * The data of a single Setting in the config
 */

export type SettingDefinition<V> = {
    default: V;
    type: string | Object;
    validation?: (value: any) => Error | void;
};

/**
 * The data of a single Setting in the config, with default params
 */

export type ParameterizedSettingDefinition<V = any> = SettingDefinition<V>;
