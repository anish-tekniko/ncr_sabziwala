const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateCategory = catchAsync(async (req, res) => {
    let id = req.params.id
    let { name, cat_id, type, serviceId } = req.body

    let category = await Category.findOne({ _id: id });

    let imageNew = category.image;
    if (req.files && req.files.image && req.files.image.length > 0) {
        // Delete the old primary image if available.
        // if (category.image) {
        //     // await deleteOldFiles(category.image);
        // }
        imageNew = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
    }

    category.name = name || category.name;
    category.type = type || category.type;
    category.serviceId = serviceId || category.serviceId;
    category.image = imageNew;
    if (cat_id) category.cat_id = cat_id;

    await category.save()

    return res.status(200).json({
        status: true,
        message: "Category updated successfully.",
        data: { category },
    });

})