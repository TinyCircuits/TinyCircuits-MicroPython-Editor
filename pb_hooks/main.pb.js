// https://pocketbase.io/docs/js-overview/#javascript-engine
// https://pocketbase.io/docs/js-routing/#retrieving-the-current-auth-state
routerAdd("GET", "/hello/:name", (c) => {
    let name = c.pathParam("name")

    return c.json(200, { "message": "Hello " + name })
})