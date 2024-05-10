const router = require("express").Router();

const { sendEmailOnContactUs } = require("../services/emailService");

router.post("/", async (req, res, next) => {
  const { senderEmail, senderName, senderMessage } = req.body;

  try {
    if (senderEmail && senderName && senderMessage) {
      await sendEmailOnContactUs(senderEmail, senderName, senderMessage);
      res.sendStatus(200);
    } else {
      res
        .status(400)
        .send({ error: "Missing senderEmail, senderName, or senderMessage" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
