import {SingletonType, Singleton} from "./singleton.type";
import {
    React,
    createModule,
    createModuleView,
    Registry,
    InstanceModuleProvider,
} from "@adjust/gui";

export const config = {
    initialState: {text: ""},
    settings: {},
    type: SingletonType,
};

export default class SingletonModule extends createModule(config) implements Singleton {
    /** @override */
    public async onInit(fromReload: boolean) {
        console.log("singleton created");
        Registry.addProvider(new InstanceModuleProvider(SingletonType, this, () => 2));
        if (!fromReload) {
            const data = this.getData();
            this.setState({
                text: data.text,
            });
        }
    }

    /** @override */
    async onStop() {
        console.log("Singleton stopped");
    }

    /** @override */
    public async setText(text: string) {
        this.setState({
            text: text,
        });
    }
}

export class SingletonView extends createModuleView(SingletonModule) {
    protected renderView(): JSX.Element {
        return (
            <span
                css={{
                    backgroundColor: "purple",
                    color: "white",
                    padding: 3,
                    ":hover": {
                        backgroundColor: "orange",
                    },
                }}>
                {this.state.text}
                {this.state.isStopped && "stopped"}
            </span>
        );
    }
}
