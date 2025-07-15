const Category = require("../../../models/category");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllCategory = catchAsync(async (req, res, next) => {
    try {

        const userId = req.user._id;
        const serviceId = req.query.serviceId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userType = user.userType;
        const typeFilter = user.userType === "veg" ? { type: "veg" } : {}; // empty means no filter

        const categories = await Category.find({ cat_id: null, status: "active", serviceId, ...typeFilter }).select("name image");

        if (!categories || categories.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No categories found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });

    } catch (error) {
        console.error('Error in get category controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
})