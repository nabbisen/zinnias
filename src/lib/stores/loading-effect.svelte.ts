const state = $state({
    active: false
});

export const loading = {
    get active() {
        return state.active;
    },
    start() {
        state.active = true;
    },
    stop() {
        state.active = false;
    }
};
