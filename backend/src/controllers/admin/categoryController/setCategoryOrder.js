const mongoose = require("mongoose");
const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");

exports.setCategoryOrder = catchAsync(async (req, res) => {
    const updates = req.body;

    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Invalid payload format. Expected an array.' });
    }

    let modifiedCount = 0;

    for (const { _id, sortOrder } of updates) {
        const result = await Category.findByIdAndUpdate(
            _id,
            { sortOrder },
            { new: false }
        );
        if (result) modifiedCount++;
    }

    return res.status(200).json({
        message: `Updated sortOrder for ${modifiedCount} categories.`,
    });
});
