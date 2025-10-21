import crypto from 'crypto';

// Suvarna start
// Generate random token for email verification
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate device fingerprint from request
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  return crypto
  .createHash('sha256')
  .update(userAgent + ip)
  .digest('hex');
};
// Suvarna end

// Varun start
//* Shuffle array for question randomization
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i-=1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
// Varun end

// Napa start
// Calculate percentage
const calculatePercentage = (scored, total) => {
  if (total === 0) return 0;
  return ((scored / total) * 100).toFixed(2);
};

// Format date to readable string
const formatDate = (date) => {
  return new Date(date).toLocaleString();
};
// Napa end

// Modules to export
export {
  generateVerificationToken,
  generateDeviceFingerprint,
  shuffleArray,
  calculatePercentage,
  formatDate,
};
