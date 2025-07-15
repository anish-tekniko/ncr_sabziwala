const Product = require("../../../models/product");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllProductExplore = catchAsync(async (req, res) => {

    const allProductRaw = await Product.find().select("name primary_image").sort({ createdAt: -1 }).populate("vendorId", "name").populate("shopId", "name").sort({ createdAt: -1 })

    const allProduct = allProductRaw.map(product => {
        return {
            _id: product._id,
            name: product.name,
            primary_image: "primary",
            vendorName: product.vendorId ? product.vendorId.name : "N/A",
            shopName: product.shopId ? product.shopId.name : "N/A"
        }
    })

    return res.status(200).json({
        status: true,
        count: allProduct.length,
        data: allProduct
    })

})