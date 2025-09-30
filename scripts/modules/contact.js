/* ==========================================================================
   CONTACT MODULE
   - Contact form validation
   - Email domain validation
   - Form submission handling
   - FormSubmit.co integration
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);

// Helper function to show form messages
function showFormMessage(message, type) {
  const form = $('.contact-form');
  if (!form) return;
  
  let msgEl = form.querySelector('.form-message');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.className = 'form-message';
    form.insertBefore(msgEl, form.firstChild);
  }
  
  msgEl.textContent = message;
  msgEl.className = `form-message ${type}`;
  msgEl.style.cssText = `
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 8px;
    font-weight: 600;
    ${type === 'error' ? 'background: rgba(255,68,68,0.1); color: #ff4444; border: 1px solid #ff4444;' : ''}
    ${type === 'success' ? 'background: rgba(0,255,157,0.1); color: #00ff9d; border: 1px solid #00ff9d;' : ''}
  `;
  
  setTimeout(() => {
    if (msgEl && msgEl.parentNode) {
      msgEl.style.opacity = '0';
      setTimeout(() => msgEl.remove(), 300);
    }
  }, 5000);
}

// Main contact form initialization - eksport do window
window.initContactForm = function() {
  console.log('đź"§ Inicjalizacja formularza kontaktowego...');
  
  const form = document.querySelector('.contact-form');
  if (!form) {
    console.log('⚠️ Formularz kontaktowy nie znaleziony');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn?.textContent || 'WyĹ›lij wiadomoĹ›Ä‡';
  
  // Walidacja e-mail - tylko dozwolone domeny
  const emailInput = form.querySelector('#email');
  const allowedDomains = [
    'gmail.com','wp.pl','o2.pl','onet.pl','interia.pl','op.pl','poczta.fm',
    'proton.me','yahoo.com','icloud.com','hotmail.com','outlook.com','live.com'
  ];

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      const value = emailInput.value.trim();
      const domain = value.split('@')[1];
      if (domain && !allowedDomains.includes(domain)) {
        emailInput.setCustomValidity('Podaj e-mail z dozwolonej domeny.');
        emailInput.style.border = '1px solid #ff4444';
      } else {
        emailInput.setCustomValidity('');
        emailInput.style.border = '';
      }
    });
  }

  // ObsĹ‚uga wysyĹ‚ania formularza
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Sprawdź czy wszystkie pola sÄ… wypeĹ‚nione
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.border = '1px solid #ff4444';
        isValid = false;
      } else {
        field.style.border = '';
      }
    });

    if (!isValid) {
      showFormMessage('WypeĹ‚nij wszystkie wymagane pola.', 'error');
      return;
    }

    // ZmieĹ„ stan przycisku
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="loading-spinner"></span> WysyĹ‚am...';
    }

    try {
      // Wyślij do FormSubmit.co
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showFormMessage('Wiadomość wysłana pomyślnie! Odezwę się wkrótce.', 'success');
        form.reset();
      } else {
        throw new Error('Błąd podczas wysyłania');
      }
    } catch (error) {
      console.error('Błąd wysyłania formularza:', error);
      showFormMessage('Wystąpił błąd. Spróbuj ponownie później.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
  
  console.log('✅ Formularz kontaktowy zainicjalizowany');
}
