const prisma = require("../config/database")

const getAllUser = async(req,res) => {
    try {
    const users = await prisma.user.findMany();

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil semua data user",
      data: users,
    });
    } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: error.message,
    });
    }
}

module.exports = {getAllUser}