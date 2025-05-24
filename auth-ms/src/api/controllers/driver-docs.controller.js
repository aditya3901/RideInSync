const httpStatus = require("http-status");
const catchAsync = require("../../utils/catchAsync");
const { driverDocsService } = require("../../services");

/**
 * Add required documents for drivers
 * @POST /driver/docs/required
 */
const addRequiredDocs = catchAsync(async (req, res) => {
  const doc = await driverDocsService.addRequiredDoc(req.body);

  res.status(httpStatus.CREATED).json({
    status: "success",
    data: {
      doc,
    },
  });
});

/**
 * Get required documents for drivers
 * @GET /driver/docs/required
 */
const getRequiredDocs = catchAsync(async (req, res) => {
  const result = await driverDocsService.getRequiredDocsWithStatus(req.user);

  res.status(httpStatus.OK).json({
    status: "success",
    data: {
      requiredDocs: result.requiredDocs,
    },
    verified: result.verified,
  });
});

/**
 * Upload driver documents
 * @POST /driver/docs/upload
 */
const uploadDocs = catchAsync(async (req, res) => {
  const uploadDoc = await driverDocsService.uploadDriverDoc(req.user, req.body);

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
