$(document).ready(function () {});

function authMe() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    $.ajax({
        type: "POST",
        url: "/login",
        data: { username: username, password: password },
        success: (data) => {
            setCookie("accessToken", data.accessToken, { secure: true });
            window.location.href = "/";
        },
        error: function (err) {
            console.error(err);
            window.location.reload();
        },
    });
}
