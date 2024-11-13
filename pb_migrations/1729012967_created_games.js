/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "oxzynrc9dpgpb6r",
    "created": "2024-10-15 17:22:47.327Z",
    "updated": "2024-10-15 17:22:47.327Z",
    "name": "games",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "z2ggzzah",
        "name": "files",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [],
          "thumbs": [],
          "maxSelect": 1,
          "maxSize": 5242880,
          "protected": false
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("oxzynrc9dpgpb6r");

  return dao.deleteCollection(collection);
})
