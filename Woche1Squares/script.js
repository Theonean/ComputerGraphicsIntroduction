window.addEventListener("DOMContentLoaded", () => {
    const linkList = document.getElementById("linkList");

    for (let i = 1; i <= 10; i++) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");

        link.href = `./${i}/index.html`;
        link.textContent = `Page ${i}`;
        listItem.appendChild(link);
        linkList.appendChild(listItem);
    }
});