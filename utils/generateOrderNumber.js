/**
 * Generates a unique, human-readable order number.
 * Format: ORD-{timestamp}-{random3digit}
 * Example: ORD-1707556201923-482
 * 
 * @returns {string} The generated order number
 */
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 900) + 100; // Generates 100-999
    return `ORD-${timestamp}-${random}`;
};

module.exports = generateOrderNumber;
