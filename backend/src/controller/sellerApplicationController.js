const service = require("../services/sellerApplicationService");
const { sellerApplicationSchema } = require("../validations/sellerApplicationValidation");

const apply = async (req, res, next) => {
  try {
    const { error, value } = sellerApplicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const userId = req.user.id;
    const result = await service.apply(userId, value);

    res.status(201).json({
      success: true,
      message: "Pengajuan seller berhasil dikirim",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const result = await service.getApplications();
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.approve(id);

    res.status(200).json({
      success: true,
      message: "Pengajuan seller disetujui",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Validate reason if necessary
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan (reason) wajib diisi"
      });
    }

    const result = await service.reject(id, reason);

    res.status(200).json({
      success: true,
      message: "Pengajuan seller ditolak",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  apply,
  getApplications,
  approve,
  reject
};
