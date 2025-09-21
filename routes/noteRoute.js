const express = require("express");
const router = express.Router();
const noteController = require("../controller/noteController");
const auth = require("../middleware/auth");

router.post("/applications/:id/notes", auth, noteController.addNote);
router.get("/applications/:id/notes", auth, noteController.getNotes);
router.delete("/notes/:noteId", auth, noteController.deleteNote);

module.exports = router;
