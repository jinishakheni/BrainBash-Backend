const router = require("express").Router();

const {sendEmailOnContactUs} = require("../services/emailService");

router.post("/", async (req, res, next) => {
  const { senderName, senderMessage } = req.body;

  try {
    if (senderName && senderMessage) {
      await sendEmailOnContactUs(senderName, senderMessage);
      res.sendStatus(200);
    } else {
      res.status;
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

