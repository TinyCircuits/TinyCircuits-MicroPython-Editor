// https://github.com/gzuidhof/coi-serviceworker?tab=readme-ov-file#customization
// Don't want service worker on anything other than main page for SharedBufferArray
window.coi = {
    shouldRegister: () => {return window.location.pathname == "/" ? true : false},
    shouldDeregister: () => {return window.location.pathname == "/" ? false : true},
    coepCredentialless: () => true,
    coepDegrade: () => true,
    doReload: () => window.location.reload(),
    quiet: false
};