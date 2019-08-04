import { BrowserWindow } from "electron";
import { ModuleViewData } from "../../module/_types/moduleViewData";
import { ParameterizedModule } from "../../module/module";
import { ModuleID } from "../../module/moduleID";
import { ViewNotFound } from "../../modules/viewNotFound.type";
import { AsyncSerializeableData } from "../../utils/_types/serializeableData";
/**
 * Keeps track of all windows and is able to create new ones
 * Also takes care of sending module updates to windows
 */
declare class WindowManagerSingleton {
    protected readonly windows: {
        [windowID: string]: {
            window: Promise<BrowserWindow>;
            moduleCounts: {
                [moduleID: string]: number;
            };
            openedAt: number;
        };
    };
    protected readonly viewNotFoundModule: ViewNotFound;
    /**
     * Creates a window manager
     */
    constructor();
    /**
     * Create the view not found module if not created already
     */
    protected createViewNotFoundModule(): Promise<void>;
    /**
     * Opens the window with the given ID
     * @param windowID The ID of the window to open
     * @param moduleID The ID of the root view of the window
     * @param options The extra options to pass to the window
     * @returns The browser window that was created
     */
    openWindow(windowID: string, moduleID: ModuleID | string, options?: Electron.BrowserWindowConstructorOptions): Promise<BrowserWindow>;
    /**
     * Retrieves a window if it has been opened already
     * @param windowID The ID of the window
     * @returns The window that was found
     */
    getWindow(windowID: string): Promise<BrowserWindow>;
    /**
     * Closes the window with the given ID
     * @param windowID The ID of the window to close
     * @returns Whether or not the window has been closed on request (might not be the case if it got opened again before resolving)
     */
    closeWindow(windowID: string): Promise<boolean>;
    /**
     * Adds listeners to the module to forward its data to a window's GuiManager
     * @param moduleID The moduleID of the module to forward to a window
     * @param windowID The id of the window to forward the data to
     */
    protected listenToModule(moduleID: ModuleID | string, windowID: string): void;
    /**
     * Sends the state data to a given window for a given module
     * @param module The module to which this data belongs
     * @param windowID The ID of the window that the module is located in
     * @param data The data to be send
     */
    protected sendStateData(module: ParameterizedModule, windowID: string, data: AsyncSerializeableData): Promise<void>;
    /**
     * Removes the listeners from the module to stop forwarding its data to a window's GuiManager
     * @param moduleID The moduleID of the module that is forwarding to a window
     * @param windowID The id of the window the module is forwarding the data to
     */
    protected stopListeningToModule(moduleID: ModuleID | string, windowID: string): void;
    /**
     * Obtains the current data of the module
     * @param moduleID The moduleID of the module to get the data for
     * @param window The window that the module is located in
     * @param windowID The ID of the window that the module is located in
     * @returns The data of the module data
     */
    protected getModuleData(moduleID: ModuleID | string, windowID: string): ModuleViewData;
    /**
     * Retrieves the size of the main display
     * @returns The display's size
     */
    getScreenSize(): Promise<{
        width: number;
        height: number;
    }>;
}
export declare const WindowManager: WindowManagerSingleton;
export {};
