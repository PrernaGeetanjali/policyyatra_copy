(function () {
  var mount = document.getElementById("heroAuthMount");
  var defaultCta = document.getElementById("heroDefaultCta");

  if (!mount) return;

  var formUrls = {
    signup: "./forms/signup.html",
    "login-otp": "./forms/login-otp.html",
    "login-password": "./forms/login-password.html",
    "forgot-password": "./forms/forgot-password.html",
  };

  function bindMountEvents() {
    mount.querySelectorAll("form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    });
  }

  function renderFormHtml(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var card = doc.querySelector(".py-auth-card");
    mount.innerHTML = card ? card.outerHTML : html;
    bindMountEvents();
  }

  function showFormIframe(formName) {
    var url = formUrls[formName];
    if (!url) return;

    mount.innerHTML =
      '<iframe class="hero-auth-frame" title="Authentication form" src="' +
      url +
      '" scrolling="no"></iframe>';
  }

  function showForm(formName) {
    var url = formUrls[formName];
    if (!url) return;

    if (defaultCta) {
      defaultCta.hidden = true;
    }

    mount.hidden = false;
    mount.setAttribute("data-active-form", formName);

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Form load failed");
        }
        return response.text();
      })
      .then(function (html) {
        renderFormHtml(html);
      })
      .catch(function () {
        showFormIframe(formName);
      });
  }

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-auth-show]");
    if (!trigger) return;

    event.preventDefault();
    showForm(trigger.getAttribute("data-auth-show"));
  });

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "auth-nav") return;
    showForm(event.data.form);
  });
})();
