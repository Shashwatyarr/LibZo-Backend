const axios = require("axios");
const FormData = require("form-data");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_STORAGE_CHANNEL;

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
function getMimeType(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
/**
 * Upload image to Telegram private channel
 * @param {Object} file - multer memory file object
 * @returns {Object} { file_id, width, height, size }
 */
exports.uploadImageToTelegram = async (file) => {
  console.log("Sending to Telegram...");
  console.log("CHANNEL_ID:", CHANNEL_ID);
  const form = new FormData();
  form.append("chat_id", CHANNEL_ID);
  form.append("photo", file.buffer, {
    filename: file.originalname,
    contentType: getMimeType(file.originalname),
  });

  const response = await axios.post(`${TG_API}/sendPhoto`, form, {
    headers: form.getHeaders(),
  });

  if (!response.data.ok) {
    throw new Error("sendPhoto failed");
  }

  const photos = response.data.result.photo;
  const best = photos[photos.length - 1];

  if (!best?.file_id) {
    throw new Error("file_id not found");
  }

  const pathRes = await axios.get(`${TG_API}/getFile?file_id=${best.file_id}`);

  if (!pathRes.data.ok) {
    throw new Error("getFile failed");
  }

  const filePath = pathRes.data.result.file_path;

  if (!filePath) {
    throw new Error("file_path not found");
  }

  const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

  return {
    file_id: best.file_id,
    url: imageUrl,
    width: best.width,
    height: best.height,
    size: file.size,
  };
};

exports.fetchFromTelegram = async (fileId) => {
  const pathRes = await axios.get(`${TG_API}/getFile?file_id=${fileId}`);

  const filePath = pathRes.data.result.file_path;
  const fileRes = await axios.get(
    `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`,
    { responseType: "arraybuffer" },
  );
  console.log("GETFILE RESPONSE:", pathRes.data);
  return fileRes.data;
};
