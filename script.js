// Animation d’ouverture.
const openingScreen = document.getElementById("openingScreen");

function launchOpeningAnimation() {
  if (!openingScreen) {
    document.body.classList.remove("is-preloading");
    return;
  }

  const startSequence = () => {
    window.setTimeout(() => {
      document.body.classList.add("opening-started");
    }, 180);

    window.setTimeout(() => {
      document.body.classList.add("opening-finished");
      document.body.classList.remove("is-preloading");
    }, 1400);

    window.setTimeout(() => {
      openingScreen.remove();
    }, 1950);
  };

  if (document.readyState === "complete") {
    startSequence();
  } else {
    window.addEventListener("load", startSequence, { once: true });
  }
}

launchOpeningAnimation();

/*
  Bar Mitzvah de Samuel Choukroun
  - Compte à rebours
  - Menu mobile
  - Animations d'apparition
  - RSVP WhatsApp uniquement
*/

// Compte à rebours jusqu'au jeudi 24 septembre 2026 à 9h00 (heure de Paris).
const EVENT_DATE = "2026-09-24T09:00:00+02:00";

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

function updateCountdown() {
  if (!daysElement || !hoursElement || !minutesElement || !secondsElement) return;

  const distance = new Date(EVENT_DATE).getTime() - Date.now();

  if (distance <= 0) {
    daysElement.textContent = "00";
    hoursElement.textContent = "00";
    minutesElement.textContent = "00";
    secondsElement.textContent = "00";
    return;
  }

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance / 3600000) % 24);
  const minutes = Math.floor((distance / 60000) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  daysElement.textContent = String(days).padStart(2, "0");
  hoursElement.textContent = String(hours).padStart(2, "0");
  minutesElement.textContent = String(minutes).padStart(2, "0");
  secondsElement.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Header au scroll.
const header = document.querySelector(".site-header");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 24);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// Menu mobile.
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Apparitions douces.
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// RSVP WhatsApp uniquement.
// Remplace simplement les deux numéros ci-dessous par les bons numéros, sans + ni espaces.
const WHATSAPP_CONTACTS = {
  maurice: { name: "Maurice", phone: "33600000000" },
  vanessa: { name: "Vanessa", phone: "33600000001" },
};

const rsvpForm = document.getElementById("rsvpForm");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");
const selectedContactBanner = document.getElementById("selectedContactBanner");
const contactInputs = document.querySelectorAll('input[name="contactPerson"]');
const contactCards = document.querySelectorAll('.contact-card');

function updateContactUi() {
  const selected = document.querySelector('input[name="contactPerson"]:checked');
  const selectedValue = selected ? selected.value : "";

  contactCards.forEach((card) => {
    const input = card.querySelector('input[name="contactPerson"]');
    card.classList.toggle("active", !!input && input.value === selectedValue);
  });

  if (!selectedValue || !WHATSAPP_CONTACTS[selectedValue]) {
    if (selectedContactBanner) {
      selectedContactBanner.textContent = "Sélectionnez votre contact WhatsApp pour préparer votre réponse.";
      selectedContactBanner.classList.remove("active");
    }
    if (submitButton) {
      submitButton.innerHTML = '<span class="whatsapp-icon" aria-hidden="true">✆</span>Envoyer ma réponse sur WhatsApp';
    }
    return;
  }

  const chosenContact = WHATSAPP_CONTACTS[selectedValue];

  if (selectedContactBanner) {
    selectedContactBanner.textContent = `Votre réponse sera préparée pour ${chosenContact.name} sur WhatsApp.`;
    selectedContactBanner.classList.add("active");
  }

  if (submitButton) {
    submitButton.innerHTML = `<span class="whatsapp-icon" aria-hidden="true">✆</span>Envoyer ma réponse à ${chosenContact.name}`;
  }
}

