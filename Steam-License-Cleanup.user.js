// ==UserScript==
// @name         Steam License Cleanup
// @namespace    https://github.com/PatrickJnr/Steam-License-Cleanup/
// @version      1.0
// @description  Adds a button to remove Steam licenses related to trailers, teasers, demos, cinematics, PEGI, ESRB, or soundtracks, with a popup summary of removed licenses and a refresh option. Allows customization of keywords for filtering licenses. Also allows exporting the list of removed licenses to a file and shows a progress bar during cleanup, including rate limit status.
// @author       PatrickJnr
// @match        https://store.steampowered.com/account/licenses/
// @grant        none
// @updateURL    https://github.com/PatrickJnr/Steam-License-Cleanup/raw/main/Steam-License-Cleanup.user.js
// @downloadURL  https://github.com/PatrickJnr/Steam-License-Cleanup/raw/main/Steam-License-Cleanup.user.js
// ==/UserScript==

(function() {
    'use strict';

    let keywords = ["trailer", "teaser", "demo", "cinematic", "pegi", "esrb", "soundtrack"];

    const createButton = (text, title, onClick) => {
        const button = document.createElement("button");
        button.textContent = text;
        button.title = title;
        button.className = "steam-cleanup-button";
        Object.assign(button.style, {
            background: "linear-gradient(to bottom, #2a475e 5%, #1b2838 95%)",
            border: "1px solid #66c0f4",
            borderRadius: "4px",
            color: "#c7d5e0",
            fontSize: "14px",
            padding: "10px 20px",
            cursor: "pointer",
            margin: "10px",
            display: "inline-block",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "background 0.3s, color 0.3s, box-shadow 0.3s"
        });
        button.addEventListener("mouseover", () => {
            button.style.background = "#66c0f4";
            button.style.color = "#ffffff";
            button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
        });
        button.addEventListener("mouseout", () => {
            button.style.background = "linear-gradient(to bottom, #2a475e 5%, #1b2838 95%)";
            button.style.color = "#c7d5e0";
            button.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        });
        button.addEventListener("click", onClick);
        return button;
    };

    const insertButtons = (buttons) => {
        const pageContent = document.querySelector(".page_content_ctn");
        if (pageContent) {
            const buttonContainer = document.createElement("div");
            buttonContainer.style.textAlign = "center";
            buttonContainer.style.marginBottom = "20px";
            buttons.forEach(button => buttonContainer.appendChild(button));
            pageContent.parentNode.insertBefore(buttonContainer, pageContent);
        } else {
            console.error("Page content container not found. Button insertion failed.");
        }
    };

    const getAppIdsAndDetails = () => {
        const appIds = [];
        const removedDetails = [];
        const table = document.getElementsByClassName("account_table")[0];
        if (!table) {
            console.error("Account table not found.");
            return { appIds, removedDetails };
        }
        const rows = table.rows;
        const keywordRegex = new RegExp(`\\b(?:${keywords.join("|")})\\b`, "i");
        for (const row of rows) {
            const cell = row.cells[1];
            if (keywordRegex.test(cell.textContent)) {
                const packageId = /javascript:\s*RemoveFreeLicense\s*\(\s*(\d+)/.exec(cell.innerHTML);
                if (packageId !== null) {
                    const cleanText = cell.textContent.trim().replace(/[\r\n\t]+/g, " ");
                    const details = `${cleanText} (Package ID: ${packageId[1]})`;
                    removedDetails.push(details);
                    if (!appIds.includes(packageId[1])) appIds.push(packageId[1]);
                }
            }
        }
        return { appIds, removedDetails };
    };

    const createProgressBar = () => {
        const progressBarContainer = document.createElement("div");
        Object.assign(progressBarContainer.style, {
            width: "100%",
            backgroundColor: "#1b2838",
            borderRadius: "4px",
            marginTop: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
        });

        const progressBar = document.createElement("div");
        Object.assign(progressBar.style, {
            width: "0%",
            height: "20px",
            backgroundColor: "#66c0f4",
            borderRadius: "4px",
            textAlign: "center",
            lineHeight: "20px",
            color: "#ffffff"
        });

        progressBarContainer.appendChild(progressBar);
        return { progressBarContainer, progressBar };
    };

    const removeNextPackage = (appIds, removedDetails, i, button, progressBar) => {
        if (i >= appIds.length) {
            button.disabled = false;
            button.textContent = "Clean Up Licenses";
            progressBar.style.width = "100%";
            progressBar.textContent = "100%";
            if (removedDetails.length > 0) {
                showModal(removedDetails);
            } else {
                alert("No matching licenses were found to remove.");
            }
            return;
        }

        fetch("https://store.steampowered.com/account/removelicense", {
            headers: {
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"102\", \"Google Chrome\";v=\"102\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest"
            },
            referrer: "https://store.steampowered.com/account/licenses/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: `sessionid=${encodeURIComponent(window.g_sessionID)}&packageid=${appIds[i]}`,
            method: "POST",
            mode: "cors",
            credentials: "include"
        }).then(response => {
            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            if (data && data.success === 84) {
                console.log(`Rate limit exceeded. Retrying after delay...`);
                progressBar.style.backgroundColor = "#ffcc00";
                progressBar.textContent = "Rate limited. Retrying in 60 seconds...";
                setTimeout(() => {
                    progressBar.style.backgroundColor = "#66c0f4";
                    removeNextPackage(appIds, removedDetails, i, button, progressBar);
                }, 60000); // Retry after 60 seconds
            } else {
                console.log(`Removed: ${appIds[i]} (${i + 1}/${appIds.length})`);
                button.textContent = `Cleaning... (${i + 1}/${appIds.length})`;
                const progress = ((i + 1) / appIds.length) * 100;
                progressBar.style.width = `${progress}%`;
                progressBar.textContent = `${Math.round(progress)}%`;
                removeNextPackage(appIds, removedDetails, i + 1, button, progressBar);
            }
        }).catch(error => {
            console.error(`Network or parsing error: ${error}`);
            progressBar.style.backgroundColor = "#ff3300";
            progressBar.textContent = "Network error. Retrying in 60 seconds...";
            setTimeout(() => {
                progressBar.style.backgroundColor = "#66c0f4";
                removeNextPackage(appIds, removedDetails, i, button, progressBar);
            }, 60000); // Retry after 60 seconds on network error
        });
    };

    const showModal = (removedDetails) => {
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.backgroundColor = "#1b2838";
        modal.style.color = "#c7d5e0";
        modal.style.padding = "20px";
        modal.style.border = "1px solid #66c0f4";
        modal.style.borderRadius = "8px";
        modal.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.3)";
        modal.style.zIndex = "1000";
        modal.style.maxWidth = "80%";
        modal.style.maxHeight = "80%";
        modal.style.overflowY = "auto";
        modal.style.animation = "fadeIn 0.3s";

        const title = document.createElement("h2");
        title.textContent = "Removed Licenses";
        title.style.marginBottom = "20px";
        modal.appendChild(title);

        const list = document.createElement("ul");
        list.style.listStyleType = "none";
        list.style.padding = "0";
        removedDetails.forEach(detail => {
            const listItem = document.createElement("li");
            listItem.textContent = detail;
            listItem.style.marginBottom = "10px";
            list.appendChild(listItem);
        });
        modal.appendChild(list);

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.marginTop = "20px";
        closeButton.style.padding = "10px 20px";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "4px";
        closeButton.style.backgroundColor = "#66c0f4";
        closeButton.style.color = "#ffffff";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(modal);
        });
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
    };

    const showSettingsModal = () => {
        const modal = document.createElement("div");
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.backgroundColor = "#1b2838";
        modal.style.color = "#c7d5e0";
        modal.style.padding = "20px";
        modal.style.border = "1px solid #66c0f4";
        modal.style.borderRadius = "8px";
        modal.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.3)";
        modal.style.zIndex = "1000";
        modal.style.maxWidth = "80%";
        modal.style.maxHeight = "80%";
        modal.style.overflowY = "auto";
        modal.style.animation = "fadeIn 0.3s";

        const title = document.createElement("h2");
        title.textContent = "Settings";
        title.style.marginBottom = "20px";
        modal.appendChild(title);

        const textarea = document.createElement("textarea");
        textarea.value = keywords.join(", ");
        textarea.style.width = "100%";
        textarea.style.height = "100px";
        textarea.style.marginBottom = "20px";
        modal.appendChild(textarea);

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.style.marginRight = "10px";
        saveButton.style.padding = "10px 20px";
        saveButton.style.border = "none";
        saveButton.style.borderRadius = "4px";
        saveButton.style.backgroundColor = "#66c0f4";
        saveButton.style.color = "#ffffff";
        saveButton.style.cursor = "pointer";
        saveButton.addEventListener("click", () => {
            keywords = textarea.value.split(",").map(keyword => keyword.trim()).filter(keyword => keyword);
            document.body.removeChild(modal);
        });
        modal.appendChild(saveButton);

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.padding = "10px 20px";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "4px";
        closeButton.style.backgroundColor = "#66c0f4";
        closeButton.style.color = "#ffffff";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(modal);
        });
        modal.appendChild(closeButton);

        document.body.appendChild(modal);
    };

    const cleanupButton = createButton("Clean Up Licenses", "Click to remove licenses for trailers, teasers, demos, cinematics, PEGI, ESRB, and soundtracks", () => {
        const userConfirmed = confirm("Are you sure you want to clean up licenses?");
        if (!userConfirmed) return;

        const { appIds, removedDetails } = getAppIdsAndDetails();
        if (appIds.length > 0) {
            cleanupButton.disabled = true;
            cleanupButton.textContent = "Cleaning... (0/" + appIds.length + ")";
            const { progressBarContainer, progressBar } = createProgressBar();
            cleanupButton.parentNode.insertBefore(progressBarContainer, cleanupButton.nextSibling);
            removeNextPackage(appIds, removedDetails, 0, cleanupButton, progressBar);
        } else {
            alert("No matching licenses were found to remove.");
        }
    });

    const settingsButton = createButton("Settings", "Click to customize keywords for filtering licenses", showSettingsModal);

    insertButtons([cleanupButton, settingsButton]);
})();
