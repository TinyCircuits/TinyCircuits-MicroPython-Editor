/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("268e77x0vdqor8v")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ilysyj02",
    "name": "game_social_link",
    "type": "url",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": [
        "x.com",
        "facebook.com",
        "instagram.com",
        "bsky.app",
        "reddit.com"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("268e77x0vdqor8v")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ilysyj02",
    "name": "game_social_link",
    "type": "url",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "exceptDomains": null,
      "onlyDomains": [
        "x.com",
        "facebook.com",
        "instagram.com",
        "bsky.app"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
