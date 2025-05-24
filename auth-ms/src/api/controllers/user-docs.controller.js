const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { userDocsService } = require("../../services");

/**
 * Add required documents for users
 * @POST /user/docs/required
 */
const addRequiredDocs = catchAsync(async (req, res) => {
  const doc = await userDocsService.addRequiredDoc(req.body);

  res.status(httpStatus.CREATED).json({
    status: "success",
    data: {
      doc,
    },
  });
});

/**
 * Get required documents for users
 * @GET /user/docs/required
 */
const getRequiredDocs = catchAsync(async (req, res) => {
  const result = await userDocsService.getRequiredDocsWithStatus(req.user);

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      requiredDocs: result.requiredDocs,
    },
    verified: result.verified,
  });
});

/**
 * Upload user documents
 * @POST /user/docs/upload
 */
const uploadDocs = catchAsync(async (req, res) => {
  const uploadDoc = await userDocsService.uploadUserDoc(req.user, req.body);

  res.status(httpStatus.CREATED).json({
    status: "success",
    data: {
      uploadDoc,
    },
  });
});

module.exports = {
  addRequiredDocs,
  getRequiredDocs,
  uploadDocs,
};
