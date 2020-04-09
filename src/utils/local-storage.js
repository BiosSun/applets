const { localStorage } = window;

export default {
    get(key, def) {
        try {
            const valstr = localStorage.getItem(key);
            const val = JSON.parse(valstr);

            return val !== null ? val : def;
        } catch (e) {
            return def;
        }
    },

    set(key, val) {
        const valstr = JSON.stringify(val);

        try {
            localStorage.setItem(key, valstr);
        } catch (e) {
            // 调用者需要明确 localStorage 有可能调用失败
        }
    },

    delete(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            // 调用者需要明确 localStorage 有可能调用失败，
        }
    },
};
