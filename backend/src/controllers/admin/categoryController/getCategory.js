const Category = require("../../../models/category");
const catchAsync = require("../../../utils/catchAsync");

exports.getCategory = catchAsync(async (req, res) => {
    const allCategory = await Category.aggregate([
        {
            $match: { cat_id: null }  // only top-level categories
        },
        {
            $lookup: {
                from: "categories", // collection name (must be lowercase plural of model)
                localField: "_id",
                foreignField: "cat_id",
                as: "subcategories"
            }
        },
        {
            $addFields: {
                subcategoryCount: { $size: "$subcategories" }
            }
        },
        {
            $project: {
                subcategories: 0
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    return res.status(200).json({
        status: true,
        results: allCategory.length,
        data: allCategory
    });
});


// const Category = require("../../../models/category");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getCategory = catchAsync(async (req, res) => {

//     const allCategory = await Category.find({ cat_id: null }).sort({ createdAt: -1 });


//     return res.status(200).json({
//         status: true,
//         results: allCategory.length,
//         data: allCategory
//     })

// })
