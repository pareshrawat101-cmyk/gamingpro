/* =====================================================
   ProGamer Bundle — Payment Page JavaScript
   EmailJS Integration
   ===================================================== */

// ---- EmailJS Credentials ----
const EMAILJS_PUBLIC_KEY  = 'o7LVVDuzlx3KGYtpm';
const EMAILJS_SERVICE_ID  = 'service_dp5zyfr';
const EMAILJS_TEMPLATE_ID = 'template_p6tm18q';

// ---- Initialize EmailJS ----
(function () {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
})();

// ---- Utility: format current date-time ----
function getCurrentDateTime() {
  const now = new Date();
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  };
  return now.toLocaleString('en-IN', options);
}

// ---- Utility: generate order ID ----
function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ---- Validation helpers ----
function showError(fieldId, errorId, show) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field || !error) return;
  if (show) {
    field.classList.add('error');
    error.classList.add('visible');
  } else {
    field.classList.remove('error');
    error.classList.remove('visible');
  }
}

function validateForm() {
  let valid = true;

  // Name
  const name = document.getElementById('name').value.trim();
  if (!name || name.length < 2) {
    showError('name', 'name-error', true);
    valid = false;
  } else {
    showError('name', 'name-error', false);
  }

  // Email
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showError('email', 'email-error', true);
    valid = false;
  } else {
    showError('email', 'email-error', false);
  }

  // Address
  const address = document.getElementById('address').value.trim();
  if (!address || address.length < 10) {
    showError('address', 'address-error', true);
    valid = false;
  } else {
    showError('address', 'address-error', false);
  }

  // Pincode
  const pincode = document.getElementById('pincode').value.trim();
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    showError('pincode', 'pincode-error', true);
    valid = false;
  } else {
    showError('pincode', 'pincode-error', false);
  }

  // UTR
  const utr = document.getElementById('utr').value.trim();
  if (!utr || utr.length < 6) {
    showError('utr', 'utr-error', true);
    valid = false;
  } else {
    showError('utr', 'utr-error', false);
  }

  return valid;
}

// ---- Real-time validation on blur ----
['name', 'email', 'address', 'pincode', 'utr'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('blur', () => {
      validateForm(); // revalidate on blur
    });
    el.addEventListener('input', () => {
      // Remove error styling as user types
      el.classList.remove('error');
      const errEl = document.getElementById(id + '-error');
      if (errEl) errEl.classList.remove('visible');
    });
  }
});

// ---- Pincode: numbers only ----
const pincodeEl = document.getElementById('pincode');
if (pincodeEl) {
  pincodeEl.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 6);
  });
}

// ---- Form Submit Handler ----
const paymentForm = document.getElementById('payment-form');
if (paymentForm) {
  paymentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Auto-fill time
    const timeEl = document.getElementById('time');
    if (timeEl) timeEl.value = getCurrentDateTime();

    // Validate
    if (!validateForm()) {
      // Scroll to first error
      const firstError = paymentForm.querySelector('.form-input.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Gather form data
    const formData = {
      name:    document.getElementById('name').value.trim(),
      email:   document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      pincode: document.getElementById('pincode').value.trim(),
      utr:     document.getElementById('utr').value.trim(),
      amount:  document.getElementById('amount').value.trim(),
      message: document.getElementById('message').value.trim() || 'No additional message',
      time:    document.getElementById('time').value,
    };

    // Update submit button to loading state
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      // Send email via EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formData
      );

      if (response.status === 200) {
        // Show success modal
        const orderId = generateOrderId();
        const orderIdEl = document.getElementById('order-id-value');
        if (orderIdEl) orderIdEl.textContent = orderId;

        const modal = document.getElementById('success-modal');
        if (modal) {
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';
        }

        // Reset form
        paymentForm.reset();
        document.getElementById('amount').value = '599';
      } else {
        throw new Error('EmailJS returned non-200 status: ' + response.status);
      }
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert(
        'There was an error sending your order details. Please try again or contact us at mggamergamersss@gmail.com\n\nError: ' +
        (err.text || err.message || 'Unknown error')
      );
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
}

// ---- Success Modal Close ----
function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  // Redirect to home after closing
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 300);
}

// Close modal on backdrop click
const successBackdrop = document.querySelector('.success-modal-backdrop');
if (successBackdrop) {
  successBackdrop.addEventListener('click', closeSuccessModal);
}

// Close on Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('success-modal');
    if (modal && modal.classList.contains('open')) {
      closeSuccessModal();
    }
  }
});

// Make closeSuccessModal globally available
window.closeSuccessModal = closeSuccessModal;

// ---- Auto-fill time on page load (hidden field) ----
window.addEventListener('DOMContentLoaded', () => {
  const timeEl = document.getElementById('time');
  if (timeEl) timeEl.value = getCurrentDateTime();

  // Ensure amount is always 599
  const amountEl = document.getElementById('amount');
  if (amountEl) amountEl.value = '599';

  // Robust QR Code Download Handler
  const downloadBtn = document.getElementById('qr-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function (e) {
      e.preventDefault();
      fetch('payment_qr.jpeg')
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then(blob => {
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'ProGamer_Bundle_QR.jpeg';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
          console.error('Failed to download image via fetch, falling back to direct link:', error);
          const fallbackLink = document.createElement('a');
          fallbackLink.href = 'payment_qr.jpeg';
          fallbackLink.download = 'ProGamer_Bundle_QR.jpeg';
          fallbackLink.target = '_blank';
          document.body.appendChild(fallbackLink);
          fallbackLink.click();
          document.body.removeChild(fallbackLink);
        });
    });
  }
});
