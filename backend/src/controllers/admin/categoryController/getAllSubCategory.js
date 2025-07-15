const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllSubCategory = catchAsync(async (req, res) => {

    const { categoryId } = req.query

    let filter = {}

    if (categoryId) {
        filter = { cat_id: categoryId }
    } else {
        filter = { cat_id: { $ne: null } }
    }

    const allSubCategory = await Category.find(filter).populate("cat_id", "name type");

    return res.status(200).json({
        status: true,
        results: allSubCategory.length,
        data: allSubCategory
    })

})