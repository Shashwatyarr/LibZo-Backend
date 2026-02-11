const axios = require("axios");
const FormData = require("form-data");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_STORAGE_CHANNEL;

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Upload image to Telegram private channel
 * @param {Object} file - multer memory file object
 * @returns {Object} { file_id, width, height, size }
 */
exports.uploadImageToTelegram = async (file) => {
  const form = new FormData();
  form.append("chat_id", CHANNEL_ID);
  form.append("photo", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype || "image/jpeg",
  });
  const response = await axios.post(`${TG_API}/sendPhoto`, form, {
    headers: form.getHeaders(),
  });
  const photos = response.data.result.photo;
  const best = photos.at(-1);
  return {
    file_id: best.file_id,
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

  return fileRes.data;
};
