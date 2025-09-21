const Note = require("../model/NoteModel");
const Application = require("../model/ApplicationModel");

// Add a note
exports.addNote = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const note = await Note.create({ content, applicationId });
    res.status(201).json({ message: "Note added", note });
  } catch (err) {
    console.error("addNote:", err);
    res.status(500).json({ message: "Error adding note" });
  }
};

// Get notes for an application
exports.getNotes = async (req, res) => {
  try {
    const { id: applicationId } = req.params;
    const notes = await Note.findAll({ where: { applicationId } });
    res.json(notes);
  } catch (err) {
    console.error("getNotes:", err);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.noteId } });
    if (!deleted) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("deleteNote:", err);
    res.status(500).json({ message: "Error deleting note" });
  }
};
