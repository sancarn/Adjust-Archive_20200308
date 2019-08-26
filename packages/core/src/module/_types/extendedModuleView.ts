import {ParameterizedModule, Module} from "../module";
import {
    DeepPartial,
    Omit,
    Constructor,
    GetConstructed,
    DeepReadonly,
    Map,
} from "../../utils/_types/standardTypes";
import {ModuleView, ParameterizedModuleView} from "../moduleView";
import {ExtractModuleState, ExtractModuleSettings} from "./extendedModule";
import {Settings} from "../../storage/settings/settings";
import {ModuleViewProps} from "./moduleViewProps";
import {ModuleViewState} from "./moduleViewState";
import {ModuleContract, ChildModule} from "./moduleContract";
import {ModuleRequestData} from "./moduleRequestData";
import {ModuleState} from "./moduleState";
import {ModuleReference} from "../moduleID";
import {SettingsConfigData} from "../../storage/settings/_types/settingsConfigData";
import {SettingsConfig} from "../../storage/settings/_types/settingsConfig";

/**
 * Extracts the request data type from a given module
 */
export type ExtractModuleData<M extends ParameterizedModule> = M extends Module<
    any,
    any,
    infer D
>
    ? D["data"]
    : undefined;

/**
 * Extracts the assignable state type from a given module view
 */
export type ExtractModuleViewState<
    V extends {state: any}
> = V["state"] extends ModuleViewState<infer S, any, any> ? S : void;

/**
 * Transforms the module state to the format it will be in the view;
 * -Replaces promises by its values
 * -Replaces modules and module references by JSX elements
 */
export type TransformModuleViewState<S> = S extends ModuleState
    ? {
          [P in keyof S]: S[P] extends Promise<infer T>
              ? TransformModuleViewState<T>
              : S[P] extends Array<infer T>
              ? Array<TransformModuleViewState<T>>
              : TransformModuleViewState<S[P]>;
      }
    : S extends ParameterizedModule
    ? JSX.Element
    : S extends ChildModule<{}>
    ? JSX.Element
    : S extends ModuleReference
    ? JSX.Element
    : S;

/**
 * Filters out any methods from a module view that should be overwritten
 */
export type FilterModuleView<M extends ParameterizedModuleView> = Omit<M, "changeState">;

/**
 * Creates a new module type, based on a module config and a module type
 */
export type ExtendedModuleView<
    M extends ParameterizedModule,
    S extends Map<any>,
    V extends ParameterizedModuleView
> = {
    // Intellisense for prevState won't work 'properly' due to contravariance, we would want to overwrite changeState's signature, rather than merge it.
    // modified From https://github.com/DefinitelyTyped/DefinitelyTyped/blob/eafef8bd049017b3998939de2edbab5d8a96423b/types/react/v15/index.d.ts#L307
    setState(
        state:
            | ((
                  prevState: DeepReadonly<
                      S &
                          ExtractModuleViewState<V> &
                          ModuleViewState<
                              S & ExtractModuleState<M>,
                              ExtractModuleSettings<M>,
                              ExtractModuleData<M>
                          >
                  >,
                  props: ModuleViewProps<M>
              ) => DeepPartial<S & ExtractModuleViewState<V>>)
            | DeepPartial<S & ExtractModuleViewState<V>>,
        callback?: () => any
    ): void;
} & V &
    // FilterModuleView<ModuleView<S & ExtractModuleState<M>, ExtractModuleSettingsConfig<M>, M>>
    ModuleView<
        S & TransformModuleViewState<ExtractModuleState<M>>,
        ExtractModuleSettings<M>,
        M,
        ExtractModuleData<M>
    >;

/**
 * Creates a new module constructor type, based on a module config and a module constructor type
 */
export type ExtendedModuleViewClass<
    M extends Constructor<any>,
    S extends Map<any>,
    V extends Constructor<any>
> = {
    new (...args: any): ExtendedModuleView<GetConstructed<M>, S, GetConstructed<V>>;
} & typeof ModuleView;
