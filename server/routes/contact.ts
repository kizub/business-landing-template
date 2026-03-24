import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, contact, message } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ message: "Name and contact are required" });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      await axios.post(webhookUrl, {
        name,
        contact,
        message,
        source: "Website Contact Form",
        timestamp: new Date().toISOString()
      });
      console.log("Data sent to Make.com webhook successfully");
    } catch (error) {
      console.error("Error sending data to Make.com webhook:", error);
      // We don't fail the request to the user if the webhook fails, 
      // but we log it.
    }
  } else {
    console.warn("MAKE_WEBHOOK_URL is not defined in environment variables");
  }

  // In a real app, you might also save this to the database
  res.json({ message: "Заявка отримана! Я зв'яжуся з вами найближчим часом." });
});

export default router;
