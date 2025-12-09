const axios = require('axios');

// قراءة مفاتيح Telegram من متغيرات البيئة
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const data = JSON.parse(event.body);
        const base64Image = data.imageData;

        if (!base64Image) {
            return { statusCode: 400, body: 'Image data missing' };
        }

        // إرسال الصورة مباشرة إلى Telegram
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

        const response = await axios.post(telegramUrl, {
            chat_id: CHAT_ID,
            // Telegram تستقبل Base64 مباشرة مع تعديل بسيط
            photo: base64Image,
            caption: `صورة ملتقطة جديدة في: ${new Date().toISOString()}`
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Image sent successfully to Telegram!",
                telegram_status: response.data
            })
        };
    } catch (error) {
        console.error('Error sending image to Telegram:', error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send image via Telegram.' })
        };
    }
};

