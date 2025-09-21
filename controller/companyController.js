const Company = require("../model/CompanyModel");

exports.createCompany = async (req, res) => {
  try {
    const { name, website, industry, location, careersPage, contactEmail } = req.body;
    const company = await Company.create({
      name,
      website,
      industry,
      location,
      careersPage,
      contactEmail,
      userId: req.user.id,
    });
    res.status(201).json(company);
  } catch (err) {
    console.error("createCompany:", err);
    res.status(500).json({ message: "Error creating company" });
  }
};

exports.listCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({ where: { userId: req.user.id } });
    res.json(companies);
  } catch (err) {
    console.error("listCompanies:", err);
    res.status(500).json({ message: "Error listing companies" });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json(company);
  } catch (err) {
    console.error("getCompany:", err);
    res.status(500).json({ message: "Error fetching company" });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const [updated] = await Company.update(req.body, {
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!updated) return res.status(404).json({ message: "Company not found" });

    const company = await Company.findByPk(req.params.id);
    res.json(company);
  } catch (err) {
    console.error("updateCompany:", err);
    res.status(500).json({ message: "Error updating company" });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const deleted = await Company.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!deleted) return res.status(404).json({ message: "Company not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteCompany:", err);
    res.status(500).json({ message: "Error deleting company" });
  }
};
