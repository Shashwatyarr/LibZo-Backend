const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const clubCtrl = require("../controllers/club_contorllers");

const {
  isMember,
  hasRoles,
  notBanned,
} = require("../middleware/club.middleware");

// ===== EXISTING CONTROLLER FUNCTIONS ONLY =====

// Create club
router.post("/", auth, clubCtrl.createClub);

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

// Single club detail
router.get("/:clubId", auth, clubCtrl.getSingleClub);

module.exports = router;
