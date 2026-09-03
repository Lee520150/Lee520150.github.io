(function () {
  var output = document.querySelector("[data-site-uptime]");
  if (!output) return;

  var STARTED_AT = "2026-08-23T00:00:00+08:00";
  var started = new Date(STARTED_AT).getTime();

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function render() {
    var diff = Math.max(0, Date.now() - started);
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    output.textContent = days + " 天 " + pad(hours) + " 小时 " + pad(minutes) + " 分 " + pad(seconds) + " 秒";
  }

  render();
  window.setInterval(render, 1000);
})();
