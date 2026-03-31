
document.addEventListener("DOMContentLoaded", function() {
  var PLANS = [
    { name: "Arcade",   icon: "🕹️",  monthly: 9,  yearly: 90,  freeMonths: "2 months free" },
    { name: "Advanced", icon: "🎮",  monthly: 12, yearly: 120, freeMonths: "2 months free" },
    { name: "Pro",      icon: "👑",  monthly: 15, yearly: 150, freeMonths: "2 months free" }
  ];

  var ADDONS = [
    { id: "online",  name: "Online service",      desc: "Access to multiplayer games",      monthly: 1, yearly: 10 },
    { id: "storage", name: "Larger storage",      desc: "Extra 1TB of cloud save",          monthly: 2, yearly: 20 },
    { id: "profile", name: "Customizable profile", desc: "Custom theme on your profile",    monthly: 2, yearly: 20 }
  ];

  var state = {
    currentStep:    1,
    totalSteps:     4,
    isYearly:       false,
    selectedPlan:   0,
    selectedAddons: []
  };

  var btnNext       = document.getElementById("btn-next");
  var btnBack       = document.getElementById("btn-back");
  var navButtons    = document.getElementById("nav-buttons");
  var billingToggle = document.getElementById("billing-toggle");
  var lblMonthly    = document.getElementById("lbl-monthly");
  var lblYearly     = document.getElementById("lbl-yearly");
  var plansGrid     = document.getElementById("plans-grid");
  var addonsList    = document.getElementById("addons-list");
  var summaryBox    = document.getElementById("summary-box");
  var totalLabel    = document.getElementById("total-label");
  var totalPrice    = document.getElementById("total-price");
  var thankyou      = document.getElementById("thankyou");

  var criticalEls = {
    "btn-next":       btnNext,
    "btn-back":       btnBack,
    "nav-buttons":    navButtons,
    "billing-toggle": billingToggle,
    "plans-grid":     plansGrid,
    "addons-list":    addonsList,
    "summary-box":    summaryBox,
    "thankyou":       thankyou
  };

  for (var id in criticalEls) {
    if (!criticalEls[id]) {
      console.error("MISSING ELEMENT: #" + id + " — check your HTML");
    }
  }

  function buildPlans() {
    plansGrid.innerHTML = "";

    PLANS.forEach(function(plan, index) {
      var price = state.isYearly
        ? "$" + plan.yearly  + "/yr"
        : "$" + plan.monthly + "/mo";

      var card = document.createElement("div");
      card.className = "plan-card" + (index === state.selectedPlan ? " selected" : "");

      card.innerHTML = `
        <div class="plan-icon">${plan.icon}</div>
        <div class="plan-info">
          <div class="plan-name">${plan.name}</div>
          <div class="plan-price">${price}</div>
          <div class="plan-free" style="display:${state.isYearly ? 'block' : 'none'}">
            ${plan.freeMonths}
          </div>
        </div>
      `;

      card.addEventListener("click", function() {
        state.selectedPlan = index;
        buildPlans();
      });

      plansGrid.appendChild(card);
    });
  }


  function buildAddons() {
    addonsList.innerHTML = "";

    ADDONS.forEach(function(addon) {
      var price = state.isYearly
        ? "+$" + addon.yearly  + "/yr"
        : "+$" + addon.monthly + "/mo";

      var isSelected = state.selectedAddons.indexOf(addon.id) !== -1;

      var card = document.createElement("div");
      card.className = "addon-card" + (isSelected ? " selected" : "");

      card.innerHTML = `
        <div class="addon-check">${isSelected ? "✓" : ""}</div>
        <div class="addon-text">
          <div class="addon-name">${addon.name}</div>
          <div class="addon-desc">${addon.desc}</div>
        </div>
        <div class="addon-price">${price}</div>
      `;

      card.addEventListener("click", function() {
        var idx = state.selectedAddons.indexOf(addon.id);
        if (idx === -1) {
          state.selectedAddons.push(addon.id);
        } else {
          state.selectedAddons.splice(idx, 1);
        }
        buildAddons();
      });

      addonsList.appendChild(card);
    });
  }

  function buildSummary() {
    var plan      = PLANS[state.selectedPlan];
    var period    = state.isYearly ? "yr" : "mo";
    var planPrice = state.isYearly ? plan.yearly : plan.monthly;
    var addonsTotal = 0;

    var summaryHtml = `
      <div class="summary-plan">
        <div>
          <div class="summary-plan-name">
            ${plan.name} (${state.isYearly ? "Yearly" : "Monthly"})
          </div>
          <span class="summary-change" id="change-plan">Change</span>
        </div>
        <div class="summary-plan-price">$${planPrice}/${period}</div>
      </div>
    `;

    state.selectedAddons.forEach(function(id) {
      var addon = ADDONS.find(function(a) { return a.id === id; });
      if (!addon) return;
      var addonPrice = state.isYearly ? addon.yearly : addon.monthly;
      addonsTotal += addonPrice;
      summaryHtml += `
        <div class="summary-addon">
          <span>${addon.name}</span>
          <span>+$${addonPrice}/${period}</span>
        </div>
      `;
    });

    summaryBox.innerHTML = summaryHtml;

    document.getElementById("change-plan").addEventListener("click", function() {
      goToStep(2);
    });

    var total = planPrice + addonsTotal;
    totalLabel.textContent = "Total (per " + (state.isYearly ? "year" : "month") + ")";
    totalPrice.textContent = "+$" + total + "/" + period;
  } 

  function goToStep(step) {

    document.querySelectorAll(".step").forEach(function(el) {
      el.classList.remove("active");
    });

    document.querySelectorAll(".sitem").forEach(function(el) {
      el.classList.remove("active");
    });

    var targetStep = document.getElementById("step-" + step);
    if (!targetStep) {
      console.error("Missing element: #step-" + step + " — add it to your HTML");
      return;
    }
    targetStep.classList.add("active");

    var sitem = document.querySelector('.sitem[data-step="' + step + '"]');
    if (sitem) sitem.classList.add("active");

    state.currentStep = step;
    updateButtons();

    if (step === 4) buildSummary();
  }

  function updateButtons() {
    if (state.currentStep === 1) {
      btnBack.classList.add("hidden");
    } else {
      btnBack.classList.remove("hidden");
    }

    if (state.currentStep === state.totalSteps) {
      btnNext.textContent = "Confirm";
      btnNext.classList.add("confirm");
    } else {
      btnNext.textContent = "Next Step";
      btnNext.classList.remove("confirm");
    }
  }

  function validateStep1() {
    var name  = document.getElementById("name");
    var email = document.getElementById("email");
    var phone = document.getElementById("phone");
    var valid = true;

    if (name.value.trim() === "") {
      name.classList.add("invalid");
      document.getElementById("err-name").style.display = "block";
      valid = false;
    } else {
      name.classList.remove("invalid");
      document.getElementById("err-name").style.display = "none";
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      email.classList.add("invalid");
      document.getElementById("err-email").style.display = "block";
      valid = false;
    } else {
      email.classList.remove("invalid");
      document.getElementById("err-email").style.display = "none";
    }

    if (phone.value.trim() === "") {
      phone.classList.add("invalid");
      document.getElementById("err-phone").style.display = "block";
      valid = false;
    } else {
      phone.classList.remove("invalid");
      document.getElementById("err-phone").style.display = "none";
    }

    return valid;
  }

  btnNext.addEventListener("click", function() {

    if (state.currentStep === 1) {
      if (!validateStep1()) return;
    }

    if (state.currentStep === state.totalSteps) {
      document.querySelectorAll(".step").forEach(function(el) {
        el.classList.remove("active");
      });
      document.querySelectorAll(".sitem").forEach(function(el) {
        el.classList.remove("active");
      });
      thankyou.classList.add("active");
      navButtons.style.display = "none";
      return;
    }

    goToStep(state.currentStep + 1);
  });

  btnBack.addEventListener("click", function() {
    if (state.currentStep > 1) {
      goToStep(state.currentStep - 1);
    }
  });

  billingToggle.addEventListener("click", function() {
    state.isYearly = !state.isYearly;
    billingToggle.classList.toggle("yearly", state.isYearly);
    lblMonthly.classList.toggle("active", !state.isYearly);
    lblYearly.classList.toggle("active",   state.isYearly);
    buildPlans();
    buildAddons();
  });

  buildPlans();
  buildAddons();
  updateButtons();

});