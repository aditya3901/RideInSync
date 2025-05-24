const httpStatus = require("http-status");
const { UserDocs, UserUploadDocs, User } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Add required document type
 * @param {Object} docData - Document data
 * @returns {Promise<UserDocs>}
 */
const addRequiredDoc = async (docData) => {
  return UserDocs.create({
    name: docData.name,
    required: docData.required,
    description: docData.description,
  });
};

/**
 * Get all required documents with upload status for a user
 * @param {Object} user - User object
 * @returns {Promise<Object>} Documents with upload status and user verification status
 */
const getRequiredDocsWithStatus = async (user) => {
  const allDocs = await UserDocs.find();
  const userUploadDocs = user.uploadedDocuments;

  const requiredDocs = allDocs.map((doc) => {
    const uploadedDoc = userUploadDocs.find(
      (uploadDoc) => uploadDoc.toString() == doc._id.toString()
    );

    return {
      ...doc.toObject(),
      uploaded: !!uploadedDoc,
    };
  });

  // Update user verification status based on document uploads
  const allDocsUploaded = requiredDocs.every((doc) => doc.uploaded);
  user.verified = allDocsUploaded;
  await user.save();

  return {
    requiredDocs,
    verified: user.verified,
  };
};

/**
 * Upload a document for a user
 * @param {Object} user - User object
 * @param {Object} docData - Document data
 * @returns {Promise<UserUploadDocs>}
 */
const uploadUserDoc = async (user, docData) => {
  const uploadDoc = await UserUploadDocs.create({
    file: docData.file,
    user_id: user._id,
    doc_id: docData.doc_id,
  });

  // Add document to user's uploaded documents
  user.uploadedDocuments.push(uploadDoc.doc_id);
  await user.save();

  return uploadDoc;
};

/**
 * Get all document types
 * @returns {Promise<UserDocs[]>}
 */
const getAllDocTypes = async () => {
  return UserDocs.find();
};

module.exports = {
  addRequiredDoc,
  getRequiredDocsWithStatus,
  uploadUserDoc,
  getAllDocTypes,
};
