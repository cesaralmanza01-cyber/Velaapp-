/**
 * Helper to safely open WhatsApp links inside and outside of iframes
 */
export function openWhatsApp(
  phone: string = '573011417555',
  messageText: string = 'Hola, necesito agendar mi valoración médica inicial para continuar en Vela.'
) {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  const encodedText = encodeURIComponent(messageText);
  const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  try {
    const newTab = window.open(url, '_blank', 'noopener,noreferrer');
    // If browser/iframe sandbox blocks popup, fallback to redirect
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      window.location.href = url;
    }
  } catch (err) {
    console.warn('window.open blocked, falling back to window.location.href', err);
    window.location.href = url;
  }
}
