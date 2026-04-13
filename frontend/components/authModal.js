(function () {
  var API = "http://localhost:5000/api";
  var currentUser = JSON.parse(localStorage.getItem("roomPlannerUser"));
  var btnLogin = document.getElementById("btn-login");

  // restore session on load
  if (currentUser) showLoggedIn(currentUser);

  btnLogin.addEventListener("click", function () {
    if (currentUser) {
      currentUser = null;
      localStorage.removeItem("roomPlannerUser");
      btnLogin.textContent = "Login";
      return;
    }
    openModal();
  });

  function showLoggedIn(user) {
    currentUser = user;
    localStorage.setItem("roomPlannerUser", JSON.stringify(user));
    btnLogin.textContent = "Logout (" + user.username + ")";
  }

  function openModal() {
    // overlay
    var overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    overlay.innerHTML =
      '<div class="modal-box">' +
        '<h3 id="auth-title" class="modal-title">Login</h3>' +
        '<input id="auth-user" class="modal-input" placeholder="Username" />' +
        '<input id="auth-pass" class="modal-input" type="password" placeholder="Password" />' +
        '<p id="auth-error" class="modal-error"></p>' +
        '<div class="modal-actions">' +
          '<button id="auth-submit-btn" class="btn btn-primary">Login</button>' +
          '<button id="auth-cancel-btn" class="btn btn-link">Cancel</button>' +
        '</div>' +
        '<p class="modal-switch">Don\'t have an account? <a id="auth-toggle" href="#">Register</a></p>' +
      '</div>';

    document.body.appendChild(overlay);

    var errEl = document.getElementById("auth-error");
    var titleEl = document.getElementById("auth-title");
    var submitBtn = document.getElementById("auth-submit-btn");
    var toggleLink = document.getElementById("auth-toggle");
    var isLogin = true;

    toggleLink.onclick = function (e) {
      e.preventDefault();
      isLogin = !isLogin;
      errEl.textContent = "";
      titleEl.textContent = isLogin ? "Login" : "Register";
      submitBtn.textContent = isLogin ? "Login" : "Register";
      toggleLink.textContent = isLogin ? "Register" : "Login";
      toggleLink.previousSibling.textContent = isLogin ? "Don't have an account? " : "Already have an account? ";
    };

    document.getElementById("auth-cancel-btn").onclick = function () {
      overlay.remove();
    };

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });

    submitBtn.onclick = function () {
      errEl.textContent = "";
      var user = document.getElementById("auth-user").value.trim();
      var pass = document.getElementById("auth-pass").value;
      if (!user || !pass) { errEl.textContent = "Username and password are required."; return; }

      var endpoint = isLogin ? "/auth/login" : "/auth/register";

      fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.error) { errEl.textContent = data.error; return; }
          showLoggedIn(data);
          overlay.remove();
        })
        .catch(function () { errEl.textContent = "Cannot reach server."; });
    };
  }
})();
