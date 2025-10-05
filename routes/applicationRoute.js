
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controller/applicationController");

router.post("/applications", auth, controller.createApplication);
router.get("/applications", auth, controller.listApplications);
router.get("/applications/:id", auth, controller.getApplication);
router.put("/applications/:id", auth, controller.updateApplication);
router.delete("/applications/:id", auth, controller.deleteApplication);



module.exports = router;
