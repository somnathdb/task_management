const express = require("express");
const router = express.Router();
const templateController = require("../../controllers/template/templateController");

router.post(
  "/create",
  templateController.CreateTemplate
);
router.get("/", templateController.getAllTemplate);

router.post(
  "/update",
   templateController.updateTemplateDetails
);

router.get('/getTemplateById', templateController.getTemplateById)
router.get('/deleteTemplateById', templateController.deleteTemplateById)

module.exports = router