import {ExtendedObject} from "../utils/extendedObject";
import {Constructor, ExtendsClass} from "../utils/_types/standardTypes";
import {ParameterizedModule} from "./module";
import {ModuleView} from "./moduleView";
import {ExtendedModuleViewClass} from "./_types/extendedModuleView";

export class ModuleViewClassCreator {
    /**
     * Creates a new class extending the passed class, with a dynamic name
     * @param name The name for the class
     * @param cls The class to extend
     */
    protected static createNamedClass<K extends Constructor<any>>(
        name: string,
        cls: K
    ): K {
        return new Function("cls", `return class ${name} extends cls {}`)(cls);
    }

    /**
     * A function to create a new module view class
     * @param module The module class to create the view for
     * @param state The initial state to augment the module state with
     * @param moduleView The module view class to extend
     */
    public static createModuleView<
        M extends Constructor<any>,
        S extends object = {},
        // Can't use ModuleView<{}, {}, ParameterizedModule, {}> instead of {}, due to it expecting private members
        V extends ExtendsClass<
            typeof ModuleView,
            ModuleView<{}, {}, ParameterizedModule, {}>
        > = ExtendsClass<typeof ModuleView, ModuleView<{}, {}, ParameterizedModule, {}>>
    >(module: M, state?: S, moduleView?: V): ExtendedModuleViewClass<M, S, V> {
        // Set the initialState to the default state if not specified
        if (!state) state = {} as any;

        // Set the module view class to the default module if not specified
        if (!moduleView) moduleView = ModuleView as any;

        // Create the class
        const cls = this.createNamedClass((moduleView as any).name, moduleView);

        // Get the initial state of the super class
        const superState = moduleView.state;

        // Combine the settings of both configs, giving priority to the new config
        const combinedStates = ExtendedObject.copyData(superState, {}) as any;
        ExtendedObject.copyData(state, combinedStates);

        // Assign the combined initialState to the class
        cls.state = combinedStates;

        // Return the created class
        return cls as any;
    }
}

/**
 * A shortcut for the module view creation method
 */
export const createModuleView: (typeof ModuleViewClassCreator)["createModuleView"] = ModuleViewClassCreator.createModuleView.bind(
    ModuleViewClassCreator
);
