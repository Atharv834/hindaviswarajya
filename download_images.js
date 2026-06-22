const fs = require('fs');
const https = require('https');
const path = require('path');

const imgDir = path.join(__dirname, 'assets', 'img');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

const images = [
    'hero-raigad.jpg', 'prologue-raigad-sunset.jpg', 'shivneri-fort.jpg', 'torna-fort.jpg',
    'torna-sketch.jpg', 'rajgad-fort.jpg', 'sinhagad-fort.jpg', 'maval-valleys.jpg',
    'pratapgad-fort.jpg', 'lal-mahal.jpg', 'purandar-fort.jpg', 'raigad-coronation.jpg',
    'coronation-seat.jpg', 'coronation-seal.jpg', 'gold-hon-coin.jpg', 'ashtapradhan-illustration.jpg',
    'warship.jpg', 'shivaji-statue.jpg', 'raigad-unesco.jpg', 'royal-letter-modi.jpg',
    'shivrai-coin.jpg', 'fort-raigad-gallery.jpg', 'fort-pratapgad-gallery.jpg',
    'fort-sinhagad-gallery.jpg', 'fort-panhala-gallery.jpg', 'fort-shivneri-gallery.jpg',
    'fort-sindhudurg-gallery.jpg', 'gallery-portrait-01.jpg', 'gallery-portrait-02.jpg',
    'gallery-portrait-03.jpg', 'gallery-portrait-04.jpg', 'gallery-portrait-05.jpg',
    'gallery-portrait-06.jpg', 'gateway-sketch.jpg', 'map-sketch.jpg',
    'gallery-1.jpg', 'gallery-2.jpg', 'gallery-3.jpg', 'gallery-4.jpg', 
    'gallery-5.jpg', 'gallery-6.jpg', 'gallery-7.jpg', 'gallery-8.jpg',
    'raigad-thumb.jpg', 'pratapgad-thumb.jpg', 'sindhudurg-thumb.jpg',
    'shivneri-thumb.jpg', 'panhala-thumb.jpg', 'sinhagad-thumb.jpg'
];

console.log(`Starting to download ${images.length} placeholder images...`);

let completed = 0;

images.forEach((img, index) => {
    const filePath = path.join(imgDir, img);
    if (!fs.existsSync(filePath)) {
        const url = `https://picsum.photos/seed/${index + 100}/1200/800`;
        const file = fs.createWriteStream(filePath);
        
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                https.get(res.headers.location, (res2) => {
                    res2.pipe(file);
                    res2.on('end', () => {
                        completed++;
                        if (completed === images.length) console.log('All images downloaded!');
                    });
                });
            } else {
                res.pipe(file);
                res.on('end', () => {
                    completed++;
                    if (completed === images.length) console.log('All images downloaded!');
                });
            }
        }).on('error', (err) => {
            console.error(`Error downloading ${img}:`, err);
            completed++;
        });
    } else {
        completed++;
        if (completed === images.length) console.log('All images downloaded (some already existed)!');
    }
});
