/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("ecm10bnvc0zcte8");

  return dao.deleteCollection(collection);
}, (db) => {
  const collection = new Collection({
    "id": "ecm10bnvc0zcte8",
    "created": "2024-10-15 17:27:23.974Z",
    "updated": "2024-10-15 17:27:23.974Z",
    "name": "game_comments",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "10mhptn7",
        "name": "field",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
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
})
