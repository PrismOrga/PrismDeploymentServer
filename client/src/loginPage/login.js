$(document).ready(function () {});

function authMe() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    $.ajax({
        type: "POST",
        url: "/login",
        data: { username: username, password: password },
        success: (data) => {
            document.cookie = `accessToken=${data.accessToken}`;
            window.location.href = "/";
        },
        error: function (err) {
            console.error(err);
            window.location.reload();
        },
    });
}
