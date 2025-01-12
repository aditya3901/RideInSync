const UserDocs = require("../../models/user_docs");
const UserUploadDocs = require("../../models/user_upload_docs");
const catchAsync = require("../../utils/catchAsync");

exports.addRequiredDocs = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  const newDoc = await UserDocs.create({
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
  const user = req.user;

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

  const allDocsUploaded = requiredDocs.every((doc) => doc.uploaded);
  user.verified = allDocsUploaded;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      requiredDocs,
    },
    verified: user.verified,
  });
});

exports.uploadDocs = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { docId, file } = req.body;

  const uploadDoc = await UserUploadDocs.create({
    file,
    user_id: user._id,
    doc_id: docId,
  });

  user.uploadedDocuments.push(docId);
  await user.save();

  res.status(201).json({
    status: "success",
    uploadDoc,
  });
});
