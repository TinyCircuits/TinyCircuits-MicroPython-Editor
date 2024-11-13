/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("oxzynrc9dpgpb6r")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8przcdms",
    "name": "field",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("oxzynrc9dpgpb6r")

  // remove
  collection.schema.removeField("8przcdms")

  return dao.saveCollection(collection)
})
