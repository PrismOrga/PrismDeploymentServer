let appInConsole = null;
let isConsoleOpen = false;

$(document).ready(function () {
    $("input").on("keydown", function search(e) {
        if (e.keyCode == 13) {
            consoleCommand($(this).val(), this);
        }
    });

    const logInOutButton = document.getElementById("login-logout-button");

    if (!getCookie("accessToken")) logInOutButton.innerHTML = "<h3>Login</h3>";
    else logInOutButton.innerHTML = "<h3>Logout</h3>";

    socketUpdateApps();
    socketUpdateLogs();
});

function startApp(appName) {
    $.ajax({
        type: "POST",
        url: "/start",
        data: { appName: appName },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(
                "Authorization",
                "Bearer " + getCookie("accessToken")
            );
        },
        success: () => {},
        error: function (err) {
            throw new Error(err);
        },
    });
}

function stopApp(appName) {
    $.ajax({
        type: "POST",
        url: "/stop",
        data: { appName: appName },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(
                "Authorization",
                "Bearer " + getCookie("accessToken")
            );
        },
        success: () => {},
        error: function (err) {
            throw new Error(err);
        },
    });
}

function switchAutoRestart(appName) {
    $.ajax({
        type: "POST",
        url: "/autorestart",
        data: { appName: appName },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(
                "Authorization",
                "Bearer " + getCookie("accessToken")
            );
        },
        success: () => {},
        error: function (err) {
            throw new Error(err);
        },
    });
}

function switchConsole(appName, _active) {
    document.getElementById("apps").hidden = true;
    document.getElementById("console").hidden = false;

    if (!_active) document.getElementById("console-command").disabled = true;
    else document.getElementById("console-command").disabled = false;
    appInConsole = appName;
    isConsoleOpen = true;
    socketUpdateLogs();
}

function switchApps() {
    document.getElementById("console").hidden = true;
    document.getElementById("apps").hidden = false;
    appInConsole = null;
    isConsoleOpen = false;
}

function consoleCommand(command, _input, _consoleType, _appName) {
    const consoleType =
        _consoleType || document.getElementById("console-select").value;

    if (command == "") return false;
    if (_input) _input.value = "";

    return $.ajax({
        type: "POST",
        url: consoleType,
        data: { appName: _appName || appInConsole, rconCommand: command },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(
                "Authorization",
                "Bearer " + getCookie("accessToken")
            );
        },
        success: () => {},
        error: function (err) {
            console.error(new Error(err));
        },
    });
}

function logInOut() {
    if (!getCookie("accessToken")) {
        window.location.href = "/login";
    } else {
        deleteCookie("accessToken");
        window.location.reload();
    }
}
