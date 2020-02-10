document.addEventListener("DOMContentLoaded", function() {
  var dpicker = document.getElementById("datepicker");
  if(dpicker) {
    var today = document.querySelector(".today");
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      document.getElementById("preloader").classList.remove("active");
      document.getElementById("preloader").classList.add("hide");
      var times = document.getElementById("times");
      var htmlstring = this.response;
      times.innerHTML = htmlstring;
      var tixTrigger = document.querySelectorAll(".tix-trigger");
      if(tixTrigger.length > 0) {
        for(var k = 0;k < tixTrigger.length; k++) {
          tixTrigger[k].addEventListener("click", function(e) {
            document.querySelector("#form-btn").dataset.eventid = this.id.trim();
          });
        }
      }
      window.history.replaceState("","","?date=" + appDate);
    };
    function processxhr(dateIn) {
      var processDate = moment(dateIn,"YYYY-M-D");
      today.textContent = processDate.format("dddd, MMMM D, YYYY");
      var day = "d=" + processDate.date();
      var month = "m=" + processDate.month();
      var year = "y=" + processDate.year();
      xhr.open("GET", "/gettimes?" + day + "&" + month + "&" + year, true);
      xhr.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      xhr.onprogress = function () {
        document.getElementById("preloader").classList.add("active");
        document.getElementById("preloader").classList.remove("hide");
      };
      xhr.send();
    }
    var appDate = document.getElementById("datepicker").dataset.currentdate;
    processxhr(appDate);
    var dpickerarrow = document.getElementById("datepicker-arrow");
    var disabledates = JSON.parse(dpicker.dataset.disableddates);
    var enabledates = disabledates.enable;
    var $input = $("#datepicker").pickadate({
      disable: enabledates,
      onSet: function(instance) {
        if(instance.select) {
          var selectedDate = moment(instance.select);
          today.textContent = selectedDate.format("dddd, MMMM D, YYYY");
          appDate = selectedDate.format("YYYY-M-D");
          processxhr(appDate);
          dpickerarrow.textContent = "keyboard_arrow_down";
        }
      },
      onClose: function() {
        document.activeElement.blur();
      }
    });
    var picker = $input.pickadate("picker");
    document.getElementById("datepicker-wrapper").addEventListener("click", function(e) {
        e.stopPropagation();
        if(picker.get("open")) {
          picker.close()
          dpickerarrow.textContent = "keyboard_arrow_down";
        } else {
          picker.open();
          dpickerarrow.textContent = "keyboard_arrow_up";
        }
      
    });
  }
  var tixModal = document.getElementById("tix-modal");
  if(tixModal) {
    function triggerChange(el) {
      if ("createEvent" in document) {
          var evt = document.createEvent("HTMLEvents");
          evt.initEvent("change", false, true);
          el.dispatchEvent(evt);
      }
      else el.fireEvent("onchange");
    }
    M.Modal.init(tixModal);
    tixModal.querySelector("#form-btn").addEventListener("click", function(e) {
      var totaltix = parseInt(tixModal.querySelector("#total-input").value);
      if(totaltix > 0) {
        var base = this.dataset.urlbase.trim();
        var eventid = this.dataset.eventid.trim();
        var tix = this.dataset.tix.trim();
        window.location.href = base + eventid + tix;
      } else {
        var modalFooter = tixModal.querySelector(".modal-footer");
        M.toast({html: "Please add at least 1 ticket.", classes: "rounded white red-text"});
      }
    });
    var addTix = tixModal.querySelectorAll(".add-ticket");
    var removeTix = tixModal.querySelectorAll(".remove-ticket");
    for(var k = 0; k < addTix.length; k++) {
      removeTix[k].addEventListener("click", function(e) {
        var input = e.target.parentElement.nextElementSibling.querySelector("input");
        var val = parseInt(input.value);
        if(val > 0) {
          input.value = val - 1;
          triggerChange(input);
        }
      });
      addTix[k].addEventListener("click", function(e) {
        var input = e.target.parentElement.previousElementSibling.querySelector("input");
        input.value = parseInt(input.value) + 1;
        triggerChange(input);
      });
    }
  }
  var tixInput = document.querySelectorAll(".tix-input");
  if(tixInput.length > 0) {
    for(var i = 0; i < tixInput.length; i++) {
      tixInput[i].querySelector("input").addEventListener("change", function(e) {
        var total = 0;
        var tIndex = 1;
        var tId = "&tkt";
        var tUrl = "";
        var val = this.value;
        var parsed = parseInt(val);
        if(parsed < 0 || isNaN(parsed)) {
          this.value = 0;
        }
        for(var j = 0; j < tixInput.length; j++) {
          total += parseInt(tixInput[j].querySelector("input").value);
          tUrl += tId + (parseInt(tIndex) + j) + "=" + tixInput[j].querySelector("input").value;
        }
        document.getElementById("form-btn").dataset.tix = tUrl;
        document.getElementById("total-input").value = total;
      });
    }
  }
  var faqCollapsibles = document.querySelectorAll(".collapsible");
  if(faqCollapsibles.length > 0) {
    M.Collapsible.init(faqCollapsibles);
  }
});
