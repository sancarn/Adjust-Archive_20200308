import React from "react";
import {createModuleView} from "../module/moduleViewClassCreator";
import {createModule} from "../module/moduleClassCreator";
import {Registry} from "../registry/registry";
import {InstanceModuleProvider} from "../registry/moduleProviders/instanceModuleProvider";
import {ContextProviderType, ContextProvider} from "./contextProvider.type";
import {createRecursiveRequestFilter} from "../registry/requestFilters";
import {ViewWrapper} from "../module/moduleViewWrapper";

export const contextProviderConfig = {
    state: {
        childProvider: null as ContextProvider,
    },
    getPriority: () => 1,
    settings: {},
    type: ContextProviderType,
};

/**
 * A module of this type is used as the root of the window to provide contexts
 */
export class ContextProviderModule extends createModule(contextProviderConfig)
    implements ContextProvider {
    /** @override */
    protected async onInit(): Promise<void> {
        Registry.addProvider(
            new InstanceModuleProvider(ContextProviderType, this, () => 2)
        );

        // If this is the creation of the module, create a child
        this.changeState({
            childProvider: (await this.request({
                type: ContextProviderType,
                use: createRecursiveRequestFilter(this),
            }))[0],
        });
    }
}
export default ContextProviderModule;

export class ContextProviderView extends createModuleView(ContextProviderModule) {
    /**
     * Renders the data provider in the component tree
     * @param children The children to put in the provider
     */
    protected renderProvider(children: any): JSX.Element {
        // Should be overwritten, this default has no effect
        return children;
    }

    /** @override */
    protected renderView(): JSX.Element {
        let providerChild: JSX.Element = this.props.children;

        if (this.state.childProvider)
            providerChild = (
                <ViewWrapper view={this.state.childProvider}>
                    {this.props.children}
                </ViewWrapper>
            );

        return this.renderProvider(providerChild);
    }
}
