const storeService = require("../services/storeService");
const { updateStoreSchema } = require("../validations/storeValidation");

const getMyStore = async (req, res, next) => {
  try {
    const store = await storeService.getMyStore(req.user.id);
    return res.status(200).json({ success: true, data: store });
  } catch (error) {
    next(error);
  }
};

const updateMyStore = async (req, res, next) => {
  try {
    const { error, value } = updateStoreSchema.validate(req.body, { abortEarly: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const result = await storeService.updateMyStore(req.user.id, value);
    return res.status(200).json({
      success: true,
      message: "Data toko berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyStore, updateMyStore };
