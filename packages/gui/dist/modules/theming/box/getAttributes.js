Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Retrieves attributes their css equivalent, with the value obtained from the theme
 * @param props The props to retrieve the data from
 * @param attributes The attribute data that maps to the css
 * @param theme The theme to get the data from
 * @returns The css props
 */
function getAttribute(props, attributes, getValue) {
    const out = {};
    Object.keys(props).forEach(key => {
        const css = attributes instanceof Function ? attributes(key) : attributes[key];
        if (css) {
            // Obtain the value from the theme
            const value = getValue(props[key], key, out);
            // Assigns the value to the props
            if (typeof css == "string") {
                out[css] = value;
            }
            else if (typeof css == "function") {
                css(out, value);
            }
            else {
                out[key] = value;
            }
        }
    });
    return out;
}
exports.getAttribute = getAttribute;
//# sourceMappingURL=getAttributes.js.map