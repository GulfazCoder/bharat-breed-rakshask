# 📱 Camera Setup Guide - Bharat Breed Rakshask

This guide helps you set up camera functionality for mobile devices and network access in the Bharat Breed Rakshask application.

## 🔧 **Quick Fix for Camera Issues**

### **Problem: Camera not working on mobile or network devices**
The camera requires HTTPS for security reasons when accessed from network devices or mobile browsers.

### **Solution: HTTPS Development Server**

1. **Generate HTTPS certificates:**
   ```bash
   cd frontend
   npm run generate-certs
   ```

2. **Start HTTPS development server:**
   ```bash
   npm run dev:https
   ```

3. **Access the application:**
   - **Local:** https://localhost:3443
   - **Network:** https://YOUR_IP_ADDRESS:3443

## 📋 **Step-by-Step Setup**

### **Step 1: Stop Current Server**
```bash
# If running, stop the current development server
# Press Ctrl+C in the terminal running npm run dev
```

### **Step 2: Install OpenSSL (if needed)**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install openssl

# macOS
brew install openssl

# Windows
# Download from: https://slproweb.com/products/Win32OpenSSL.html
```

### **Step 3: Generate Certificates**
```bash
cd frontend
npm run generate-certs
```

This creates:
- `frontend/certs/key.pem` (private key)
- `frontend/certs/cert.pem` (certificate)

### **Step 4: Start HTTPS Server**
```bash
npm run dev:https
```

You should see:
```
> Ready on https://localhost:3443
> HTTPS enabled for camera access on network devices
```

### **Step 5: Accept Certificate**
1. Open https://localhost:3443 in your browser
2. You'll see a security warning (normal for self-signed certificates)
3. Click "Advanced" → "Proceed to localhost (unsafe)"

### **Step 6: Test Camera**
1. Go to the classification page
2. Click "Take Photo"
3. Allow camera permissions when prompted

## 📱 **Mobile Device Setup**

### **For Mobile Users on Network:**

1. **Find your computer's IP address:**
   ```bash
   # Linux/macOS
   ip addr show | grep inet
   # or
   ifconfig | grep inet
   
   # Windows
   ipconfig
   ```

2. **Access from mobile:**
   - Open mobile browser
   - Navigate to: `https://YOUR_IP:3443`
   - Accept the security warning
   - Allow camera permissions

### **Mobile Browser Permissions:**

**Chrome Mobile:**
1. Tap the lock icon in address bar
2. Tap "Permissions"
3. Enable "Camera"

**Safari iOS:**
1. Settings → Safari → Camera
2. Select "Allow"

**Firefox Mobile:**
1. Tap menu (three dots)
2. Settings → Site Permissions
3. Camera → Allow

## 🧪 **Testing Camera**

### **Built-in Test Page:**
Visit: `http://localhost:3001/camera-test.html` or `https://localhost:3443/camera-test.html`

This page will:
- Check browser compatibility
- List available cameras
- Test different camera configurations
- Show detailed error messages

### **Manual Testing:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try: `navigator.mediaDevices.getUserMedia({video: true})`

## ⚠️ **Troubleshooting**

### **Common Issues:**

**1. "Camera permission denied"**
- **Solution:** Click "Allow" when prompted, or check browser settings

**2. "HTTPS required"**
- **Solution:** Use the HTTPS development server (npm run dev:https)

**3. "No camera found"**
- **Solution:** Ensure camera is connected and not used by other apps

**4. "Camera is busy"**
- **Solution:** Close other applications using the camera

**5. Certificate errors on mobile**
- **Solution:** Accept the self-signed certificate warning

### **Alternative Solutions:**

**1. Using mkcert (Trusted Certificates):**
```bash
# Install mkcert
brew install mkcert  # macOS
# or follow: https://github.com/FiloSottile/mkcert

# Create trusted certificates
mkcert -install
mkcert localhost YOUR_IP

# Use the generated certificates in server.js
```

**2. Using ngrok (Public HTTPS Tunnel):**
```bash
# Install ngrok: https://ngrok.com
npm run dev  # Start regular dev server
ngrok http 3001  # Create HTTPS tunnel
# Use the https://xxx.ngrok.io URL
```

**3. Cloud Deployment:**
Deploy to Vercel, Netlify, or similar service for automatic HTTPS.

## 📊 **Browser Support**

| Browser | Desktop | Mobile | Network HTTPS |
|---------|---------|--------|---------------|
| Chrome  | ✅      | ✅     | ✅            |
| Firefox | ✅      | ✅     | ✅            |
| Safari  | ✅      | ✅     | ✅            |
| Edge    | ✅      | ✅     | ✅            |

## 🚀 **Production Deployment**

For production, use a proper hosting service with HTTPS:

**Recommended Platforms:**
- **Vercel:** Automatic HTTPS, perfect for Next.js
- **Netlify:** Static hosting with HTTPS
- **AWS Amplify:** Full-stack hosting
- **Railway:** Simple deployment with HTTPS

## 🛡️ **Security Notes**

- Self-signed certificates are **only for development**
- Production should use valid SSL certificates
- Camera permissions are handled by the browser
- No video data is stored or transmitted by default

## 📞 **Support**

If you're still having camera issues:

1. **Check the camera test page:** `/camera-test.html`
2. **Review browser console** for error messages
3. **Ensure HTTPS** is being used for network access
4. **Try different browsers** to isolate the issue
5. **Use the upload feature** as an alternative

---

**Built with ❤️ by Team Codeyodhaa**

*Empowering Indian farmers with modern technology*