
function AjaxCon(url, callback) {
    var xhr = this.getXHR();

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                callback(xhr.responseText);
            }
            else {
                console.log("Läsfel, status: " + xhr.status);
            }
        }
    }
    xhr.open("get", url, true);
    xhr.send(null);
}

AjaxCon.prototype.getXHR = function () {
    var xhr = null;
    try {
        xhr = new XMLHttpRequest();
    }
    catch (error) {
        try {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (error) {
            throw new error("No XHR object available");
        }
    }
    return xhr;
}

