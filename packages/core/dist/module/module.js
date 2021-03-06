Object.defineProperty(exports, "__esModule", { value: true });
const remoteModuleProxy_1 = require("./remoteModuleProxy");
const programState_1 = require("../state/programState");
const settings_1 = require("../storage/settings/settings");
const stateData_1 = require("../state/stateData");
const requestPath_1 = require("./requestPath/requestPath");
const registry_1 = require("../registry/registry");
const moduleProxy_1 = require("./moduleProxy");
const settingsManager_1 = require("../storage/settings/settingsManager");
exports.baseConfig = {
    version: "0.0.0",
    details: {
        icon: "",
        name: "Module",
        description: "The base module",
        section: "",
    },
    package: null,
    settings: {},
    settingsMigrators: {},
    state: {
        isStopping: false,
        isStopped: false,
    },
    onInstall: () => { },
    onLoad: () => { },
    abstract: true,
    type: null,
    viewClass: null,
    getPriority: () => 1,
};
/**
 * The base class to build your app using adjust gui
 *
 * Takes care of the following tasks:
 * -    Tracking modue file location for importing it
 * -    Storing a serializable state
 * -    Storing settings that can be altered by the user
 *
 */
class Module {
    /**
     * The core building block for Adjust applications
     * @returns An unregistered instance of this module
     */
    constructor() {
        this.children = []; // A list of all the modules that have been requested and not closed yet
    }
    /**
     * Creates an instancce of this module, without registring it in the program state
     * @param request
     * @param moduleID
     */
    static async createUnregisteredInstance(request, moduleID) {
        // Obtain the required data to instanciate the module
        const initialState = this.getConfig().state;
        request.requestPath = this.createRequestPath(moduleID, request.parent, request.data);
        const parents = request.parent ? [request.parent] : [];
        // Create the instance
        const module = new this();
        // Setup request related data
        // @ts-ignore
        module.requestData = request;
        // @ts-ignore
        module.ID = moduleID;
        // @ts-ignore
        module.parents = parents;
        module.parent = module.parents[0];
        // State initialization
        // @ts-ignore
        module.stateObject = new stateData_1.StateData(initialState);
        // @ts-ignore
        module.state = module.stateObject.get;
        // Call the preinit hook
        await module.preInit();
        // Settings initialization
        // @ts-ignore
        module.settingsObject = await settings_1.Settings.createInstance(module);
        // @ts-ignore
        module.settings = module.settingsObject.get;
        return module;
    }
    /**
     * Creates an instance of this module, given an ID for the instance and a request
     * @param request The request that started the creation of the module
     * @param moduleID The ID that the new instance should have
     * @returns A new instance of this class, returns a proxy for the module
     */
    static async createInstance(request, moduleID) {
        // Creates an instance
        const module = await this.createUnregisteredInstance(request, moduleID);
        // Register the module
        programState_1.ProgramState.addModule(module);
        // Create the proxy for the module and connect to the parent proxy
        const moduleProxy = module.createProxy();
        if (request.parent) {
            moduleProxy._connect(request.parent);
            request.parent.notifyChildAdded(moduleProxy);
        }
        // Initialize the module
        await module.init();
        if (request.parent)
            request.parent.notifyChildInitialized(moduleProxy);
        // Return the module proxy
        return moduleProxy;
    }
    /**
     * Get the request path for this module based on its parent and the ID
     * @param moduleID The ID of this module
     * @param parent The parent of this module
     * @param data The json data that was send with this request
     * @returns The request path obtained
     */
    static createRequestPath(moduleID, parent, data) {
        if (parent) {
            // Extend the parent's path
            const parentRequestPath = parent.getRequestPath();
            return parentRequestPath.extend(moduleID, data);
        }
        else {
            // If the module is a root, create a path from scratch
            return new requestPath_1.RequestPath(moduleID, data);
        }
    }
    // Initialisation
    /**
     * A method that gets called to perform initialisation, immediately when the module was created
     * Will automaticcally be called once, upon creation. This method will run before init, and even before the module's settings have been obtained (and thus can't used them)
     */
    async preInit() {
        await this.onPreInit();
    }
    /**
     * A method that gets called to perform initialisation, immediately when the module was created
     * Will automaticcally be called once, upon creation. This method will run before init, and even before the module's settings have been pbtained (and thus can't used them)
     */
    async onPreInit() { }
    /**
     * A method that gets called to perform initialisation,
     * Will be called when a new module connects as well, but will ensure that onInit is called only once
     * (will be called by external setup method, such as from a module provider)
     */
    async init() {
        // Call the module's on init method
        await this.onInit();
    }
    /**
     * A method that gets called to perform any initialization,
     * will be called only once, after having been added to the state
     */
    async onInit() { }
    // State related methods
    /**
     * Retrieves the entire state object of the module
     * @returns The entire state object on which listeners could be registered
     */
    getStateObject() {
        return this.stateObject;
    }
    /**
     * Changes the current state of the module
     * @param changedProps An object containing any fields of the state that have changed
     * @returns A promise that resolves once all listeners have resolved
     */
    async changeState(changedProps) {
        return this.stateObject.changeData(changedProps);
    }
    // Settings related methods
    /**
     * Retrieves the entire settings object of the module
     * @returns The entire settings object on which listeners could be registered
     */
    getSettingsObject() {
        return this.settingsObject;
    }
    /**
     * Changes the settings of the module
     * @param changedProps An object containing any fields of the settings that have changed
     * @param condition The settings condition to store the data under
     * @returns A promise that resolves once all listeners have resolved
     */
    async changeSettings(changedProps, condition) {
        return this.settingsObject.changeData(changedProps, condition);
    }
    // Request related methods
    /**
     * Returns the ID of this module
     * @returns The ID
     */
    getID() {
        return this.ID;
    }
    /** @override */
    toString() {
        return this.ID.toString();
    }
    /**
     * Retrieves the request that instanciated this module
     * @returns The request
     */
    getRequest() {
        return this.requestData;
    }
    /**
     * Retrieves the request path for this module
     * @returns The request path
     */
    getRequestPath() {
        return this.requestData.requestPath;
    }
    /**
     * Retrieves the request data for this module
     * @returns The request data
     */
    getData() {
        return this.requestData.data;
    }
    /**
     * Retrieves the parent of this module
     * @returns The parent that made the request
     */
    getParent() {
        return this.parent;
    }
    /**
     * Retrievs the additional parents of this module of any
     * @returns An array of the additional parents
     */
    getParents() {
        return this.parents;
    }
    async request(request) {
        // Get the reponse(s) from the registry
        const response = registry_1.Registry.request(Object.assign({ parent: this }, request));
        // Register the responses as children
        this.notifyChildAdded(response);
        // Wait for the promises to resolve
        const result = await response;
        // Remove the promises
        this.notifyChildRemoved(response);
        // Return the response
        return result;
    }
    // Parent management
    /**
     * Adds an additonal parent to the module (for when obtained with instance module provider)
     * @param parent The new parent to add
     */
    notifyParentAdded(parent) {
        this.parents.push(parent);
        this.onAddParent(parent);
    }
    /**
     * Removes an additional parent from the module (for when an additional parent closes the child)
     * @param parent The parent to remove
     * @returns Whether this was the last parent
     */
    notifyParentRemoved(parent) {
        // Remove the parent
        const index = this.parents.indexOf(parent);
        if (index >= 0) {
            this.parents.splice(index, 1);
            // Notify about the parent disconnect
            this.onRemoveParent(parent);
            // Check if this is the main parent, and if so, replace it
            if (parent == this.parent) {
                this.parent = this.parents[0];
                // Check if there is a replacement
                if (this.parent)
                    this.onChangeMainParent(this.parent, parent);
                else
                    return true;
            }
        }
    }
    /**
     * Checks whether the given parent is this module's last parent
     * @param parent The parent to check
     * @returns Whether or not this parent is the module's last parent
     */
    isLastParent(parent) {
        const index = this.parents.indexOf(parent);
        return index >= 0 && this.parents.length == 1;
    }
    /**
     * Called when a parent is added
     * @param parent The parent that was added
     */
    onAddParent(parent) { }
    /**
     * Called when any parent is removed (Either the main or additional parent)
     * @param parent The parent that was removed
     */
    onRemoveParent(parent) { }
    /**
     * Called when the main parent is removed, but an additional parent may take over
     * @param newParent The additional parent that is taking over
     * @param oldParent The previously main parent that got removed
     */
    onChangeMainParent(newParent, oldParent) { }
    /**
     * Retrieves the context that this method was called from, should be called before any awaits
     * @returns The program node from which the method was called
     * @throws {IllegalStateException} If the method is not called from the start of a interface method
     */
    getCallContext() {
        if (this.callContext === undefined)
            throw Error("Method shouldn't be called after an async call");
        return this.callContext;
    }
    /**
     * Updates the call context, should only be invoked by the proxy
     * @param callContext The new context
     */
    setCallContext(callContext) {
        this.callContext = callContext;
    }
    /**
     * Indicates that this module is now the parent of the given module
     * @param module The module that is now a child of this module, but not necessarily initialized yet
     */
    notifyChildAdded(module) {
        this.children.push(module);
    }
    /**
     * Indicates that this module is now the parent of the given module that was just initialized
     * @param module The module that is now a child of this module and just initialized
     */
    notifyChildInitialized(module) {
        this.onAddChild(module);
    }
    /**
     * Indicates that this module is no longer the parent of the given module
     * @param module The module that is no longer a child of this module (due to being closed)
     */
    notifyChildRemoved(module) {
        const index = this.children.indexOf(module);
        if (index != -1)
            this.children.splice(index, 1);
        this.onRemoveChild(module);
    }
    /**
     * Called when a child is added
     * @param child The child that was added
     */
    onAddChild(child) { }
    /**
     * Called when a child is removed
     * @param child The child that was removed
     */
    onRemoveChild(child) { }
    // Closing related methods
    /**
     * Stop and close the module
     */
    async close() {
        // Get the caller of the method, and make sure it's a parent
        const context = this.getCallContext();
        if (context && context.isParentof(this)) {
            const isLast = this.isLastParent(context);
            // Close the parent
            this.notifyParentRemoved(context);
            context.notifyChildRemoved(this);
            // Only close the module if it was the last parent
            if (isLast) {
                // Stop and destroy this module
                await this.stop();
                await this.destroy();
                await this.onClose();
            }
        }
        else
            throw Error("Module may only be closed by its parent");
    }
    /**
     * A hook for tasks to execute when the node is closed
     */
    async onClose() { }
    /**
     * Stops the program node's tasks
     */
    async stop() {
        // Indicate we are now attempting to stop
        await this.changeState({
            isStopping: true,
        });
        // Perform stopping methods
        await this.stopChildren();
        await this.onStop();
        // Indicate the module has now stopped
        this.changeState({
            isStopped: true,
        });
    }
    /**
     * A hook for tasks to execute when the node is stopped
     */
    async onStop() { }
    /**
     * Stops all of the children and awaits them
     */
    async stopChildren() {
        // Close all of the modules and wait for them to finish
        await Promise.all(this.children.map(async (module) => {
            if (module instanceof moduleProxy_1.ModuleProxy)
                module.close();
            else {
                let modules = await module;
                if (!(modules instanceof Array))
                    modules = [modules];
                await Promise.all(modules.map(module => module.close()));
            }
        }));
    }
    /**
     * Disposes all stored resources of the node and unlinks itself from the state
     */
    async destroy() {
        programState_1.ProgramState.removeModule(this);
        this.settingsObject.destroy();
    }
    /**
     * Gets a 'singleton' remote proxy class for this module class
     * @returns The remoteModuleProxy for this module class
     */
    static getRemoteProxyClass() {
        if (!this.remoteProxyClass)
            this.remoteProxyClass = remoteModuleProxy_1.RemoteModuleProxy.createClass(this);
        return this.remoteProxyClass;
    }
    /**
     * Gets a 'singleton' proxy class for this node
     * @returns The programNodeProxy for this programNode class
     */
    static getProxyClass() {
        if (!this.proxyClass)
            this.proxyClass = moduleProxy_1.ModuleProxy.createClass(this);
        return this.proxyClass;
    }
    /**
     * Creates a proxy for this program node
     * @returns The created proxy
     */
    createProxy() {
        // Get the proxy class for this program node
        const ProxyClass = this.getClass().getProxyClass();
        // Create and return a new instance of this proxy class
        return ProxyClass.createInstance(this);
    }
    /**
     * A hook for detecting when the module has been loaded
     * @remarks Useful if the module path is required
     * @param isMain Whether or not the class was loaded in the main process
     * @param modulePath The path of this module
     */
    static onFileLoad(isMain, modulePath) { }
    /**
     * Retrieves the config of the module
     * @returns The module's config
     */
    static getConfig() {
        return this.config;
    }
    /**
     * Retrieves an instance of the settings file for this module
     * @returns The settings file instance
     */
    static async getSettingsFile() {
        return settingsManager_1.SettingsManager.getSettingsFile(this);
    }
    /**
     * Retrieves the package of the module
     * @returns THe module's package
     */
    static getPackage() {
        return this.config.package;
    }
    /**
     * Retrieves the details of the module to be displayed to the user
     * @returns The module's details
     */
    static getDetails() {
        return this.config.details;
    }
    /**
     * Loads the module and installs if there is no settings file present for it
     * @returns A promise that resolves when installation is complete, indicating whether installation happened
     */
    static async loadAndInstallIfRequired() {
        // Load the module
        await this.getConfig().onLoad(this);
        // Check if an install is required or whether the mdoule has been installed already
        if (!settingsManager_1.SettingsManager.fileExists(this.getPath())) {
            // Create the settings file once to call all listeners and save it
            const settingsFile = await this.getSettingsFile();
            settingsFile.setDirty(true);
            // Call the installation method
            await this.getConfig().onInstall(this);
            return true;
        }
        return false;
    }
    /**
     * Retrieves the config of the module
     * @returns The module's config
     */
    getConfig() {
        return this.getClass().config;
    }
    /**
     * Assigns a view class to the config of this module
     * @param viewClass The view class to relate to this module class
     */
    static setViewClass(viewClass) {
        this.getConfig().viewClass = viewClass;
    }
    // Importing related methods
    getClass() {
        // Get the class out of this object instance
        return this.__proto__.constructor;
    }
    /**
     * Returns the path to this file, relative to the modules folder
     * @returns The path to this file
     */
    static getPath() {
        return this.path;
    }
    /**
     * Returns the path to this module class
     * @returns The path to this module class
     * @public
     */
    static toString() {
        return this.getPath();
    }
}
// Config related methods
Module.config = exports.baseConfig; // The config of the module, will be replaced by createModule
Module.path = ""; // The path of the importable class TODO: refer to some 'missing' path
exports.Module = Module;
//# sourceMappingURL=module.js.map