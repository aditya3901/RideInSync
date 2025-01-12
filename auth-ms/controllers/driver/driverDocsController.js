const DriverDocs = require("../../models/driver_docs");
const DriverUploadDocs = require("../../models/driver_upload_docs");
const catchAsync = require("../../utils/catchAsync");

exports.addRequiredDocs = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const newDoc = await DriverDocs.create({
    name,
    description,
  });

  res.status(201).json({
    status: "success",
    data: {
      newDoc,
    },
  });
});

exports.getRequiredDocs = catchAsync(async (req, res, next) => {
  const driver = req.driver;

  const allDocs = await DriverDocs.find();
  const driverUploadDocs = driver.uploadedDocuments;

  const requiredDocs = allDocs.map((doc) => {
    const uploadedDoc = driverUploadDocs.find(
      (uploadDoc) => uploadDoc.toString() == doc._id.toString()
    );

    return {
      ...doc.toObject(),
      uploaded: !!uploadedDoc,
    };
  });

  const allDocsUploaded = requiredDocs.every((doc) => doc.uploaded);
  driver.verified = allDocsUploaded;
  await driver.save();

  res.status(200).json({
    status: "success",
    data: {
      requiredDocs,
    },
    verified: driver.verified,
  });
});

exports.uploadDocs = catchAsync(async (req, res, next) => {
  const driver = req.driver;
  const { docId, file } = req.body;

  const uploadDoc = await DriverUploadDocs.create({
    file,
    driver_id: driver._id,
    doc_id: docId,
  });

  driver.uploadedDocuments.push(docId);
  await driver.save();

  res.status(201).json({
    status: "success",
    uploadDoc,
  });
});
