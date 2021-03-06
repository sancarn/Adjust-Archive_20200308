var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React_1 = require("../../React");
const moduleClassCreator_1 = require("../../module/moduleClassCreator");
const SettingsManager_type_1 = require("./SettingsManager.type");
const moduleViewClassCreator_1 = require("../../module/moduleViewClassCreator");
const registry_1 = require("../../registry/registry");
const path_1 = __importDefault(require("path"));
const core_1 = require("@adjust/core");
const SettingsIndex_type_1 = require("./components/index/SettingsIndex.type");
const SettingsSearchBar_type_1 = require("./components/SettingsSearchBar.type");
const ChildBox_1 = require("../../components/ChildBox");
const Box_1 = require("../../components/Box");
const ParentBox_1 = require("../../components/ParentBox");
const SettingsModuleSettings_type_1 = require("./components/page/moduleSettings/SettingsModuleSettings.type");
const settingsManagerConfig = moduleClassCreator_1.createConfig({
    state: {
        index: {
            // The source types and modules lists
            types: [],
            modules: [],
            // THe types and modules as a tree
            typesTree: {},
            modulesTree: {},
            // The types and modules as a tree filtered
            filteredTypesTree: {},
            filteredModulesTree: {},
        },
        components: {
            index: null,
            searchbar: null,
        },
    },
    settings: {},
    type: SettingsManager_type_1.SettingsManagerType,
});
class SettingsManagerModule extends moduleClassCreator_1.createModule(settingsManagerConfig) {
    /** @override */
    async onPreInit() {
        registry_1.Registry.addProvider(new core_1.InstanceModuleProvider(SettingsManager_type_1.SettingsManagerType, this, () => 2));
    }
    /** @override */
    async onInit() {
        await this.retrieveContractTypes();
        await this.retrieveModules();
        const index = await this.request({ type: SettingsIndex_type_1.SettingsIndexType });
        await index.setData(this.state.index);
        const searchbar = await this.request({ type: SettingsSearchBar_type_1.SettingsSearchBarType });
        this.changeState({
            components: {
                index,
                searchbar,
            },
        });
        this.request({
            type: SettingsModuleSettings_type_1.SettingsModuleSettingsType,
            data: { path: this.getClass().getPath() },
        });
    }
    // Index retrieval methods
    /**
     * Loads the contract types data into the state
     */
    async retrieveContractTypes() {
        // Get all types
        const contractTypes = await registry_1.Registry.getContractIDs();
        // Extract their data
        const normalizedContractTypes = contractTypes.map(contractID => {
            const packag = core_1.PackageRetriever.requireModulePackage(contractID.ID);
            return Object.assign({ ID: contractID.ID, type: "contractType", package: packag }, contractID.details, { section: (packag
                    ? packag.name + (contractID.details.section ? "." : "")
                    : "") + contractID.details.section });
        });
        // Format the data into a tree
        const contractTypesTree = {};
        normalizedContractTypes.forEach(contractType => {
            const section = contractType.section.split(".");
            // Create the package if absent
            const packag = section[0];
            if (!contractTypesTree[packag])
                contractTypesTree[packag] = Object.assign({}, (contractType.package && {
                    name: contractType.package.name,
                    repository: contractType.package.repository,
                    description: contractType.package.description,
                }), { children: {} });
            // Add the contract type to the tree
            this.createTreeType(contractTypesTree[packag], [...section.splice(1), contractType.name], contractType);
        });
        // Store the data in the state
        this.changeState({
            index: { types: normalizedContractTypes, typesTree: contractTypesTree },
        });
    }
    /**
     * Creates a contract type in the tree at the passed path
     * @param tree The tree to add the field to
     * @param path The path to the field
     * @param value The value to store at the path
     * @modifies tree
     */
    createTreeType(tree, path, type) {
        const field = path[0];
        if (field != null) {
            // Make sure the node has a children field
            if (!("children" in tree))
                tree["children"] = {};
            // Let ts know tree always has a children field
            if ("children" in tree) {
                let childTree = tree.children[field];
                if (!childTree)
                    childTree = tree.children[field] = { name: field };
                this.createTreeType(childTree, path.slice(1), type);
            }
        }
        else {
            // Put the type data into the tree node
            Object.assign(tree, type);
        }
    }
    /**
     * Loads the module data into the state
     */
    async retrieveModules() {
        // Get all modules
        const providers = await registry_1.Registry.getProviders();
        const classProviders = [];
        Object.values(providers).forEach(providers => classProviders.push(...providers.filter(provider => provider instanceof core_1.ClassModuleProvider)));
        const modulesClasses = classProviders.map(provider => provider.getModuleClass());
        // Extract their data
        const normalizedModules = modulesClasses.map(moduleClass => {
            const packag = moduleClass.getPackage();
            const details = moduleClass.getDetails();
            const path = moduleClass.getPath();
            return Object.assign({ path, package: packag, type: "module" }, details, { name: details.name || path.split(path_1.default.sep).pop(), section: (packag ? packag.name + (details.section ? "." : "") : "") +
                    details.section });
        });
        // Format the data into a tree
        const modulesTree = {};
        normalizedModules.forEach(moduleType => {
            const section = moduleType.section.split(".");
            // Create the package if absent
            const packag = section[0];
            if (!modulesTree[packag])
                modulesTree[packag] = Object.assign({}, (moduleType.package && {
                    name: moduleType.package.name,
                    repository: moduleType.package.repository,
                    description: moduleType.package.description,
                }), { children: {} });
            // Add the contract type to the tree
            this.createTreeModule(modulesTree[packag], [...section.splice(1), moduleType.name], moduleType);
        });
        // Store the data in the state
        this.changeState({ index: { modules: normalizedModules, modulesTree: modulesTree } });
    }
    /**
     * Creates a contract type in the tree at the passed path
     * @param tree The tree to add the field to
     * @param path The path to the field
     * @param value The value to store at the path
     * @modifies tree
     */
    createTreeModule(tree, path, type) {
        const field = path[0];
        if (field != null) {
            // Make sure the node has a children field
            if (!("children" in tree))
                tree["children"] = {};
            // Let ts know tree always has a children field
            if ("children" in tree) {
                let childTree = tree.children[field];
                if (!childTree)
                    childTree = tree.children[field] = { name: field };
                this.createTreeModule(childTree, path.slice(1), type);
            }
        }
        else {
            // Put the type data into the tree node
            Object.assign(tree, type);
        }
    }
    // Searchbar methods
    /**
     * Filters the modules tree based on the search
     * @param filter The text to filter based on
     */
    filterModuleTree(filter) {
        const filteredModulesTree = {};
        core_1.ExtendedObject.forEach(this.state.index.modulesTree, (key, packag) => {
            packag.children;
        });
    }
    filterModule(filter, node) {
        // Check if this node is a category or a node
        if ("children" in node) {
            const filteredNode = { name: node.name, children: {} };
            // Add all children that matcch the filter to the filtered node
            core_1.ExtendedObject.forEach(node.children, (key, node) => {
                const filtered = this.filterModule(filter, node);
                if (filtered)
                    filteredNode.children[key] = filtered;
            });
            // Return the filtered node if there are any children
            if (Object.keys(filteredNode.children).length == 0)
                return null;
            return filteredNode;
        }
        else {
            // if(node.path)
        }
    }
    /** @override */
    async updateSearch(search) {
        console.log(search);
    }
    // Child interaction methods
    /** @override */
    async selectModule(path) {
        // TODO: implement
    }
    /** @override */
    async selectType(path) {
        // TODO: implement
    }
    // General interaction methods
    /** @override */
    async openView() {
        // TODO: implement
    }
    /** @override */
    async selectSetting(modulePath, settingPath) {
        // TODO: implement
    }
}
exports.SettingsManagerModule = SettingsManagerModule;
exports.default = SettingsManagerModule;
class SettingsManagerView extends moduleViewClassCreator_1.createModuleView(SettingsManagerModule) {
    /** @override */
    renderView() {
        return (React_1.React.createElement(ChildBox_1.ChildBox, null,
            React_1.React.createElement(Box_1.Box, { display: "flex", flexDirection: "column" },
                React_1.React.createElement(ParentBox_1.ParentBox, null, this.state.components.searchbar),
                React_1.React.createElement(ParentBox_1.ParentBox, { flexGrow: 1 }, this.state.components.index))));
    }
}
exports.SettingsManagerView = SettingsManagerView;
//# sourceMappingURL=SettingsManager.js.map