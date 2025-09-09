let items = document.querySelectorAll('.carousel .carousel-item')

items.forEach((el) => {
    const minPerSlide = 4
    let next = el.nextElementSibling
    for (var i=1; i<minPerSlide; i++) {
        if (!next) {
            // wrap carousel by using first child
        	next = items[0]
      	}
        let cloneChild = next.cloneNode(true)
        el.appendChild(cloneChild.children[0])
        next = next.nextElementSibling
    }
})


// contact form handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  const submitBtn = document.getElementById('contactSubmit');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.remove('was-validated');
    status.textContent = '';

    // simple constraint validation
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      status.textContent = 'Please correct the errors above.';
      return;
    }

    // honeypot (bot check)
    if (form.website && form.website.value.trim() !== '') {
      // silently fail (bot)
      status.textContent = 'Thanks.';
      return;
    }

    // prepare payload
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    // show sending
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      // try POST to your backend endpoint
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        status.textContent = 'Message sent — thank you! We will reply soon.';
        form.reset();
      } else {
        // fallback: open mail client if endpoint missing
        status.innerHTML = 'Server error — opening your mail client as fallback.';
        const mailto = `mailto:hello@solveit.example?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.message + '\n\nFrom: ' + payload.name + ' <' + payload.email + '>')}`;
        window.location.href = mailto;
      }
    } catch (err) {
      // network error -> fallback
      status.innerHTML = 'Network error — opening your mail client as fallback.';
      const mailto = `mailto:hello@solveit.example?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.message + '\n\nFrom: ' + payload.name + ' <' + payload.email + '>')}`;
      window.location.href = mailto;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
});
