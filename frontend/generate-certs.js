const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
}

try {
  console.log('Generating self-signed certificates for HTTPS development...');
  
  // Generate private key and certificate
  const commands = [
    `openssl req -x509 -newkey rsa:4096 -keyout ${certsDir}/key.pem -out ${certsDir}/cert.pem -days 365 -nodes -subj "/C=IN/ST=State/L=City/O=Organization/OU=OrgUnit/CN=localhost"`,
  ];
  
  commands.forEach(command => {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  });
  
  console.log('\n✅ Certificates generated successfully!');
  console.log('📄 Files created:');
  console.log(`   - ${certsDir}/key.pem (private key)`);
  console.log(`   - ${certsDir}/cert.pem (certificate)`);
  console.log('\n🚀 You can now run "npm run dev:https" to start the HTTPS server.');
  console.log('🔒 Camera will work on network devices via https://localhost:3443');
  console.log('\n⚠️  Note: You may need to accept the self-signed certificate warning in your browser.');
  
} catch (error) {
  console.error('❌ Error generating certificates:');
  console.error(error.message);
  console.log('\n💡 Alternative solutions:');
  console.log('1. Install OpenSSL if not available');
  console.log('2. Use mkcert for trusted certificates: https://github.com/FiloSottile/mkcert');
  console.log('3. Deploy to a hosting service with HTTPS');
  console.log('4. Use ngrok to create HTTPS tunnel: https://ngrok.com');
}