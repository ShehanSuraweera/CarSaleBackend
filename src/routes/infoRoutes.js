const express = require("express");
const router = express.Router();

const {
  getAllDistricts,
  getCitiesByDistrict,
  getAllCities,
  getVehicleTypes,
  getVehicleMakesByType,
  getModelsByMake,
} = require("../controllers/infoController");

router.get("/districts", getAllDistricts);
router.get("/cities/:district_id", getCitiesByDistrict);
router.get("/allcities", getAllCities);
router.get("/vehicle-types", getVehicleTypes);
router.get("/vehicle-makes/:vehicle_type_id", getVehicleMakesByType);
router.post("/vehicle-models", getModelsByMake);
module.exports = router;
