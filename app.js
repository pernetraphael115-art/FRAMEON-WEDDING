(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Safari Fallback for <dialog closedby="any">
     ------------------------------------------------------------------------ */
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const isOutside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    document.querySelectorAll('dialog[closedby="any"]').forEach((dialog) => {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = isOutside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && isOutside(e, dialog)) dialog.close();
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const mobileNav = document.getElementById('mobile-nav');
  const openNavBtn = document.getElementById('open-nav-btn');
  const closeNavBtn = document.getElementById('close-nav-btn');

  if (mobileNav && openNavBtn && closeNavBtn) {
    openNavBtn.addEventListener('click', () => mobileNav.showModal());
    closeNavBtn.addEventListener('click', () => mobileNav.close());
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mobileNav.close());
    });
  }

  /* ------------------------------------------------------------------------
     2b. Contact Popup Modal (<dialog>)
     ------------------------------------------------------------------------ */
  const contactDialog = document.getElementById('contact-dialog');
  const closeContactBtn = document.getElementById('close-contact-btn');

  if (contactDialog) {
    document.querySelectorAll('[data-open-contact]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (mobileNav?.open) mobileNav.close();
        contactDialog.showModal();
      });
    });

    closeContactBtn?.addEventListener('click', () => contactDialog.close());
  }

  document.querySelectorAll('[data-open-dialog]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const target = document.getElementById(trigger.dataset.openDialog);
      target?.showModal();
    });
  });

  document.querySelectorAll('[data-close-dialog]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.closest('dialog')?.close();
    });
  });

  /* ------------------------------------------------------------------------
     3. Marquee Gallery & Lightbox (<dialog>)
     ------------------------------------------------------------------------ */
  const marqueeGallery = document.getElementById('marquee-gallery');
  const marqueeToggle = document.getElementById('marquee-toggle');

  if (marqueeGallery) {
    marqueeGallery.querySelectorAll('.marquee-track').forEach((track) => {
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('button').forEach((b) => b.setAttribute('tabindex', '-1'));
      track.parentElement.append(clone);
      // Merge into one seamless flex track
      while (clone.firstChild) {
        track.append(clone.firstChild);
      }
      clone.remove();
    });

    marqueeToggle?.addEventListener('click', () => {
      const paused = marqueeGallery.classList.toggle('is-paused');
      marqueeToggle.textContent = paused ? 'Reprendre le défilement' : 'Mettre en pause';
    });
  }

  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');
  const closeLightboxBtn = document.getElementById('lightbox-close');
  const allGalleryBtns = [...document.querySelectorAll('.gallery-item')];
  const uniquePhotos = [];
  allGalleryBtns.forEach((btn) => {
    const idx = Number(btn.dataset.index);
    if (!Number.isNaN(idx) && !uniquePhotos[idx]) {
      uniquePhotos[idx] = {
        src: btn.dataset.full || btn.querySelector('img').src,
        alt: btn.querySelector('img').alt,
      };
    }
  });
  let currentIndex = 0;

  const showImageAt = (index) => {
    if (!uniquePhotos.length) return;
    currentIndex = (index + uniquePhotos.length) % uniquePhotos.length;
    const item = uniquePhotos[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCounter.textContent = `${currentIndex + 1} / ${uniquePhotos.length}`;
  };

  if (lightbox && uniquePhotos.length) {
    allGalleryBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        showImageAt(Number(btn.dataset.index) || 0);
        lightbox.showModal();
      });
    });

    prevBtn?.addEventListener('click', () => showImageAt(currentIndex - 1));
    nextBtn?.addEventListener('click', () => showImageAt(currentIndex + 1));
    closeLightboxBtn?.addEventListener('click', () => lightbox.close());

    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showImageAt(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        showImageAt(currentIndex + 1);
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Interactive Pricing Calculator & Live Summary
     ------------------------------------------------------------------------ */
  const offerCards = [...document.querySelectorAll('.pricing-card[data-offer]')];
  const addonCheckboxes = [...document.querySelectorAll('.addon-checkbox')];
  const quoteTitle = document.getElementById('quote-offer-title');
  const quoteOptionsBadge = document.getElementById('quote-options-badge');
  const quoteTotal = document.getElementById('quote-total');
  const quoteIncludes = document.getElementById('quote-includes');
  const applyQuoteBtn = document.getElementById('apply-quote-btn');
  const formulaSelect = document.getElementById('formule');
  const optionsInput = document.getElementById('options-selected');

  const OFFER_DETAILS = {
    photo: {
      title: 'Photo — Photographie de mariage',
      items: [
        '2 photographes le jour du mariage',
        'Présence tout au long du mariage',
        'Photos de groupe avec vos proches durant la journée',
        'Séance couple « Love » des mariés le jour J',
        'Minimum 500 photos éditées & galerie privée en ligne',
        'Album photo inclus, composé à partir de votre sélection',
      ],
    },
    video: {
      title: 'Vidéo — Film de mariage',
      items: [
        '2 vidéastes le jour du mariage',
        'Présence tout au long du mariage',
        'Film de mariage dans le style de votre choix',
        'Étalonnage cinéma & montage soigné',
      ],
    },
    duo: {
      title: 'Signature — Photo & Vidéo',
      items: [
        '2 vidéastes + 1 photographe le jour du mariage',
        'Présence continue des préparatifs à la soirée',
        'Photos de groupe & séance « Love » des mariés le jour J',
        'Minimum 500 photos éditées & galerie privée en ligne',
        'Album photo inclus, composé à partir de votre sélection',
        'Film de mariage dans le style de votre choix',
      ],
    },
  };

  let activeCard = offerCards.find((c) => c.classList.contains('is-selected')) || offerCards[2];

  const formatEur = (n) => `${n.toLocaleString('fr-FR')} € HT`;

  const updateQuoteSummary = () => {
    if (!activeCard || !quoteTotal || !quoteIncludes || !quoteTitle) return;
    const offerKey = activeCard.dataset.offer;
    const basePrice = Number(activeCard.dataset.price || 0);
    const checkedAddons = addonCheckboxes.filter((cb) => cb.checked);
    const addonsTotal = checkedAddons.reduce((sum, cb) => sum + Number(cb.dataset.price || 0), 0);
    const total = basePrice + addonsTotal;

    quoteTitle.textContent = OFFER_DETAILS[offerKey]?.title || '';
    if (quoteOptionsBadge) {
      const count = checkedAddons.length;
      quoteOptionsBadge.textContent = count === 0
        ? 'Formule de base (aucune option ajoutée)'
        : count === 1
          ? 'Formule de base + 1 option ajoutée'
          : `Formule de base + ${count} options ajoutées`;
    }
    quoteTotal.textContent = formatEur(total);

    quoteTotal.classList.remove('is-updating');
    void quoteTotal.offsetWidth;
    quoteTotal.classList.add('is-updating');

    const items = [
      ...(OFFER_DETAILS[offerKey]?.items || []),
      ...checkedAddons.map((cb) => cb.dataset.summary || cb.value),
    ];
    quoteIncludes.innerHTML = items.map((txt) => `<li>${txt}</li>`).join('');
  };

  offerCards.forEach((card) => {
    const btn = card.querySelector('.select-offer-btn');
    const selectCard = () => {
      offerCards.forEach((c) => {
        c.classList.remove('is-selected');
        const b = c.querySelector('.select-offer-btn');
        if (b) {
          b.textContent = 'Choisir cette offre';
          b.classList.remove('btn--dark');
          b.classList.add('btn--gold');
        }
      });
      card.classList.add('is-selected');
      if (btn) {
        btn.textContent = 'Offre sélectionnée ✓';
        btn.classList.remove('btn--gold');
        btn.classList.add('btn--dark');
      }
      activeCard = card;
      updateQuoteSummary();
    };
    card.addEventListener('click', (e) => {
      if (e.target.closest('button') !== btn) selectCard();
    });
    btn?.addEventListener('click', selectCard);
  });

  addonCheckboxes.forEach((cb) => cb.addEventListener('change', updateQuoteSummary));

  applyQuoteBtn?.addEventListener('click', () => {
    if (formulaSelect && activeCard) {
      formulaSelect.value = activeCard.dataset.label;
    }
    if (optionsInput) {
      const chosen = addonCheckboxes.filter((cb) => cb.checked).map((cb) => cb.value);
      optionsInput.value = chosen.length
        ? `${chosen.join(' · ')} — Total : ${quoteTotal?.textContent || ''}`
        : `Aucune option — Total : ${quoteTotal?.textContent || ''}`;
    }
  });

  updateQuoteSummary();

  /* ------------------------------------------------------------------------
     5. Accessible Form Validation (:user-invalid + ARIA sync + polite announcer)
     ------------------------------------------------------------------------ */
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form) {
    const linkError = (el, shown) => {
      const errorId = el.dataset.error;
      if (!errorId) return;
      const ids = (el.getAttribute('aria-describedby') || '')
        .split(/\s+/)
        .filter((id) => id && id !== errorId);
      if (shown) ids.push(errorId);
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    };

    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    document.body.append(announcer);

    let announceTimer;
    let announcedField;
    const flagged = new WeakSet();
    const announced = new WeakSet();

    const spokenText = (node) => {
      const copy = node.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      return copy.textContent.replace(/\s+/g, ' ').trim();
    };

    const announceError = (el) => {
      const error = document.getElementById(el.dataset.error);
      if (!error) return;
      const label = el.labels?.[0] ? `${spokenText(el.labels[0])} : ` : '';
      clearTimeout(announceTimer);
      announcer.textContent = '';
      announcedField = el;
      announceTimer = setTimeout(() => {
        announcer.textContent = label + spokenText(error);
      }, 500);
    };

    const supportsUserInvalid = CSS.supports('selector(:user-invalid)');
    const dirtyState = new WeakMap();

    const syncAria = (el, announce = false) => {
      if (!el.matches?.('input, select, textarea')) return;
      if (el.name === 'website') return; // honeypot

      const invalid = supportsUserInvalid
        ? el.matches(':user-invalid')
        : (dirtyState.get(el)?.hasBlurred && !el.validity.valid);

      if (!supportsUserInvalid) {
        el.classList.toggle('user-invalid-fallback', Boolean(invalid));
      }

      if (invalid) {
        if (announce && !announced.has(el)) {
          announceError(el);
          announced.add(el);
        }
        el.setAttribute('aria-invalid', 'true');
        linkError(el, true);
        flagged.add(el);
      } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
        el.setAttribute('aria-invalid', 'false');
        linkError(el, false);
        flagged.delete(el);
        announced.delete(el);
        if (announcedField === el) {
          clearTimeout(announceTimer);
          announcer.textContent = '';
        }
      }
    };

    form.querySelectorAll('input, select, textarea').forEach((el) => {
      if (el.name !== 'website') el.setAttribute('aria-invalid', 'false');
    });

    form.addEventListener('blur', (e) => {
      const state = dirtyState.get(e.target) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(e.target, state);
      syncAria(e.target, true);
    }, true);

    form.addEventListener('input', (e) => {
      const state = dirtyState.get(e.target) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(e.target, state);
      if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
    });

    form.addEventListener('change', (e) => {
      const state = dirtyState.get(e.target) || { hasInteracted: true, hasBlurred: true };
      state.hasBlurred = true;
      dirtyState.set(e.target, state);
      syncAria(e.target, true);
    }, true);

    form.addEventListener('invalid', (e) => {
      dirtyState.set(e.target, { hasInteracted: true, hasBlurred: true });
      announced.add(e.target);
      syncAria(e.target);
    }, true);

    const emailInput = document.getElementById('email');
    const telInput = document.getElementById('telephone');

    const clearContactChannelError = () => {
      telInput?.setCustomValidity('');
      if (telInput) syncAria(telInput);
    };
    emailInput?.addEventListener('input', clearContactChannelError);
    telInput?.addEventListener('input', clearContactChannelError);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.website && form.website.value) return; // honeypot

      if (emailInput && telInput) {
        const hasEmail = emailInput.value.trim().length > 0;
        const hasTel = telInput.value.trim().length > 0;
        telInput.setCustomValidity(!hasEmail && !hasTel ? 'Indiquez au moins un email ou un numéro de téléphone.' : '');
      }

      if (!form.checkValidity()) {
        const firstInvalid = form.querySelector(':invalid');
        firstInvalid?.focus();
        return;
      }

      const data = new FormData(form);
      const nom = data.get('nom') || '';
      const prenom = data.get('prenom') || '';
      const email = data.get('email') || 'Non renseigné';
      const telephone = data.get('telephone') || 'Non renseigné';
      const date = data.get('date') || 'Non précisée';
      const formule = data.get('formule') || 'Non précisée';
      const options = data.get('options') || 'Aucune';
      const message = data.get('message') || '';

      const subject = encodeURIComponent(`Demande mariage — ${prenom} ${nom} (${formule})`);
      const body = encodeURIComponent(
        `Bonjour Matthis & Raphaël,\n\nNom : ${prenom} ${nom}\nEmail : ${email}\nTéléphone : ${telephone}\nDate / Lieu : ${date}\nFormule souhaitée : ${formule}\nOptions : ${options}\n\nMessage :\n${message}`
      );

      formStatus.hidden = false;
      formStatus.innerHTML =
        `Merci ${prenom ? prenom : ''} ! Votre demande est prête. ` +
        `<a href="mailto:raphael@frameonws.com?cc=matthis@frameonws.com&subject=${subject}&body=${body}" style="text-decoration:underline;font-weight:600;">Cliquez ici pour l'envoyer via votre messagerie</a> ` +
        `ou réservez directement un appel découverte de 15 min.`;
    });
  }
})();
