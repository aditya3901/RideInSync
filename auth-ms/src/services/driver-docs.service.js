const httpStatus = require("http-status");
const { DriverDocs, DriverUploadDocs, Driver } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Add required document type
 * @param {Object} docData - Document data
 * @returns {Promise<DriverDocs>}
 */
const addRequiredDoc = async (docData) => {
  return DriverDocs.create({
    name: docData.name,
    required: docData.required,
    description: docData.description,
  });
};

/**
 * Get all required documents with upload status for a driver
 * @param {Object} driver - Driver object
 * @returns {Promise<Object>} Documents with upload status and driver verification status
 */
const getRequiredDocsWithStatus = async (driver) => {
  const allDocs = await DriverDocs.find();
  const driverUploadDocs = driver.uploadedDocuments;

  const requiredDocs = allDocs.map((doc) => {
    const uploadedDoc = driverUploadDocs.find(
      (uploadDoc) => uploadDoc.toString() === doc._id.toString()
    );

    return {
      ...doc.toObject(),
      uploaded: !!uploadedDoc,
    };
  });

  // Update driver verification status based on document uploads
  const allDocsUploaded = requiredDocs.every((doc) => doc.uploaded);
  driver.verified = allDocsUploaded;
  await driver.save();

  return {
    requiredDocs,
    verified: driver.verified,
  };
};

/**
 * Upload a document for a driver
 * @param {Object} driver - Driver object
 * @param {Object} docData - Document data
 * @returns {Promise<DriverUploadDocs>}
 */
const uploadDriverDoc = async (driver, docData) => {
  const uploadDoc = await DriverUploadDocs.create({
    file: docData.file,
    user_id: driver._id,
    doc_id: docData.doc_id,
  });

  // Add document to driver's uploaded documents
  driver.uploadedDocuments.push(uploadDoc._id);
  await driver.save();

  return uploadDoc;
};

/**
 * Get all document types
 * @returns {Promise<DriverDocs[]>}
 */
const getAllDocTypes = async () => {
  return DriverDocs.find();
};

module.exports = {
  addRequiredDoc,
  getRequiredDocsWithStatus,
  uploadDriverDoc,
  getAllDocTypes,
};
