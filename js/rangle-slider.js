(function ($) {
  "use strict";

  var rangeSliderTwo = function () {
    if ($("#price-value-range").length > 0) {
      var skipSlider = document.getElementById("price-value-range");
      var skipValues = [
        document.getElementById("price-min-value"),
        document.getElementById("price-max-value"),
      ];

      noUiSlider.create(skipSlider, {
        start: [0, 10000],
        connect: true,
        step: 1,
        range: {
          min: 0,
          max: 10000,
        },
        format: {
          from: function (value) {
            return parseInt(value);
          },
          to: function (value) {
            return parseInt(value);
          },
        },
      });

      skipSlider.noUiSlider.on("update", function (val, e) {
        skipValues[e].innerText = val[e];
      });
    }
  };

  var rangeSliderTwo_2 = function () {
    if ($("#price-value-range-2").length > 0) {
      var skipSlider = document.getElementById("price-value-range-2");
      var skipValues = [
        document.getElementById("price-min-value-2"),
        document.getElementById("price-max-value-2"),
      ];

      noUiSlider.create(skipSlider, {
        start: [0, 10000],
        connect: true,
        step: 1,
        range: {
          min: 0,
          max: 10000,
        },
        format: {
          from: function (value) {
            return parseInt(value);
          },
          to: function (value) {
            return parseInt(value);
          },
        },
      });

      skipSlider.noUiSlider.on("update", function (val, e) {
        skipValues[e].innerText = val[e];
      });
    }
  };



  $(function () {
    rangeSliderTwo();
    rangeSliderTwo_2();
  });
})(jQuery);
