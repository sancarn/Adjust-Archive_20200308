var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const data_1 = require("../data");
const settingsManager_1 = require("./settingsManager");
const settingsConditions_1 = require("./settingsConditions");
const eventEmitter_1 = require("../../utils/eventEmitter");
const extendedObject_1 = require("../../utils/extendedObject");
const sortedList_1 = require("../../utils/sortedList");
class SettingsFile extends eventEmitter_1.EventEmitter {
    /**
     * Creates a settingsFile to store settings for a certain module class
     * @param module The path to store the settings at
     * @param config The settings config
     */
    constructor(path, config) {
        super();
        // Store the path
        if (path_1.default.extname(path) == "js")
            path = path_1.default.resolve(path_1.default.dirname(path), path_1.default.basename(path));
        if (path_1.default.extname(path) == "")
            path += ".json";
        this.path = path;
        this.config = config;
        // Store the structure
        this.shape = this.extractShape(config);
    }
    /**
     * Creates a settingsFile to store settings for a certain module class
     * @param path The path to store the settings at
     * @param config The settings config
     */
    static async createInstance(path, config) {
        // Normalize the data
        let moduleClass;
        if (typeof path == "function") {
            moduleClass = path;
            config = moduleClass.getConfig().settings;
            path = moduleClass.getPath();
        }
        //  Create an instance
        const settingsFile = new this(path, config);
        settingsFile.moduleClass = moduleClass;
        // Only the provided data will be used if no data is stored yet
        await settingsFile.reload([
            {
                condition: undefined,
                priority: 0,
                ID: 0,
                data: settingsFile.extractDefault(config),
            },
        ]);
        // Return the settings file
        return settingsFile;
    }
    // Setup/teardown methods
    /**
     * Extracts the default values from a settings config
     * @param config The config of which to extract the default values
     * @returns The default values
     */
    extractDefault(config) {
        const data = {};
        extendedObject_1.ExtendedObject.forEach(config, (key, value) => {
            if (value.default !== undefined)
                data[key] = value.default;
            else
                data[key] = this.extractDefault(value);
        });
        return data;
    }
    /**
     * Extracts the value shape of the settings by mapping all defaults to undefined
     * @param config The config of which to extract the shape
     * @returns The shape of the settings
     */
    extractShape(config) {
        const data = {};
        extendedObject_1.ExtendedObject.forEach(config, (key, value) => {
            if (value.default !== undefined)
                data[key] = undefined;
            else
                data[key] = this.extractShape(value);
        });
        return data;
    }
    /**
     * Destroys this settings file instance, if there are no more listeners
     */
    destroy() {
        if (this.listeners["change"] && this.listeners["change"].length == 0)
            settingsManager_1.SettingsManager.removeSettingsFile(this.path, this);
    }
    // Condition related methods
    /**
     * Retrieves the settings conditions from the ID it has
     * @param ID The ID of the settings conditions within these settings
     * @returns The settings conditions that match this ID
     */
    getCondition(ID) {
        if (typeof ID == "object")
            ID = ID.ID;
        const set = this.settings.get().find(set => set.ID == ID);
        return set && set.condition;
    }
    /**
     * Retrieves the settings conditions' ID within these settings
     * @param condition The conditions to retrieve the ID of
     * @returns The ID that could be found matching
     */
    getConditionID(condition) {
        const set = this.settings.get().find(set => set.condition.equals(condition));
        return set && set.ID;
    }
    // Retrieval methods
    /**
     * Retrieves the module class that these settings are for if any
     * @returns The associated module class
     */
    getModuleClass() {
        return this.moduleClass;
    }
    /**
     * Retrieves all settings and their conditions
     * @return All settings
     */
    getAllSettings() {
        return this.settings;
    }
    /**
     * Retrieves the shape of the settings data
     * @returns The shape, with all values being undefined
     */
    getStucture() {
        return this.shape;
    }
    /**
     * Gets a Data instance for the given condition
     * @param condition The condition for which to get (or create) a Data instance
     * @returns The retrieved or created Data instance
     */
    getConditionData(condition) {
        // Normalize the conditions
        if (!(condition instanceof settingsConditions_1.SettingsConditions) && condition !== undefined)
            condition = this.getCondition(condition);
        // Get the settingsSetData if already defined
        let settingsSetData = this.settings
            .get()
            .find(settingSetData => settingSetData.condition.equals(condition));
        // If not previously defined, create it
        if (!settingsSetData) {
            const data = new data_1.Data(this.shape, false);
            // Setup a listener
            data.on("change", this.valueChange.bind(this, condition), "SettingsFile");
            // Create the settings set data
            const settingsDataID = this.settings.get().reduce((cur, set) => Math.max(set.ID, cur), 0) + 1;
            settingsSetData = {
                condition: condition,
                ID: settingsDataID,
                data: data,
            };
            this.settings.push(settingsSetData);
        }
        // Return the data
        return settingsSetData.data;
    }
    /**
     * Gets the getter object of a Data instance for a particular condition
     * @param condition The condition for which to get the getter
     * @retursn The getter that was found
     */
    get(condition) {
        return this.getConditionData(condition).get;
    }
    // Altering settings
    /**
     * Gets the setter object of a Data instance for a particular condition
     * @param condition The condition for which to get the setter
     * @retursn The setter that was found
     */
    set(condition) {
        return this.getConditionData(condition).set;
    }
    /**
     * Processes events emitted by data objects, and forwards them to listeners (called by the data objects)
     * @param condition The condition of the changed data
     * @param changedProps The changed properties
     * @param previousProps The values that the properties had before
     */
    async valueChange(condition, changedProps, previousProps) {
        // Indicate that the file is dirty now
        this.setDirty(true);
        // Call all listeners
        const promises = [];
        extendedObject_1.ExtendedObject.forEachPaired([changedProps, previousProps, this.config], 
        // Emit all value changes
        (key, [newValue, oldValue, config], path) => {
            // If the config described a change event, fire it and add it to promises to wait for
            if (config.onChange)
                promises.push(config.onChange(newValue, condition, oldValue, this));
            // Emit the change event, and add it to promises to wait for
            promises.push(this.emitAsync("change", path, newValue, condition, oldValue));
        }, 
        // Only recurse when we haven't hit a setting value yet
        (key, value, path) => !("default" in extendedObject_1.ExtendedObject.getField(this.config, path)), true);
        // Wait for the promises to resolve
        await Promise.all(promises);
    }
    // Saving
    /**
     * Saves the current data in the corresponding file
     */
    save() {
        const data = this.settings
            .filter(settingsSet => Object.keys(settingsSet.data.get).length > 0)
            .map(settingsSet => ({
            condition: settingsSet.condition.getData(),
            priority: settingsSet.condition.getPriority(),
            ID: settingsSet.ID,
            data: settingsSet.data.serialize(),
        }));
        settingsManager_1.SettingsManager.saveFile(this.path, data);
        this.setDirty(false);
    }
    /**
     * Reloads the settings as are present in the stored file
     * @param initialSettings The settings to load if no file is present
     * @returns A promise that resolves once all events have resolved
     */
    async reload(initialSettings) {
        // TODO: Only fire events of values that actually changed, and track their previous values
        // Load the previously stored data if present
        const storedData = settingsManager_1.SettingsManager.loadFile(this.path);
        // A method to load the specified settings data
        const getSettings = initialSettings => {
            // Create data objects for all of them
            const settingsData = (initialSettings || []).map(settings => {
                const data = new data_1.Data(settings.data);
                data.on("change", this.valueChange.bind(this, settings.condition), "SettingsFile");
                return {
                    condition: new settingsConditions_1.SettingsConditions(settings.condition, settings.priority || 0),
                    ID: settings.ID,
                    data: data,
                };
            });
            // Create a sorted list and store all the settings in it
            const getPriority = (condition) => condition == null ? 0 : condition.getPriority();
            const settings = new sortedList_1.SortedList((a, b) => getPriority(b.condition) - getPriority(a.condition));
            settings.push.apply(settings, settingsData);
            // Return the settings
            return settings;
        };
        // Try loading the stored data, load the defaults on failure
        try {
            if (storedData)
                this.settings = getSettings(storedData);
            else
                this.settings = getSettings(initialSettings);
        }
        catch (e) {
            console.error("Something went wrong while loading the settings", e);
            this.settings = getSettings(initialSettings);
            // TODO: store backup of settings before they are overwritten by defaults
        }
        // Emit change events for all settings
        const promises = this.settings.map(settings => this.valueChange(settings.condition, settings.data.get, undefined));
        await Promise.all(promises);
        this.setDirty(false);
    }
    /**
     * Changes whether or not this file is dirty
     * @param dirty Whether or not this file is dirty
     */
    setDirty(dirty) {
        if (this.isDirty != dirty) {
            this.isDirty = dirty;
            settingsManager_1.SettingsManager.setDirty(this, dirty);
        }
    }
    on(type, listener, name) {
        return super.on(type, listener, name);
    }
}
exports.SettingsFile = SettingsFile;
//# sourceMappingURL=settingsFile.js.map