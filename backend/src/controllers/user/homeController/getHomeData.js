const { default: mongoose } = require("mongoose");
const banner = require("../../../models/banner");
const Category = require("../../../models/category");
const Explore = require("../../../models/explore");
const Setting = require("../../../models/settings");
const User = require("../../../models/user");
const { calculateOffer } = require("../../../utils/calculateOffer");
const catchAsync = require("../../../utils/catchAsync");
const getDistanceAndTime = require("../../../utils/getDistanceAndTime");
const findNearbyShops = require("../../../utils/findNearbyShops");
const { FOOD_SERVICE_ID } = require("../../../utils/constants");


const formatProduct = async (prod, userCoords, apiKey) => {
    const shopCoords = {
        lat: parseFloat(prod.shopId?.lat || 0),
        long: parseFloat(prod.shopId?.long || 0),
    };

    const { distance, time } = await getDistanceAndTime(userCoords, shopCoords, apiKey);

    return {
        _id: prod._id,
        shopId: prod.shopId?._id,
        vendorId: prod.vendorId,
        shopName: prod.shopId?.name || "",
        primary_image: prod.primary_image,
        shortDescription: prod.shortDescription,
        price: prod.vendorSellingPrice,
        mrp: prod.mrp,
        offer: calculateOffer(prod.mrp, prod.vendorSellingPrice),
        distance,
        time
    };
};

exports.getHomeData = catchAsync(async (req, res) => {
    const serviceId = FOOD_SERVICE_ID; // food
    if (!serviceId) return res.status(400).json({ success: false, message: "Service ID is required" });

    const setting = await Setting.findById("680f1081aeb857eee4d456ab");
    const apiKey = setting?.googleMapApiKey || "working";

    const user = await User.findById(req.user._id);
    const userCoords = {
        lat: parseFloat(user.lat || 0),
        long: parseFloat(user.long || 0),
    };

    const typeFilter = user.userType === "veg" ? { type: "veg" } : {};

    const shopTypeFilter = user.userType === "veg"
        ? { shopType: { $in: ["veg", "both"] } }
        : {};

    const nearbyShops = await findNearbyShops(userCoords, serviceId, 20, shopTypeFilter);
    const shopIdsInRadius = nearbyShops.map(shop => shop._id);

    // ✅ STEP 2: Common product query with radius shop filter
    const commonQuery = {
        status: "active",
        serviceId,
        ...typeFilter,
        shopId: { $in: shopIdsInRadius }
    };

    // ✅ STEP 3: Fetch home data
    const [banners, categories, explore, recommendedRaw, featuredRaw] = await Promise.all([
        banner.find({ serviceId }).select("image").sort({ createdAt: -1 }),
        Category.find({ cat_id: null, serviceId, ...typeFilter }).select("name image").limit(8).sort({ createdAt: -1 }),
        Explore.find({ serviceId }).select("name icon"),
        VendorProduct.find({ ...commonQuery, isRecommended: true }).limit(10).populate("shopId", "name lat long"),
        VendorProduct.find({ ...commonQuery, isFeatured: true }).limit(10).populate("shopId", "name lat long"),
    ]);

    // ✅ STEP 4: Format products with distance/time
    const recommendedProducts = await Promise.all(
        recommendedRaw.map(p => formatProduct(p, userCoords, apiKey))
    );

    const featuredProducts = await Promise.all(
        featuredRaw.map(p => formatProduct(p, userCoords, apiKey))
    );

    res.status(200).json({
        success: true,
        message: "Home data fetched successfully",
        data: {
            banners,
            categories,
            explore,
            recommendedProducts,
            featuredProducts,
        },
    });
});



// -----------------------------------------------------
// Get home data without location ( Old code )
// -----------------------------------------------------
// const formatProduct = async (prod, userCoords, apiKey) => {
//     const shopCoords = {
//         lat: parseFloat(prod.shopId?.lat || 0),
//         long: parseFloat(prod.shopId?.long || 0),
//     };

//     const { distance, time } = await getDistanceAndTime(userCoords, shopCoords, apiKey);

//     return {
//         _id: prod._id,
//         shopId: prod.shopId?._id,
//         vendorId: prod.vendorId,
//         shopName: prod.shopId?.name || "",
//         primary_image: prod.primary_image,
//         shortDescription: prod.shortDescription,
//         price: prod.vendorSellingPrice,
//         mrp: prod.mrp,
//         offer: calculateOffer(prod.mrp, prod.vendorSellingPrice),
//         distance,
//         time
//     };
// };

// exports.getHomeData = catchAsync(async (req, res) => {

//     const serviceId = req.query.serviceId || "67ecc79120a93fc0b92a8b19";
//     if (!serviceId) return res.status(400).json({ success: false, message: "Service ID is required" });

//     const setting = await Setting.findById("680f1081aeb857eee4d456ab");
//     const apiKey = setting?.googleMapApiKey || "working";

//     const user = await User.findById(req.user._id);
//     const userCoords = {
//         lat: parseFloat(user.lat || 0),
//         long: parseFloat(user.long || 0),
//     };
//     const typeFilter = user.userType == "veg" ? { type: "veg" } : {};
//     const commonQuery = { status: "active", serviceId, ...typeFilter };

//     const [banners, categories, explore, recommendedRaw, featuredRaw] = await Promise.all([
//         banner.find({ serviceId }).select("image").sort({ createdAt: -1 }),
//         Category.find({ cat_id: null, serviceId, ...typeFilter }).select("name image").limit(8).sort({ createdAt: -1 }),
//         Explore.find({ serviceId }).select("name icon"),
//         VendorProduct.find({ ...commonQuery, isRecommended: true }).limit(10).populate("shopId", "name lat long"),
//         VendorProduct.find({ ...commonQuery, isFeatured: true }).limit(10).populate("shopId", "name lat long"),
//     ]);

//     const recommendedProducts = await Promise.all(
//         recommendedRaw.map(p => formatProduct(p, userCoords, apiKey))
//     );

//     const featuredProducts = await Promise.all(
//         featuredRaw.map(p => formatProduct(p, userCoords, apiKey))
//     );

//     res.status(200).json({
//         success: true,
//         message: "Home data fetched successfully",
//         data: {
//             banners,
//             categories,
//             explore,
//             recommendedProducts,
//             featuredProducts,
//         },
//     });
// });
