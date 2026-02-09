const Club = require("../models/CommunityModel/ClubSchema");
const ClubMember = require("../models/CommunityModel/ClubMemberSchema");
const ClubRequest = require("../models/CommunityModel/ClubRequestSchema");
const { uploadImageToTelegram } = require("../utils/telegram_media");

// ================= CREATE CLUB =================

exports.createClub = async (req, res) => {
  try {
    const { name, description, genre, type } = req.body;

    let coverImage = null;

    if (req.files && req.files.length > 0) {
      const file = req.files[0];

      const tgResult = await uploadImageToTelegram(file);

      coverImage = {
        file_id: tgResult.file_id,
        width: tgResult.width,
        height: tgResult.height,
        size: tgResult.size,
      };
    }

    const club = await Club.create({
      name,
      description,
      genre,
      type,
      coverImage,
      createdBy: req.user.id,
    });

    await ClubMember.create({
      clubId: club._id,
      userID: req.user.id,
      role: "admin",
    });

    club.stats.members = 1;
    await club.save();

    res.status(201).json({
      success: true,
      club,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= JOIN CLUB =================

exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    const member = await ClubMember.findOne({
      clubId,
      userID: req.user.id,
    });

    if (member) {
      return res.status(400).json({
        message: "You are already a member",
      });
    }

    // ===== PUBLIC CLUB =====
    if (club.type === "public") {
      await ClubMember.create({
        clubId: clubId,
        userID: req.user.id,
        role: "member",
      });

      await Club.findByIdAndUpdate(clubId, {
        $inc: { "stats.members": 1 },
      });

      return res.json({
        message: "Joined Successfully",
      });
    }

    // ===== PRIVATE CLUB =====
    await ClubRequest.create({
      clubId: clubId,
      userId: req.user.id,
      status: "pending",
    });

    res.json({
      message: "Join request sent",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= HANDLE REQUEST =================

exports.handleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body;

    const request = await ClubRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (action === "approve") {
      await ClubMember.create({
        clubId: request.clubId,
        userID: request.userId,
        role: "member",
      });

      await Club.findByIdAndUpdate(request.clubId, {
        $inc: { "stats.members": 1 },
      });

      request.status = "approved";
    } else {
      request.status = "rejected";
    }

    request.actionBY = req.user.id;
    request.actionAt = new Date();

    await request.save();

    res.json({
      message: `Request ${action} successfully`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET CLUBS =================

exports.getClubsForUser = async (req, res) => {
  try {
    const publicClubs = await Club.find({});

    const myMemberships = await ClubMember.find({
      userID: req.user.id,
    }).populate("clubId");

    const requests = await ClubRequest.find({
      userId: req.user.id,
      status: "pending",
    }).populate("clubId");

    res.json({
      publicClubs,
      myMemberships,
      requests,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= SINGLE CLUB =================

exports.getSingleClub = async (req, res) => {
  try {
    const { clubId } = req.params;

    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    const member = await ClubMember.findOne({
      clubId,
      userID: req.user.id,
    });

    const request = await ClubRequest.findOne({
      clubId,
      userId: req.user.id,
      status: "pending",
    });

    let relation = "not_joined";

    if (member) relation = "member";
    else if (request) relation = "requested";

    res.json({
      club,
      relation,
      myRole: member ? member.role : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET REQUESTS =================

exports.getRequests = async (req, res) => {
  try {
    const { clubId } = req.params;

    const requests = await ClubRequest.find({
      clubId,
      status: "pending",
    })
      .populate("userId", "fullName username profile.profileImage")
      .sort({ requestedAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
