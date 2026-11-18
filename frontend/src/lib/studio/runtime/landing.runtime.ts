// Browser runtime for generated landing pages. No build step required.
// Must not contain backticks or "${" (embedded in a template literal).

export const LANDING_RUNTIME = `
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(function () {
    var sections = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      sections.forEach(function (section) { observer.observe(section); });
    } else {
      sections.forEach(function (section) { section.classList.add("visible"); });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    var toast = document.getElementById("toast");
    var toastTimer = null;
    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.hidden = false;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.hidden = true; }, 3200);
    }

    var form = document.getElementById("signup-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="email"]');
        var email = input ? input.value.trim() : "";
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
          showToast("Please enter a valid email address");
          if (input) input.focus();
          return;
        }
        try {
          var key = "studio.leads";
          var leads = JSON.parse(localStorage.getItem(key) || "[]");
          if (!Array.isArray(leads)) leads = [];
          if (leads.indexOf(email) === -1) leads.push(email);
          localStorage.setItem(key, JSON.stringify(leads));
        } catch (error) {}
        form.innerHTML = '<p class="success">Thanks — you are on the list. (This demo stores signups in your browser.)</p>';
        showToast("Signed up as " + email);
      });
    }

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  });
})();
`;
