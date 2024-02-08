let shutdownings = [];
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

    updateList();

    setInterval(updateList, 10000);
    setInterval(updateLog, 10000);
});

function updateList() {
    let lines = "";

    $.ajax({
        type: "GET",
        url: "/apps",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getCookie("accessToken"));
        },
        success: function (data) {
            for (const app of data) {
                lines += `
                    <td class="column1" id="app-${app.name}">
                        <div class="appcard">
                            ${app.name}`;

                switch (app.status) {
                    case 1:
                        lines += `
                            <button class="appbutton ${
                                shutdownings.includes(app.name)
                                    ? `switching" disabled`
                                    : `started" onclick="javascript:stopApp('${app.name}')"`
                            }>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><title>Stop</title><path d="M7.5 1v7h1V1h-1z"/><path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"/></svg>
                            </button>`;
                        break;
                    case 84:
                        lines += `
                            <button class="appbutton stopped" onclick="javascript:startApp('${app.name}')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><title>Start</title><path d="M7.5 1v7h1V1h-1z"/><path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"/></svg>
                            </button>`;
                        break;
                    case -1:
                        lines += `
                            <button class="appbutton unknown" onclick="javascript:startApp('${app.name}')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><title>Start</title><path d="M7.5 1v7h1V1h-1z"/><path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"/></svg>
                            </button>`;
                        break;
                    default:
                        lines += `
                            <button class="appbutton disabled" onclick="javascript:startApp('${app.name}')" disabled>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><title></title><path d="M7.5 1v7h1V1h-1z"/><path d="M3 8.812a4.999 4.999 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812z"/></svg>
                            </button>`;
                        break;
                }

                lines += `
                <button class="appbutton ${
                    app.autoRestart ? "started" : "stopped"
                }" onclick="javascript:switchAutoRestart('${app.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><title>Toggle AutoRestart</title><path d="M12,4C14.1,4 16.1,4.8 17.6,6.3C20.7,9.4 20.7,14.5 17.6,17.6C15.8,19.5 13.3,20.2 10.9,19.9L11.4,17.9C13.1,18.1 14.9,17.5 16.2,16.2C18.5,13.9 18.5,10.1 16.2,7.7C15.1,6.6 13.5,6 12,6V10.6L7,5.6L12,0.6V4M6.3,17.6C3.7,15 3.3,11 5.1,7.9L6.6,9.4C5.5,11.6 5.9,14.4 7.8,16.2C8.3,16.7 8.9,17.1 9.6,17.4L9,19.4C8,19 7.1,18.4 6.3,17.6Z" /></svg>
                </button>
                <button class="appbutton" onclick="javascript:switchConsole('${
                    app.name
                }', false)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><title>Open Console</title><path d="M21.038,4.9l-7.577-4.498C13.009,0.134,12.505,0,12,0c-0.505,0-1.009,0.134-1.462,0.403L2.961,4.9 C2.057,5.437,1.5,6.429,1.5,7.503v8.995c0,1.073,0.557,2.066,1.462,2.603l7.577,4.497C10.991,23.866,11.495,24,12,24 c0.505,0,1.009-0.134,1.461-0.402l7.577-4.497c0.904-0.537,1.462-1.529,1.462-2.603V7.503C22.5,6.429,21.943,5.437,21.038,4.9z M15.17,18.946l0.013,0.646c0.001,0.078-0.05,0.167-0.111,0.198l-0.383,0.22c-0.061,0.031-0.111-0.007-0.112-0.085L14.57,19.29 c-0.328,0.136-0.66,0.169-0.872,0.084c-0.04-0.016-0.057-0.075-0.041-0.142l0.139-0.584c0.011-0.046,0.036-0.092,0.069-0.121 c0.012-0.011,0.024-0.02,0.036-0.026c0.022-0.011,0.043-0.014,0.062-0.006c0.229,0.077,0.521,0.041,0.802-0.101 c0.357-0.181,0.596-0.545,0.592-0.907c-0.003-0.328-0.181-0.465-0.613-0.468c-0.55,0.001-1.064-0.107-1.072-0.917 c-0.007-0.667,0.34-1.361,0.889-1.8l-0.007-0.652c-0.001-0.08,0.048-0.168,0.111-0.2l0.37-0.236 c0.061-0.031,0.111,0.007,0.112,0.087l0.006,0.653c0.273-0.109,0.511-0.138,0.726-0.088c0.047,0.012,0.067,0.076,0.048,0.151 l-0.144,0.578c-0.011,0.044-0.036,0.088-0.065,0.116c-0.012,0.012-0.025,0.021-0.038,0.028c-0.019,0.01-0.038,0.013-0.057,0.009 c-0.098-0.022-0.332-0.073-0.699,0.113c-0.385,0.195-0.52,0.53-0.517,0.778c0.003,0.297,0.155,0.387,0.681,0.396 c0.7,0.012,1.003,0.318,1.01,1.023C16.105,17.747,15.736,18.491,15.17,18.946z M19.143,17.859c0,0.06-0.008,0.116-0.058,0.145 l-1.916,1.164c-0.05,0.029-0.09,0.004-0.09-0.056v-0.494c0-0.06,0.037-0.093,0.087-0.122l1.887-1.129 c0.05-0.029,0.09-0.004,0.09,0.056V17.859z M20.459,6.797l-7.168,4.427c-0.894,0.523-1.553,1.109-1.553,2.187v8.833 c0,0.645,0.26,1.063,0.66,1.184c-0.131,0.023-0.264,0.039-0.398,0.039c-0.42,0-0.833-0.114-1.197-0.33L3.226,18.64 c-0.741-0.44-1.201-1.261-1.201-2.142V7.503c0-0.881,0.46-1.702,1.201-2.142l7.577-4.498c0.363-0.216,0.777-0.33,1.197-0.33 c0.419,0,0.833,0.114,1.197,0.33l7.577,4.498c0.624,0.371,1.046,1.013,1.164,1.732C21.686,6.557,21.12,6.411,20.459,6.797z"/></svg>
                </button>`;

                lines += `
                            <br />
                            <br />
                            ${app.description}
                        </div>
                    </td>`;
            }

            document.getElementById("lines").innerHTML = lines;
        },
    });
}

function updateLog() {
    if (!isConsoleOpen) return;
    $.ajax({
        type: "POST",
        url: "/currentLog",
        data: { appName: appInConsole },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getCookie("accessToken"));
        },
        success: function (data) {
            document.getElementById("console-lines").innerHTML =
                data.lines.replaceAll("\n", "<br />");
        },
    });
}

function startApp(appName) {
    $.ajax({
        type: "POST",
        url: "/start",
        data: { appName: appName },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getCookie("accessToken"));
        },
        success: () => {
            if (shutdownings.includes(appName))
                shutdownings.splice(shutdownings.indexOf(appName), 1);
            setTimeout(updateList(), 1000);
        },
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
            xhr.setRequestHeader("Authorization", "Bearer " + getCookie("accessToken"));
        },
        success: () => {
            setTimeout(updateList(), 1000);
        },
        error: function (err) {
            if (err.responseText) {
                const closeCommand = JSON.parse(err.responseText).closeCommand;
                let i = null;
                if (
                    closeCommand &&
                    (i = consoleCommand(closeCommand, null, "rcon", appName))
                ) {
                    shutdownings.push(appName);
                    return;
                }
            }
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
            xhr.setRequestHeader("Authorization", "Bearer " + getCookie("accessToken"));
        },
        success: () => {
            setTimeout(updateList(), 1000);
        },
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
    updateLog();
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
    if (shutdownings.includes(_appName) || shutdownings.includes(appInConsole))
        return false;
    if (_input) _input.value = "";

    return $.ajax({
        type: "POST",
        url: consoleType,
        data: { appName: _appName || appInConsole, rconCommand: command },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + getCookie("accessToken"));
        },
        success: () => {
            setTimeout(updateLog(), 1000);
            return true;
        },
        error: function (err) {
            console.error(new Error(err));
            return false;
        },
    });
}

function logInOut() {
    if (!getCookie("accessToken")) {
        window.location.href = "/login";
    } else {
        deleteCookie("accessToken")
        window.location.reload();
    }
}
