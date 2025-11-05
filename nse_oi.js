((function () {
    if (window.location.hostname.indexOf("www.nseindia.com") === -1) {
        alert("This script should be run on https://www.nseindia.com");
        return;
    }
    var oiData;
    var priceDataMap = {};
    function doInit() {
        clearInterval(window["__oiServerRequestDebounceTimer"]);
        window["__oiServerRequestDebounceTimer"] = setTimeout(function () {
            var xhr1 = new XMLHttpRequest();
            xhr1.withCredentials = true;
            xhr1.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    oiData = JSON.parse(this.responseText);
                }
            });
            xhr1.open("GET", "https://www.nseindia.com/api/live-analysis-oi-spurts-underlyings");
            xhr1.setRequestHeader("accept", "*/*");
            xhr1.send();
            var xhr2 = new XMLHttpRequest();
            xhr2.withCredentials = true;
            xhr2.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    priceDataMap["advances"] = JSON.parse(this.responseText);
                }
            });
            xhr2.open("GET", "https://www.nseindia.com/api/live-analysis-advance");
            xhr2.setRequestHeader("accept", "*/*");
            xhr2.send();
            var xhr3 = new XMLHttpRequest();
            xhr3.withCredentials = true;
            xhr3.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    priceDataMap["declines"] = JSON.parse(this.responseText);
                }
            });
            xhr3.open("GET", "https://www.nseindia.com/api/live-analysis-decline");
            xhr3.setRequestHeader("accept", "*/*");
            xhr3.send();
            var xhr4 = new XMLHttpRequest();
            xhr4.withCredentials = true;
            xhr4.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    priceDataMap["unchanged"] = JSON.parse(this.responseText);
                }
            });
            xhr4.open("GET", "https://www.nseindia.com/api/live-analysis-unchanged");
            xhr4.setRequestHeader("accept", "*/*");
            xhr4.send();
            var checkDataReady = function () {
                if (oiData && priceDataMap["advances"] && priceDataMap["declines"] && priceDataMap["unchanged"]) {
                    processData();
                } else {
                    setTimeout(checkDataReady, 100);
                }
            };
            checkDataReady();
            function processData() {
                var oiChangeMap = {};
                JSON.stringify(oiData, function (k, v) {
                    if (v && (typeof v) === "object" && v["symbol"] && v["latestOI"]) {
                        oiChangeMap[v["symbol"]] = v;
                    }
                    return v;
                });
                var priceChangeMap = {};
                JSON.stringify(priceDataMap, function (k, v) {
                    if (v && (typeof v) === "object" && v["symbol"] && v["series"] === "EQ") {
                        priceChangeMap[v["symbol"]] = v;
                    }
                    return v;
                });
                var finalData = [];
                (oiData["data"] || []).forEach((rec) => {
                    if (priceChangeMap[rec["symbol"]]) {
                        finalData.push({
                            "symbol": rec["symbol"],
                            "currentPrice": priceChangeMap[rec["symbol"]]["lastPrice"],
                            "priceChange": priceChangeMap[rec["symbol"]]["pchange"],
                            "openInterest": oiChangeMap[rec["symbol"]]["latestOI"],
                            "oiChange": oiChangeMap[rec["symbol"]]["avgInOI"]
                        });
                    }
                });
                window["__oiScreenerWindow"].postMessage({ "msgType": "INTRADAY_OI_DATA", data: finalData }, "*");
            };
        }, 1000);
    }
    function getUUID() {
        var str = "abcdef0123456789";
        str += str + str;
        str += str + str;
        var randomStr = str.split("").sort(function () { return Math.random() - Math.random(); }).join("");
        var parts = [
            randomStr.substring(0, 8),
            randomStr.substring(8, 12),
            randomStr.substring(12, 16),
            randomStr.substring(16, 20),
            randomStr.substring(20, 32)
        ];
        return parts.join("-");
    }
    var w = 1400;
    var h = 840;
    var url = "https://oi-screener.github.io/?requestID=";
    if (localStorage.getItem("__screener_mode") === "dev") {
        url = "http://localhost:3000/?requestID=";
    }
    window["__oiScreenerWindow"] = window.open(url + getUUID(), "__intraDayOIScreener", "width=" + w + ",height=" + h + ",top=" + (screen.height - h - 100) / 2 + ",left=" + (screen.width - w) / 2);
    if (!window["__oiScreenerServer_messageListener"]) {
        window["__oiScreenerServer_messageListener"] = function (e) {
            if (e.data === "OI_CLIENT_RECEIVER_READY") {
                doInit();
            }
        };
    }
    window.removeEventListener("message", window["__oiScreenerServer_messageListener"], false);
    window.addEventListener("message", window["__oiScreenerServer_messageListener"], false);
})());