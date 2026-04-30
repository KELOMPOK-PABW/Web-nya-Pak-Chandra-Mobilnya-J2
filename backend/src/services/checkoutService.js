const prisma = require("../config/database")
const checkoutRepository = require("../repository/checkoutRepository")

const checkout = async({cart_id, address_id, payment_method}) => {
    const cart = await checkoutRepository.findCartById(cart_id)

    if (!cart){
        throw new Error("cart tidak ditemukan")
    }
    if (cart.status !== "active"){
        throw new Error("cart inactive ga bisa di checkout")
    }
    if (!cart.items || cart.items.length === 0){
        throw new Error("cart kosong, ga bisa checkout")
    }
    
    const address = await checkoutRepository.findAddressById(address_id)

    if (!address){
        throw new Error("address tidak ditemukan")
    }

    if (address.userId !== cart.userId){
        throw new Error("address ga sesuai user pemilik cart")
    }
    
    let totalAmount = 0

    for (const item of cart.items) {
        if (!item.product){
            throw new Error(`Produk dengan id ${item.productId} tidak ditemukan`);
        }

        if (!item.product){
            throw new Error(`Produk dengan id ${item.productId} tidak ditemukan`);
        }

        if (item.quantity > item.product.stock) {
            throw new Error(
                `Stock produk ${item.product.name} tidak cukup. Stock tersedia: ${item.product.stock}`
            );
        }

        totalAmount += item.product.price * item.quantity;
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await checkoutRepository.createOrder(tx, {
      buyerId: cart.userId,
      cartId: cart.id,
      addressId: address_id,
      totalAmount,
      paymentStatus: "pending",
    });

    const orderItemsPayload = cart.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      sellerId: item.product.sellerId,
      productNameSnap: item.product.name,
      priceSnap: item.product.price,
      qty: item.quantity,
      subtotal: item.product.price * item.quantity,
      status: "menunggu_penjual",
    }));

    await checkoutRepository.createManyOrderItems(tx, orderItemsPayload);

    await checkoutRepository.createOrderStatusHistory(tx, {
      orderId: order.id,
      status: "menunggu_penjual",
      updatedBy: cart.userId,
    });

    for (const item of cart.items) {
      const newStock = item.product.stock - item.quantity;

      await checkoutRepository.updateProductStock(
        tx,
        item.productId,
        newStock,
        newStock === 0 ? "habis" : "tersedia"
      );
    }

    await checkoutRepository.updateCartToCheckedOut(tx, cart.id);

    await checkoutRepository.createPayment(tx, {
      orderId: order.id,
      method: payment_method,
      amount: totalAmount,
      status: "pending",
    });

        return order;
    });

    return {
        order_id: createdOrder.id,
        total_price: Number(createdOrder.totalAmount),
        status: createdOrder.paymentStatus,
    };

}

module.exports = {checkout}