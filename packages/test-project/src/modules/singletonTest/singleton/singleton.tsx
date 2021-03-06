import {SingletonType, Singleton} from "./singleton.type";
import {
    React,
    createModule,
    createModuleView,
    Registry,
    InstanceModuleProvider,
    createConfig,
} from "@adjust/gui";

export const config = createConfig({
    state: {text: ""},
    settings: {},
    type: SingletonType,
});

export default class SingletonModule extends createModule(config) implements Singleton {
    /** @override */
    public async onPreInit() {
        Registry.addProvider(new InstanceModuleProvider(SingletonType, this, () => 2));
    }

    /** @override */
    public async onInit() {
        console.log("singleton created");

        const data = this.getData();
        this.changeState({
            text: data.text,
        });
    }

    /** @override */
    async onStop() {
        console.log("Singleton stopped");
    }

    /** @override */
    public async setText(text: string) {
        this.changeState({
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
