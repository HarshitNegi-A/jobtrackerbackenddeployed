const Application = require("../model/ApplicationModel");
const Company = require("../model/CompanyModel");
const Note = require("../model/NoteModel"); // ✅ import Note model
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { Op } = require("sequelize");
require("dotenv").config();

const BUCKET = process.env.S3_BUCKET;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ---------------- CRUD ----------------

exports.createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, companyId, location, status, appliedAt } = req.body;

    const app = await Application.create({
      title,
      companyId, // ✅ use FK
      location,
      status,
      appliedAt,
      userId,
    });

    res.status(201).json({ message: "Application created", application: app });
  } catch (err) {
    console.error("createApplication:", err);
    res.status(500).json({ message: "Error creating application" });
  }
};

exports.getApplication = async (req, res) => {
  try {
    const app = await Application.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [
        { model: Company, attributes: ["id", "name"] },
        { model: Note, attributes: ["id", "content", "createdAt"] }, // ✅ include notes
      ],
    });

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(app);
  } catch (err) {
    console.error("getApplication:", err);
    res.status(500).json({ message: "Error fetching application" });
  }
};

exports.listApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, title, q } = req.query;

    const where = { userId };
    const companyWhere = {};

    if (status) {
      where.status = status;
    }

    if (title) {
      where.title = { [Op.like]: `%${title}%` };
    }

    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { location: { [Op.like]: `%${q}%` } },
      ];
      companyWhere.name = { [Op.like]: `%${q}%` };
    }

    const apps = await Application.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: ["id", "name"],
          where: Object.keys(companyWhere).length ? companyWhere : undefined,
          required: false,
        },
        { model: Note, attributes: ["id", "content", "createdAt"] }, // ✅ include notes
      ],
      order: [["appliedAt", "DESC"]],
    });

    res.json(apps);
  } catch (err) {
    console.error("listApplications:", err);
    res.status(500).json({ message: "Error listing applications" });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { title, companyId, location, status, appliedAt } = req.body;

    const [updated] = await Application.update(
      { title, companyId, location, status, appliedAt },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    if (!updated) return res.status(404).json({ message: "Application not found" });

    const app = await Application.findByPk(req.params.id, {
      include: [
        { model: Company, attributes: ["id", "name"] },
        { model: Note, attributes: ["id", "content", "createdAt"] }, // ✅ include notes
      ],
    });

    res.json({ message: "Updated", application: app });
  } catch (err) {
    console.error("updateApplication:", err);
    res.status(500).json({ message: "Error updating application" });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const deleted = await Application.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!deleted) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteApplication:", err);
    res.status(500).json({ message: "Error deleting application" });
  }
};

// ---------------- S3 Upload & Download ----------------

exports.getUploadUrl = async (req, res) => {
  try {
    const app = await Application.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!app) return res.status(404).json({ message: "Application not found" });

    const fileName = `resume-${Date.now()}.pdf`;
    const key = `resumes/${req.user.id}/${req.params.id}/${fileName}`;

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: "application/pdf",
      ACL: "private",
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });

    app.resumeKey = key;
    await app.save();

    res.json({ uploadUrl: url, key });
  } catch (err) {
    console.error("getUploadUrl:", err);
    res.status(500).json({ message: "Error generating upload URL" });
  }
};

exports.getResumeDownloadUrl = async (req, res) => {
  try {
    const app = await Application.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!app || !app.resumeKey) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: app.resumeKey });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });

    res.json({ downloadUrl: url, key: app.resumeKey });
  } catch (err) {
    console.error("getResumeDownloadUrl:", err);
    res.status(500).json({ message: "Error generating download URL" });
  }
};
