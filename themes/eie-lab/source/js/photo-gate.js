(function () {
  var gate = document.querySelector("[data-photo-gate]");
  var content = document.querySelector("[data-photo-private-content]");
  if (!gate || !content) return;

  var PASSWORD = "520150";
  var SESSION_KEY = "color-lab-photo-access";
  var form = gate.querySelector("[data-photo-gate-form]");
  var input = gate.querySelector("#photo-password");
  var message = gate.querySelector("[data-photo-gate-message]");

  function unlock() {
    gate.hidden = true;
    content.hidden = false;

    var firstPhoto = content.querySelector(".photo-tile");
    if (firstPhoto) firstPhoto.focus({ preventScroll: true });
  }

  if (sessionStorage.getItem(SESSION_KEY) === "ok") {
    unlock();
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (input.value === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "ok");
      unlock();
      return;
    }

    message.textContent = "密码不正确。";
    input.value = "";
    input.focus();
  });
})();
