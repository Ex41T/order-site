/* ==========================================================================
   CONTACT FORM MODULE - 2025/2026
   ========================================================================== */

export class ContactForm {
  constructor() {
    this.form = null;
    this.submitBtn = null;
    this.originalBtnText = '';
    this.isSubmitting = false;
    this.validationRules = new Map();
  }

  async init() {
    this.form = document.querySelector('[data-contact-form]');
    if (!this.form) return;
    
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.originalBtnText = this.submitBtn?.textContent || '';
    
    // Setup validation rules
    this.setupValidationRules();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Setup real-time validation
    this.setupRealTimeValidation();
    
    console.log('📧 Contact form initialized');
  }

  setupValidationRules() {
    this.validationRules.set('name', {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]+$/,
      message: 'Imię i nazwisko powinno zawierać 2-50 znaków (tylko litery)'
    });
    
    this.validationRules.set('email', {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Podaj prawidłowy adres e-mail'
    });
    
    this.validationRules.set('message', {
      required: true,
      minLength: 10,
      maxLength: 1000,
      message: 'Wiadomość powinna zawierać 10-1000 znaków'
    });
    
    this.validationRules.set('consent', {
      required: true,
      message: 'Musisz zaakceptować politykę prywatności'
    });
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Prevent form submission on Enter in textarea
    const textarea = this.form.querySelector('textarea');
    if (textarea) {
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.form.dispatchEvent(new Event('submit'));
        }
      });
    }
  }

  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      // Validate on blur
      input.addEventListener('blur', () => this.validateField(input));
      
      // Clear errors on input
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const fieldName = field.name;
    const rules = this.validationRules.get(fieldName);
    
    if (!rules) return true;
    
    const value = field.type === 'checkbox' ? field.checked : field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required validation
    if (rules.required && (!value || value === '')) {
      isValid = false;
      errorMessage = rules.message;
    }
    
    // Pattern validation
    if (isValid && rules.pattern && value) {
      if (!rules.pattern.test(value)) {
        isValid = false;
        errorMessage = rules.message;
      }
    }
    
    // Length validation
    if (isValid && value) {
      if (rules.minLength && value.length < rules.minLength) {
        isValid = false;
        errorMessage = rules.message;
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        isValid = false;
        errorMessage = rules.message;
      }
    }
    
    // Show/hide error
    if (isValid) {
      this.clearFieldError(field);
    } else {
      this.showFieldError(field, errorMessage);
    }
    
    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'polite');
    
    field.parentNode.appendChild(errorElement);
  }

  clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    // Validate all fields
    const isValid = this.validateForm();
    if (!isValid) return;
    
    this.isSubmitting = true;
    this.setSubmitButtonState('loading');
    
    try {
      // Prepare form data
      const formData = this.prepareFormData();
      
      // Submit form
      const response = await this.submitForm(formData);
      
      if (response.ok) {
        this.handleSuccess();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonState('idle');
    }
  }

  validateForm() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    let isValid = true;
    
    inputs.forEach(input => {
      const fieldValid = this.validateField(input);
      if (!fieldValid) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  prepareFormData() {
    const formData = new FormData(this.form);
    
    // Add additional data
    formData.append('timestamp', new Date().toISOString());
    formData.append('userAgent', navigator.userAgent);
    formData.append('referrer', document.referrer);
    
    return formData;
  }

  async submitForm(formData) {
    // Use Formspree or similar service
    const response = await fetch(this.form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response;
  }

  setSubmitButtonState(state) {
    if (!this.submitBtn) return;
    
    switch (state) {
      case 'loading':
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = `
          <span class="loading-spinner" aria-hidden="true"></span>
          Wysyłanie...
        `;
        break;
      case 'success':
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'Wysłano!';
        this.submitBtn.classList.add('success');
        break;
      case 'error':
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'Spróbuj ponownie';
        this.submitBtn.classList.add('error');
        break;
      case 'idle':
      default:
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = this.originalBtnText;
        this.submitBtn.classList.remove('success', 'error');
        break;
    }
  }

  handleSuccess() {
    this.setSubmitButtonState('success');
    this.showMessage('Wiadomość została wysłana! Odpowiem wkrótce.', 'success');
    this.form.reset();
    
    // Reset button after 3 seconds
    setTimeout(() => {
      this.setSubmitButtonState('idle');
    }, 3000);
    
    // Track success event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        form_name: 'contact',
        form_status: 'success'
      });
    }
  }

  handleError(error) {
    console.error('Form submission error:', error);
    this.setSubmitButtonState('error');
    this.showMessage('Wystąpił błąd. Spróbuj ponownie lub napisz bezpośrednio na e-mail.', 'error');
    
    // Track error event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submit', {
        form_name: 'contact',
        form_status: 'error'
      });
    }
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessages = this.form.querySelectorAll('.form-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message form-message--${type}`;
    messageElement.textContent = message;
    messageElement.setAttribute('role', 'alert');
    messageElement.setAttribute('aria-live', 'polite');
    
    // Style the message
    messageElement.style.cssText = `
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 0.5rem;
      font-weight: 500;
      ${type === 'success' 
        ? 'background: rgba(34, 197, 94, 0.1); color: rgb(34, 197, 94); border: 1px solid rgba(34, 197, 94, 0.2);'
        : 'background: rgba(239, 68, 68, 0.1); color: rgb(239, 68, 68); border: 1px solid rgba(239, 68, 68, 0.2);'
      }
    `;
    
    this.form.appendChild(messageElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }

  destroy() {
    // Remove event listeners
    this.form.removeEventListener('submit', this.handleSubmit);
    
    console.log('📧 Contact form destroyed');
  }
}
