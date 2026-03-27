
/**
  * Range Two Price
  * Filter Products
  * Filter Sort 
  * Switch Layout
  * Handle Sidebar Filter
  * Handle Dropdown Filter
 */
(function ($) {
    "use strict";
  

  
    /* Filter Products
    -------------------------------------------------------------------------------------*/
    var filterProducts = function () {
      const priceSlider = document.getElementById("price-value-range");
    
      const minPrice = parseInt(priceSlider.dataset.min);
      const maxPrice = parseInt(priceSlider.dataset.max);
    
      const filters = {
        minPrice: minPrice,
        maxPrice: maxPrice,
        size: null,
        color: null,
        availability: null,
        brands: null, 
        sale: false,
      };
    
      priceSlider.noUiSlider.on("update", function (values) {
        filters.minPrice = parseInt(values[0]);
        filters.maxPrice = parseInt(values[1]);
    
        $("#price-min-value").text(filters.minPrice);
        $("#price-max-value").text(filters.maxPrice);
    
        applyFilters();
        updateMetaFilter();
      });
    
      $('input[name="availability"]').change(function () {
        filters.availability =
          $(this).attr("id") === "inStock" ? "In stock" : "Out of stock";
        applyFilters();
        updateMetaFilter();
      });
    
      $('input[name="brand"]').change(function () {
        filters.brands = $(this).attr("id");
        applyFilters();
        updateMetaFilter();
      });
    
      $('input[name="color"]').change(function () {
        filters.color = $(this).attr("id");
        applyFilters();
        updateMetaFilter();
      });
    
      $('input[name="size"]').change(function () {
        filters.size = $(this).attr("id");
        applyFilters();
        updateMetaFilter();
      });
    
      $(".shop-sale-text").click(function () {
        filters.sale = !filters.sale;
        $(this).toggleClass("active", filters.sale);
        applyFilters();
        updateMetaFilter();
      });
    
      function updateMetaFilter() {
        const appliedFilters = $("#applied-filters");
        const metaFilterShop = $(".meta-filter-shop");
        appliedFilters.empty();
    
        if (filters.availability) {
          appliedFilters.append(
            `<span class="filter-tag">${filters.availability} <span class="remove-tag icon-close" data-filter="availability"></span></span>`
          );
        }
        if (filters.size) {
          appliedFilters.append(
            `<span class="filter-tag">${filters.size} <span class="remove-tag icon-close" data-filter="size"></span></span>`
          );
        }
        if (filters.minPrice > minPrice || filters.maxPrice < maxPrice) {
          appliedFilters.append(
            `<span class="filter-tag">$${filters.minPrice} - $${filters.maxPrice} <span class="remove-tag icon-close" data-filter="price"></span></span>`
          );
        }
        if (filters.color) {
          const colorElement = $(`input[name="color"][value='${filters.color}']`);
          const backgroundClass = colorElement
            .attr("class") 
            .split(" ") 
            .find((cls) => cls.startsWith("bg_")); 
          const line = backgroundClass === "bg_white" ? "border-line-dark" : "";
          appliedFilters.append(
            `<div class="filter-tag color-tag">
                <span class="color ${backgroundClass} ${line}"></span>
                ${filters.color}
                <span class="remove-tag icon-close" data-filter="color"></span>
            </div>`
          );
        }
        if (filters.brands) { 
          appliedFilters.append(
            `<span class="filter-tag">${filters.brands} <span class="remove-tag icon-close" data-filter="brand"></span></span>`
          );
        }
  
        if (filters.sale) {
          appliedFilters.append(
            `<span class="filter-tag on-sale">On Sale <span class="remove-tag icon-close" data-filter="sale"></span></span>`
          );
        }
    
        const hasFiltersApplied = appliedFilters.children().length > 0;
        metaFilterShop.toggle(hasFiltersApplied);
    
        $("#remove-all").toggle(hasFiltersApplied);
      }
    
      $("#applied-filters").on("click", ".remove-tag", function () {
        const filterType = $(this).data("filter");
    
        if (filterType === "size") {
          filters.size = null;
          $('input[name="size"]').prop("checked", false);
        }
        if (filterType === "color") {
          filters.color = null;
          $('input[name="color"]').prop("checked", false);
        }
        if (filterType === "availability") {
          filters.availability = null;
          $('input[name="availability"]').prop("checked", false);
        }
        if (filterType === "brand") {
          filters.brands = null; 
          $('input[name="brand"]').prop("checked", false);
        }
        if (filterType === "price") {
          filters.minPrice = minPrice;
          filters.maxPrice = maxPrice;
          priceSlider.noUiSlider.set([minPrice, maxPrice]);
        }
        if (filterType === "sale") {
          filters.sale = false;
          $(".shop-sale-text").removeClass("active");
        }
    
        applyFilters();
        updateMetaFilter();
      });
    
      $("#remove-all,#reset-filter").click(function () {
        filters.size = null;
        filters.color = null;
        filters.availability = null;
        filters.brands = null; 
        filters.minPrice = minPrice;
        filters.maxPrice = maxPrice;
        filters.sale = false;
    
        $(".shop-sale-text").removeClass("active");
        $('input[name="brand"]').prop("checked", false);
        $('input[name="availability"]').prop("checked", false);
        $('input[name="color"]').prop("checked", false);
        $('input[name="size"]').prop("checked", false);
        priceSlider.noUiSlider.set([minPrice, maxPrice]);
    
        applyFilters();
        updateMetaFilter();
      });
    
      function applyFilters() {
        let visibleProductCountGrid = 0;
        let visibleProductCountList = 0;
    
        $(".wrapper-shop .card-product").each(function () {
          const product = $(this);
          let showProduct = true;
    
          const priceText = product.find(".current-price").text().replace("$", "");
          const price = parseFloat(priceText);
    
          if (price < filters.minPrice || price > filters.maxPrice) {
            showProduct = false;
          }
          if (
            filters.size &&
            !product.find(`.size-item:contains('${filters.size}')`).length
          ) {
            showProduct = false;
          }
          if (
            filters.color &&
            !product.find(`.color-swatch:contains('${filters.color}')`).length
          ) {
            showProduct = false;
          }
          if (filters.availability) {
            const availabilityStatus = product.data("availability");
            if (filters.availability !== availabilityStatus) {
              showProduct = false;
            }
          }
          if (filters.sale && !product.find(".on-sale-wrap").length) {
            showProduct = false;
          }
          if (filters.brands) { 
            const brandId = product.attr("data-brand");
            if (filters.brands !== brandId) {
              showProduct = false;
            }
          }
    
          product.toggle(showProduct);
    
          if (showProduct) {
            if (product.hasClass("grid")) {
              visibleProductCountGrid++;
            } else if (product.hasClass("list-layout")) {
              visibleProductCountList++;
            }
          }
        });
    
        $("#product-count-grid").html(
          `<span class="count">${visibleProductCountGrid}</span> Products Found`
        );
        $("#product-count-list").html(
          `<span class="count">${visibleProductCountList}</span> Products Found`
        );
        updateLastVisibleItem();
    
        if (visibleProductCountGrid >= 12 || visibleProductCountList >= 12) {
          $(".wg-pagination,.tf-loading").show();
        } else {
          $(".wg-pagination,.tf-loading").hide();
        }
      }
    
      function updateLastVisibleItem() {
        setTimeout(() => {
          $(".card-product.list-layout").removeClass("last");
          const lastVisible = $(".card-product.list-layout:visible").last();
          if (lastVisible.length > 0) {
            lastVisible.addClass("last");
          }
        }, 50);
      }
    };
    
  
    $(function () {
    //   filterProducts();
    });
  })(jQuery);
  
  