Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@adjust/core");
const react_1 = require("react");
// Export the type
exports.ThemerType = core_1.Registry.createContractID(__filename);
// Export a context to be used by the themer
/**
 * A context to expose the styled box element, and the theme that it should use
 */
exports.ThemeContext = core_1.React.createContext(null);
/**
 * Retrieves the theme
 */
exports.useTheme = () => react_1.useContext(exports.ThemeContext).theme;
//# sourceMappingURL=themer.type.js.map