async function onload() {
    let response = await fetch("/names.json");
    if (response.status == 200)
        document.getElementById("names").innerHTML = await response.text();

    response = await fetch("/CD.xml");
    if (response.status == 200)
        document.getElementById("cd").innerHTML = await response.text();
}
onload();