function openWhatsAppRsvp() {
  const selected = document.querySelector('input[name="contactPerson"]:checked');
  const selectedValue = selected ? selected.value : "";
  const selectedContact = WHATSAPP_CONTACTS[selectedValue];

  if (!selectedContact) return;

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const attendance = document.getElementById("attendance").value;
  const guestCount = document.getElementById("guestCount").value;
  const message = document.getElementById("message").value.trim();

  const lines = [
    `Bonjour ${selectedContact.name}, voici ma réponse pour la Bar Mitzvah de Samuel Choukroun :`,
    "",
    `Prénom : ${firstName}`,
    `Nom : ${lastName}`,
    `Présence : ${attendance}`,
    `Nombre de personnes : ${guestCount}`,
  ];

  if (message) {
    lines.push(`Message pour Samuel : ${message}`);
  }

  lines.push("", "Merci beaucoup.");

  const whatsappUrl = `https://wa.me/${selectedContact.phone}?text=${encodeURIComponent(lines.join("\n"))}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

contactInputs.forEach((input) => {
  input.addEventListener("change", updateContactUi);
});

updateContactUi();

if (rsvpForm) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!rsvpForm.checkValidity()) {
      rsvpForm.reportValidity();
      if (formStatus) {
        formStatus.textContent = "Merci de compléter le formulaire et de choisir Maurice ou Vanessa avant d’envoyer votre réponse.";
        formStatus.classList.add("error");
      }
      return;
    }

    openWhatsAppRsvp();

    if (formStatus) {
      const selected = document.querySelector('input[name="contactPerson"]:checked');
      const selectedContact = selected ? WHATSAPP_CONTACTS[selected.value] : null;
      formStatus.textContent = selectedContact
        ? `WhatsApp s’est ouvert avec votre réponse prête à être envoyée à ${selectedContact.name}.`
        : "WhatsApp s’est ouvert avec votre réponse prête à être envoyée.";
      formStatus.classList.remove("error");
    }
  });
}



// Musique d'ambiance.
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const musicState = document.getElementById("musicState");

function setMusicUi(isPlaying) {
  if (!musicToggle || !musicState) return;

  musicToggle.classList.toggle("is-paused", !isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Couper la musique" : "Lancer la musique");
  musicState.textContent = isPlaying ? "ON" : "OFF";
}

async function tryPlayBackgroundMusic() {
  if (!backgroundMusic) return false;

  backgroundMusic.volume = 0.32;

  try {
    await backgroundMusic.play();
    setMusicUi(true);
    return true;
  } catch (error) {
    setMusicUi(false);
    return false;
  }
}

if (backgroundMusic) {
  backgroundMusic.volume = 0.32;
  setMusicUi(!backgroundMusic.paused);

  // Première tentative automatique.
  tryPlayBackgroundMusic();

  // Si le navigateur bloque l'autoplay avec son, le premier geste utilisateur lance la musique.
  const unlockMusic = async (event) => {
    if (event?.target?.closest?.("#musicToggle")) return;

    if (backgroundMusic.paused) {
      await tryPlayBackgroundMusic();
    }

    if (!backgroundMusic.paused) {
      document.removeEventListener("pointerdown", unlockMusic);
      document.removeEventListener("keydown", unlockMusic);
    }
  };

  document.addEventListener("pointerdown", unlockMusic, { passive: true });
  document.addEventListener("keydown", unlockMusic);

  backgroundMusic.addEventListener("play", () => setMusicUi(true));
  backgroundMusic.addEventListener("pause", () => setMusicUi(false));
}

if (musicToggle && backgroundMusic) {
  musicToggle.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
      await tryPlayBackgroundMusic();
    } else {
      backgroundMusic.pause();
    }
  });
}

/*
==============================================================
CARROUSEL DÉSACTIVÉ
--------------------------------------------------------------
Le HTML du carrousel est conservé en commentaire dans index.html.
Quand tu voudras le remettre, tu pourras réactiver ici sa logique JS.
==============================================================
*/
