const puppeteer = require('puppeteer');
const fs = require('fs');

async function capturePreview() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    // Wait for server to be ready
    await page.goto('http://localhost:3000/buffalo-preview', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for content to load
    await page.waitForSelector('.min-h-screen', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Capture full page screenshot
    await page.screenshot({
      path: 'buffalo-preview-full.png',
      fullPage: true
    });
    
    // Capture hero section
    await page.screenshot({
      path: 'buffalo-preview-hero.png',
      clip: { x: 0, y: 0, width: 1200, height: 800 }
    });
    
    console.log('✅ Screenshots captured successfully!');
    console.log('📸 Files created:');
    console.log('   - buffalo-preview-full.png (full page)');
    console.log('   - buffalo-preview-hero.png (hero section)');
    
  } catch (error) {
    console.error('❌ Failed to capture preview:', error);
  }
  
  await browser.close();
}

// Check if server is running first
const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('🚀 Server is running, capturing preview...');
    capturePreview();
  } else {
    console.error('❌ Server returned status:', res.statusCode);
  }
});

req.on('error', (err) => {
  console.error('❌ Server is not running. Please start it first with: npm run dev');
  console.error('Error:', err.message);
});

req.on('timeout', () => {
  console.error('❌ Server connection timeout. Please check if Next.js is running.');
  req.destroy();
});

req.end();