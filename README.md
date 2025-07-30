# Hava Durumu Uygulaması

Link: https://statuesque-biscotti-6b9cea.netlify.app/

## Kullanılan AI
- Cursor (Auto)

## Kullanılan Teknolojiler
- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js
- Netlify (Netlify Functions / Serverless)
- Progressive Web App (PWA) teknolojileri
- OpenWeatherMap API (veya kullandığınız hava durumu API’si)

---

## Hava Durumu Uygulamasının İşleyişi

1. **Kullanıcı Uygulamayı Açıyor:**  
   Uygulama tarayıcıda veya ana ekrana eklenmiş PWA olarak başlatılır.

2. **Arayüz Yükleniyor:**  
   HTML, CSS ve JavaScript ile hazırlanmış kullanıcı arayüzü ekrana gelir. Şehir arama kutusu gösterilir.

3. **Kullanıcıdan Şehir Bilgisi Alınıyor:**  
   Kullanıcı, istediği şehri seçer veya arar.

4. **Hava Durumu Verisi İsteği:**  
   Kullanıcı şehir seçtiğinde, uygulama arka planda bir istek gönderir. Bu istek doğrudan hava durumu API’sine gitmez; önce Netlify Functions (Node.js ile yazılmış sunucusuz fonksiyon) devreye girer.

5. **Serverless Fonksiyonun Çalışması (Netlify Functions):**  
   Netlify Functions, gelen isteği alır ve hava durumu API’sine (ör. OpenWeatherMap) gerekli parametrelerle bir istek gönderir. API’den gelen veriyi alır ve istemciye geri gönderir. Bu yöntem, API anahtarını gizli tutmak ve güvenliği sağlamak için kullanılır.

6. **Verinin Kullanıcıya Sunulması:**  
   Alınan hava durumu verisi JavaScript ile işlenir. Sıcaklık, hava durumu, nem, rüzgar hızı gibi bilgiler ekranda gösterilir. Hava durumuna uygun simgeler ve arka planlar kullanılır.

7. **Ekstra Özellikler:**
   - Kullanıcı farklı şehirler arayabilir.
   - 5 günlük hava tahmini görüntülenebilir.
   - Uygulama, PWA olduğu için çevrimdışı da temel işlevlerini sürdürebilir.
   - Karanlık mod gibi arayüz özellikleri kullanılabilir.

---

## Harcanan Zaman
- 30 dakika: Genel uygulama mantığı
- 120 dakika: Netlify server entegrasyonu
- 150 dakika: Uygulamanın tasarımı ve responsive tasarım
- **Toplam:** 300 dakika (5 saat)

