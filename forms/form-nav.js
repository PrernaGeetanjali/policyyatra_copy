(function () {
  var formMap = {
    signup: "signup.html",
    "login-otp": "login-otp.html",
    "login-password": "login-password.html",
    "forgot-password": "forgot-password.html",
  };

  function navigate(formName) {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "auth-nav", form: formName }, "*");
      return;
    }

    var target = formMap[formName];
    if (target) {
      window.location.href = target;
    }
  }

  document.querySelectorAll("[data-auth-show]").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.preventDefault();
      navigate(trigger.getAttribute("data-auth-show"));
    });
  });

  document.querySelectorAll("form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  });

  function sendHeight() {
    if (window.parent === window) return;
    var card = document.querySelector(".py-auth-card");
    if (!card) return;
    window.parent.postMessage(
      {
        type: "auth-resize",
        height: Math.ceil(card.getBoundingClientRect().height) + 4,
      },
      "*"
    );
  }

  sendHeight();
  window.addEventListener("load", sendHeight);
  window.addEventListener("resize", sendHeight);
})();
