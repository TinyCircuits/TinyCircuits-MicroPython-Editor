/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("268e77x0vdqor8v")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ccttk0i7",
    "name": "game_downloads",
    "type": "number",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "min": 0,
      "max": null,
      "noDecimal": true
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("268e77x0vdqor8v")

  // remove
  collection.schema.removeField("ccttk0i7")

  return dao.saveCollection(collection)
})
