const Order = require("../models/OrderModel");
const User = require("../models/UserModel");

exports.placeOrder = async (req, res) => {
    try {
        const newOrder = new Order({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });

        await newOrder.save();

        await User.findByIdAndUpdate(req.body.userId, { cartData: {} });

        res.json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id,  
        });
    } catch (error) {
        console.error("Error placing the order:", error.message);
        res.status(500).json({
            success: false,
            message: "Error placing the order",
        });
    }
};

exports.verifyOrder = async (req, res) => {
    const { success, orderId } = req.body;
    if (!success || !orderId) {
        return res.status(400).json({ success: false, message: "Missing parameters." });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        if (order.status === "completed" || order.status === "verified") {
            return res.status(400).json({ success: false, message: "Order already verified." });
        }

        return res.json({ success: true, message: "Order verification successful." });
        
    } catch (error) {
        console.error("Error verifying the order:", error.message);
        return res.status(500).json({ success: false, message: "Error verifying the order." });
    }
}