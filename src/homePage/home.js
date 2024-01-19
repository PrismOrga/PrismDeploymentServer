$(document).ready(function () {
    // updateList();

    setInterval(updateList(), 10000);
});

function updateList() {
    const lines = document.getElementById("lines");

    lines.innerHTML = "";

    $.ajax({
        type: "GET",
        url: "/apps",
        success: function (data) {
            let newLine;

            console.log(data);

            for (const app of data) {
                newLine = "";

                newLine += `
                    <td class="column1" id="app-${app.name}">
                        <div class="appcard">
                            ${app.name}`;

                switch (app.status) {
                    case 1:
                        newLine += `
                            <button class="appbutton started" onclick="javascript:stopApp('${app.name}')">
                                &#x23FC;
                            </button>`;
                        break;
                    case 84:
                        newLine += `
                            <button class="appbutton stopped" onclick="javascript:startApp('${app.name}')">
                                &#x23FC;
                            </button>`;
                        break;
                    case -1:
                        newLine += `
                            <button class="appbutton unknown" onclick="javascript:startApp('${app.name}')">
                                &#x23FC;
                            </button>`;
                        break;
                    default:
                        newLine += `
                            <button class="appbutton disabled" onclick="javascript:startApp('${app.name}')" disabled>
                                &#x23FC;
                            </button>`;
                        break;
                }

                newLine += `
                            <br />
                            <br />
                            ${app.description}
                        </div>
                    </td>`;

                lines.innerHTML += newLine;
            }
        },
    });
}

function startApp(appName) {
    $.ajax({
        type: "POST",
        url: "start",
        data: { appName: appName },
        success: () => {
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
        url: "stop",
        data: { appName: appName },
        success: () => {
            setTimeout(updateList(), 1000);
        },
        error: function (err) {
            throw new Error(err);
        },
    });
}
