var timedTix = document.getElementById("bg");
function loadTimedPage() {

  document.querySelector("html").classList.add("bg");
  var body = document.querySelector("body");
  var metaView = document.createElement("meta");
  metaView.name = "viewport";
  metaView.content = "width=device-width,initial-scale=1.0";
  document.querySelector("head").appendChild(metaView);
  var usercss = document.createElement("link");
  usercss.rel = "stylesheet";
  usercss.href = "https://billgrahamtickets.nyhistory.org/css/bgbb.css";

  var links = document.head.querySelectorAll("link");
  for(var f = 0; f < links.length; f++) {
    var link = links[f];
    if(link.rel == "stylesheet" && link.href.includes("Webforms-User-Stylesheet")) {
      link.insertAdjacentElement("afterend",usercss);
      link.parentNode.removeChild(link);
    }
    if(link.rel == "ICON" || link.rel == "SHORTCUT ICON") {
      link.href="https://www.nyhistory.org/sites/default/files/nyhs2_favicon_0.ico";
    }
  }

  document.querySelector(".MS_footerWrapper").style.display = "none";
  document.querySelector(".MS_column_1").style.display = "none";
  document.getElementById("PC1749_ctl00_pnlFooterText").style.display = "none";
  var eventName = document.getElementById("PC1762_ctl00_labelEventName");
  if(eventName) eventName.style.display = "none";

  var headerWrapper = document.createElement("div");
  headerWrapper.classList.add("header-logo");
  var headerImage = document.createElement("img");
  headerImage.src = "https://billgrahamtickets.nyhistory.org/images/nyhsbg.png";
  headerWrapper.append(headerImage);
  document.querySelector(".MS_pageWrapper").prepend(headerWrapper);
  
  var signIn = document.querySelector(".BBModalEditLink");
  var signInTextEdit = signIn.textContent.substr(0,signIn.textContent.length-2);
  signIn.textContent = signInTextEdit;
  var priceList = document.getElementById("divPriceList");
  var cartButton = document.getElementById("PC1762_ctl00_buttonAddEventToCart");
  var calendarButton = document.createElement("a");
  var selectedDate = document.getElementById("PC1762_ctl00_labelEventDate");
  if(selectedDate) {
  var selectedDateText = selectedDate.textContent;
  var selectedDateSplit = selectedDateText.split(" ");
  var selectedDateReconstruct = selectedDateSplit[0] + " " + selectedDateSplit[1] + " " + selectedDateSplit[2] + " 2020";
  var selectedDate = new Date(selectedDateReconstruct);
  var year = selectedDate.getFullYear();
  var month = selectedDate.getMonth() + 1;
  var date = selectedDate.getDate();
  calendarButton.href = "https://billgrahamtickets.nyhistory.org?date=" + year + "-" + month + "-" + date;
  calendarButton.textContent = "Select Another Time";
  calendarButton.classList.add("time-button");
  var calendarWrapper = document.createElement("div");
  calendarWrapper.classList.add("MS_LoginButtonOuterContainer","time-container");
  calendarWrapper.append(cartButton);
  calendarWrapper.append(calendarButton);
  priceList.insertAdjacentElement("afterend",calendarWrapper);
  }
}
if(timedTix) {
  loadTimedPage();
}
document.addEventListener("DOMContentLoaded", function(){
var cartRow = document.querySelectorAll(".PaymentPart_CartRows");
var timedTix = 0;
if(cartRow.length > 0) {
  for(var n = 0; n < cartRow.length; n++) {
    var itemDRow = cartRow[n];
    var itemD = itemDRow.querySelector(".PaymentPart_CartDescriptionCell a");
    if(itemD) {
      itemD.textContent.includes("Bill Graham and the Rock & Roll Revolution - Timed-entry") ? timedTix++ : timedTix;
    }
  }
  if(timedTix > 0) {
    loadTimedPage();
  }
}
});
