let appInConsole = null;
let isConsoleOpen = false;
let isSocketConnected = false;
let isInfoBusy = false;
let infoIndex = 0;

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

function displayInfoState(message, state, _displayTime) {
    if (isInfoBusy) return;

    const info = document.getElementById("info");

    info.hidden = false;
    info.style.opacity = 0;
    setTimeout(() => (info.style.opacity = 1), 10);

    switch (state) {
        case 0:
            info.classList.value = "success";
            break;
        case 84:
            info.classList.value = "error";
            break;
        default:
            info.classList.value = "";
            break;
    }

    info.innerHTML = message.replaceAll("\n", "<br />");

    if (_displayTime) {
        infoIndex++;
        setTimeout(() => hideInfoState(true), _displayTime);
    }
}

function hideInfoState(_wasTimed) {
    if (_wasTimed) infoIndex--;

    if (infoIndex || isInfoBusy) return;

    const info = document.getElementById("info");

    info.style.opacity = 1;
    info.style.opacity = 0;
    setTimeout(() => (info.hidden = true), 210);
}

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
            displayInfoState(
                `An error occured while trying to start ${appName}.\nYou may not be authorized to do so.`,
                84,
                5000
            );

            console.error(new Error(err));
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
            displayInfoState(
                `An error occured while trying to stop ${appName}.\nYou may not be authorized to do so.`,
                84,
                5000
            );

            console.error(new Error(err));
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
            displayInfoState(
                `An error occured while trying to switch autorestart state of ${appName}.\nYou may not be authorized to do so.`,
                84,
                5000
            );

            console.error(new Error(err));
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
        url: consoleType.toLowerCase(),
        data: { appName: _appName || appInConsole, rconCommand: command },
        beforeSend: function (xhr) {
            xhr.setRequestHeader(
                "Authorization",
                "Bearer " + getCookie("accessToken")
            );
        },
        success: () => {},
        error: function (err) {
            displayInfoState(
                `An error occured while sending command to ${
                    _appName || appInConsole
                }'s ${consoleType} console.\nYou may not be authorized to do so.`,
                84,
                5000
            );

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
