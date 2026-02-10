/**
 * Generates a WhatsApp share message for office spaces
 * @param {Object} office - Office object with details
 * @returns {string} - Formatted WhatsApp URL
 */
export const generateWhatsAppShareUrl = (office) => {
  const message = `Check out this amazing office space at CoHopers!\n\n${office.title}\nPrice: ${office.price}\n\nFeatures:\n${office.features.join('\n')}\n\nVisit: https://co-hopers.vercel.app/services`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  return whatsappUrl;
};

/**
 * Opens WhatsApp share dialog
 * @param {Object} office - Office object to share
 */
export const shareToWhatsApp = (office) => {
  const url = generateWhatsAppShareUrl(office);
  window.open(url, '_blank');
};

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

/**
 * Generates a shareable link for an office
 * @param {Object} office - Office object
 * @returns {string} - Shareable link
 */
export const generateShareableLink = (office) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/services?office=${office.id}`;
};

const shareUtils = {
  generateWhatsAppShareUrl,
  shareToWhatsApp,
  copyToClipboard,
  generateShareableLink,
};

export default shareUtils;
