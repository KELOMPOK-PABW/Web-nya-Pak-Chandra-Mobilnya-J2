const addressRepository = require("../repository/addressRepository");

const createAddress = async (userId, data) => {
  const newAddress = await addressRepository.createAddress({
    userId,
    address: data.address,
    city: data.city,
    postalCode: data.postal_code,
  });

  return formatAddressResponse(newAddress);
};

const getAddresses = async (userId) => {
  const addresses = await addressRepository.findAddressesByUserId(userId);
  return addresses.map(formatAddressResponse);
};

const getAddressById = async (userId, addressId) => {
  const address = await addressRepository.findAddressById(addressId);

  if (!address) {
    throw new Error("Alamat tidak ditemukan");
  }

  if (address.userId !== userId) {
    throw new Error("Akses ditolak");
  }

  return formatAddressResponse(address);
};

const updateAddress = async (userId, addressId, data) => {
  const address = await addressRepository.findAddressById(addressId);

  if (!address) {
    throw new Error("Alamat tidak ditemukan");
  }

  if (address.userId !== userId) {
    throw new Error("Akses ditolak");
  }

  const updatedAddress = await addressRepository.updateAddress(addressId, {
    address: data.address,
    city: data.city,
    postalCode: data.postal_code,
  });

  return formatAddressResponse(updatedAddress);
};

const deleteAddress = async (userId, addressId) => {
  const address = await addressRepository.findAddressById(addressId);

  if (!address) {
    throw new Error("Alamat tidak ditemukan");
  }

  if (address.userId !== userId) {
    throw new Error("Akses ditolak");
  }

  await addressRepository.deleteAddress(addressId);
};

const formatAddressResponse = (address) => {
  return {
    address_id: address.id,
    address: address.address,
    city: address.city,
    postal_code: address.postalCode,
  };
};

module.exports = {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
