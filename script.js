let host = localStorage.getItem("sideloadServer");
let currentPath = "/";
let itemList = [];

getFileList();

async function getFileList() {
    itemList = [];
    if(host != "") {
        let url = new URL("https://files.picozen.app");
        url.pathname = currentPath;
        url.searchParams.set("host", host);

        let res = await fetch(url);
        let data = await res.json();

        if(currentPath != "/" && currentPath != "") {
            let backPath = currentPath.split("/");
            backPath.pop();
            backPath = backPath.join("/");

            itemList.push({
                type: "dir",
                name: "../",
                path: backPath,
                size: 0,
                lastUpdated: undefined,
            });
        }

        for(let dir of data.dirs) {
            itemList.push({
                type: "dir",
                name: dir.name,
                path: dir.path,
                size: dir.size,
            });
        }
        for(let file of data.files) {
            itemList.push({
                type: "file",
                name: file.name,
                path: file.path,
                size: file.size,
                date: file.date,
            });
        }
    }

    renderFileList();
}

function renderFileList() {
    document.querySelector("#sideload-list").innerHTML = "";

    if(itemList.length == 0) {
        document.querySelector("#sideload-list").style.display = "none";
        document.querySelector("#sideload-error").style.display = "grid";
        if(host == "") {
            document.querySelector("#sideload-error > span").innerText = "A sideload server has not been set in settings";
        } else {
            document.querySelector("#sideload-error > span").innerText = "No files found";
        }
        return;
    }
    document.querySelector("#sideload-list").style.display = "block";
    document.querySelector("#sideload-error").style.display = "none";


    for(let item of itemList) {
        let div = document.createElement("div");

        div.classList.add("sideload-item");
        div.classList.add(item.type);

        let name = document.createElement("span");
        name.innerText = item.name;
        name.classList.add("name");
        div.appendChild(name);

        let modified = document.createElement("span");
        if(item.date != undefined && item.date != null) {
            modified.innerText = new Date(item.date).toLocaleString();
        }
        modified.classList.add("modified");
        div.appendChild(modified);

        let size = document.createElement("span");
        size.innerText = bytesReadable(item.size);
        size.classList.add("size");
        div.appendChild(size);

        if(item.type == "dir") {
            div.addEventListener('click', () => {
                currentPath = item.path;
                getFileList();
            });
        } else {
            div.addEventListener('click', () => {
                let url = new URL("https://files-pico.doesnt-like.me");
                url.pathname = item.path;
                url.searchParams.set("host", host);
                url.searchParams.set("download", 1)
                downloadFile(url, item.name);
            });
        }

        document.querySelector("#sideload-list").append(div);
    }
}

function bytesReadable(bytes) {
    const byteTypes = ["KB", "MB", "GB", "TB", "PB"];
    let currentByteType = "B";
    for (let byteType of byteTypes) {
        if (bytes < 1024)
            break;

        currentByteType = byteType;
        bytes = bytes / 1024;
    }

    return `${Math.round(bytes*100)/100} ${currentByteType}`;
}

function downloadFile(url, fileName){
    const aElement = document.createElement('a');
    aElement.setAttribute('download', fileName);
    aElement.href = url;
    aElement.setAttribute('download', true);
    aElement.click();
};

document.querySelector("#settings-btn").addEventListener('click', () => {
    document.querySelector("#sideload-server-input").value = host;
    document.querySelector("#settings-overlay").style.display = "grid";
});
document.querySelector("#settings-overlay-backdrop").addEventListener('click', () => {
    document.querySelector("#settings-overlay").style.display = "none";
});
document.querySelector("#settings > .close").addEventListener('click', () => {
    document.querySelector("#settings-overlay").style.display = "none";
});

document.querySelector("#sideload-server-input").addEventListener('keydown', ev => {
    if(ev.key == "Enter")
        changeServer();
});
document.querySelector("#sideload-server-change").addEventListener('click', changeServer);

function changeServer() {
    host = document.querySelector("#sideload-server-input").value;
    localStorage.setItem("sideloadServer", host);
    getFileList();
}