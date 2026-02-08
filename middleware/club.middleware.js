const ClubMember = require("../models/CommunityModel/ClubMemberSchema");
const Ban = require("../models/CommunityModel/BanSystemSchema");

exports.isMember = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const member = await ClubMember.findOne({
      clubId: clubId,
      userId: req.user.id,
    });
    if (!member) {
      return res.status(403).json({
        message: "You are not member of this Club",
      });
    }
    req.member = member;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.isBanned = async (req, res, next) => {
  try {
    const ban = await Ban.findOne({
      clubId: req.params.clubId,
      userID: req.user.id,
      active: true,
      $or: [
        {
          type: "permanent",
        },
        { endDate: { $gt: new Date() } },
      ],
    });
    if (ban) {
      return res.status(403).json({
        message: "you are banned fomr this club",
        reason: ban.reason,
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hasRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.member) {
      return res.status(403).json({
        message: "Membership required",
      });
    }

    if (!roles.includes(req.member.role)) {
      return res.status(403).json({
        message: "Insufficient permission",
      });
    }
    next();
  };
};
