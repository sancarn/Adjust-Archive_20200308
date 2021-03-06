Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@adjust/core");
const module_1 = require("./module");
const registry_1 = require("../registry/registry");
const locationManager_type_1 = require("../modules/location/locationManager.type");
// Specify that the default module to be used is our extend module
class ModuleClassCreator extends core_1.ModuleClassCreator {
    /** @override */
    static createModule(config, moduleClass) {
        // Set the module class to the default module if not specified
        if (!moduleClass)
            moduleClass = module_1.Module;
        // Add location definition to the install method if present
        if (config.defineLocation) {
            const install = config.onInstall;
            config.onInstall = async (moduleClass) => {
                // Obtain the location manager instance
                const locationManager = await registry_1.Registry.createRoot({
                    type: locationManager_type_1.LocationManagerType,
                });
                await locationManager.updateLocation(config.defineLocation);
                // Call the original install function
                if (install)
                    return install(moduleClass);
            };
            if (!config.location)
                config.location = config.defineLocation.ID;
        }
        // If a module location is provided, assign it to the settings
        if (config.location)
            config.settings.location = {
                default: config.location,
            };
        // Call the method as per usual
        return super.createModule(config, moduleClass);
    }
    /**
     * Method may be used to perform typechecking on a config
     * @param config The config to type check
     * @returns A copy of the module
     */
    static createConfig(config) {
        return config;
    }
}
exports.ModuleClassCreator = ModuleClassCreator;
/**
 * A shortcut for the module creation method
 */
exports.createModule = ModuleClassCreator.createModule.bind(ModuleClassCreator);
/**
 * A shortcut for the config creation method
 */
exports.createConfig = ModuleClassCreator.createConfig.bind(ModuleClassCreator);
//# sourceMappingURL=moduleClassCreator.js.map