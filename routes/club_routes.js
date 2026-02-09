const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const clubCtrl = require("../controllers/club_contorllers");
const upload = require("../middleware/upload_memory");
const getImageCached = require("../utils/cache_proxy");
const {
  isMember,
  hasRoles,
  notBanned,
} = require("../middleware/club.middleware");

// ===== EXISTING CONTROLLER FUNCTIONS ONLY =====

// Create club
router.post("/", auth, upload.array("cover", 1), clubCtrl.createClub);

// Get clubs dashboard
router.get("/", auth, clubCtrl.getClubsForUser);

// Join club
router.post("/:clubId/join", auth, clubCtrl.joinClub);

// Approve / Reject request
router.patch(
  "/:clubId/request/:requestId",
  auth,
  isMember,
  hasRoles("admin", "moderator"),
  clubCtrl.handleRequest,
);
router.get(
  "/:clubId/requests",
  auth,
  isMember,
  hasRoles("admin", "moderator"),
  clubCtrl.getRequests,
);
router.get("/cover/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const data = await getImageCached(fileId);

    res.set("Content-Type", data.mime);

    res.send(data.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Single club detail
router.get("/:clubId", auth, clubCtrl.getSingleClub);

module.exports = router;
