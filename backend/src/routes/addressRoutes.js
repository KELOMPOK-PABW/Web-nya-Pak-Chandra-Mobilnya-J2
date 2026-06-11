const express = require("express");
const router = express.Router();
const addressController = require("../controller/addressController");

router.get("/", addressController.getAll);
router.post("/", addressController.create);
router.put("/:id", addressController.update);
router.delete("/:id", addressController.deleteById);

module.exports = router;
