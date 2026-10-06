const fs = require('fs');
const path = require('path');

const correctFooter = `  <footer class="site-footer">
    <div class="footer-main">
      <div class="footer-seal-container">
        <svg class="footer-seal" aria-hidden="true"><use href="assets/icons/sprite.svg#icon-rajmudra"></use></svg>
      </div>
      <div class="footer-center">
        <h3 class="deva" style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.8rem); color: var(--antique-gold); margin-bottom: 0.5rem; line-height: 1.1;">छत्रपती शिवाजी महाराज</h3>
        <p class="footer-subtitle" style="font-family: var(--font-ui); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--parchment-ivory); opacity: 0.8; margin-bottom: 0.5rem;">FOUNDER OF HINDAVI SWARAJYA · 1630 – 1680</p>
        <p class="deva-body" style="font-size: 0.9rem; opacity: 0.7; max-width: 400px; margin: 0 auto; color: var(--parchment-ivory);">
          प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते ।
        </p>
      </div>
      <div class="footer-reflection">
        <p class="lang-en">"Praised by Friends and Respected by Foes — the standard of a truly great King."</p>
        <p class="lang-mr-text deva-body">"महाराजांनी केवळ राज्य केले नाही, तर त्यांनी एका राष्ट्राची अस्मिता जागवली, रयतेला सन्मानाने आणि ताठ मानेने जगण्याची शिकवण दिली."</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="footer-social">
        <a href="index.html"><span class="lang-en">The Life</span><span class="lang-mr-text deva">जीवन</span></a>
        <a href="legacy.html"><span class="lang-en">The Legacy</span><span class="lang-mr-text deva">वारसा</span></a>
        <a href="galleries.html"><span class="lang-en">Forts</span><span class="lang-mr-text deva">किल्ले</span></a>
        <a href="timeline.html"><span class="lang-en">Timeline</span><span class="lang-mr-text deva">कालपट</span></a>
        <a href="letters.html"><span class="lang-en">Sources</span><span class="lang-mr-text deva">साधने</span></a>
      </div>
      <div class="footer-quote">
        <span class="lang-en">✦ Praised by Friends and Respected by Foes ✦</span>
        <span class="lang-mr-text deva">✦ शत्रूनेही आदर करावा असे आदर्श राजे ✦</span>
      </div>
      <div class="footer-legal">
        <span>© 2026 Tribute.</span>
        <svg style="width:14px; height:14px; color:var(--antique-gold); vertical-align:middle; margin-left:5px;" aria-hidden="true">
          <use href="assets/icons/sprite.svg#icon-diamond"></use>
        </svg>
      </div>
    </div>
  </footer>`;

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

let updated = 0;
for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  // Regular expression to find the footer block
  const updatedContent = content.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, correctFooter);
  
  if (content !== updatedContent) {
    fs.writeFileSync(path.join(dir, file), updatedContent);
    console.log('Updated', file);
    updated++;
  }
}
console.log('Total files updated:', updated);
