if ($(".sw-layout").length > 0) {
    $(".sw-layout").each(function () {
        var tfSwCategories = $(this);
        var swiperContainer = tfSwCategories.find(".swiper");
        if (swiperContainer.length === 0) return;

        var preview = swiperContainer.data("preview") || 1;
        var screenXl = swiperContainer.data("screen-xl") || preview;
        var tablet = swiperContainer.data("tablet") || 1;
        var mobile = swiperContainer.data("mobile") || 1;
        var mobileSm = swiperContainer.data("mobile-sm") || mobile;
        var spacing = swiperContainer.data("space") || 0;
        var spacingMd = swiperContainer.data("space-md") || spacing;
        var spacingLg = swiperContainer.data("space-lg") || spacing;
        var spacingXl = swiperContainer.data("space-xl") || spacingLg;
        var perGroup = swiperContainer.data("pagination") || 1;
        var perGroupMd = swiperContainer.data("pagination-md") || 1;
        var perGroupLg = swiperContainer.data("pagination-lg") || 1;
        var center = swiperContainer.data("slide-center") || false;
        var initSlide = swiperContainer.data("init-slide") || 0;
        var autoplay =
            swiperContainer.data("autoplay") == true ||
            swiperContainer.data("autoplay") == "true";
        var paginationType = swiperContainer.data("progressbar") || "bullets";
        var loop =
            swiperContainer.data("loop") == true ||
            swiperContainer.data("loop") == "true";
        var nextBtn = tfSwCategories.find(".nav-next-layout")[0] || null;
        var prevBtn = tfSwCategories.find(".nav-prev-layout")[0] || null;
        var progressbar =
            tfSwCategories.find(".sw-pagination-layout")[0] ||
            tfSwCategories.find(".sw-progress-layout")[0] ||
            null;
        var fractionEl = tfSwCategories.find(".sw-fraction-layout")[0] || null;
        var swiper = new Swiper(swiperContainer[0], {
            slidesPerView: mobile,
            spaceBetween: spacing,
            speed: 1000,
            centeredSlides: center,
            initialSlide: initSlide,
            loop: loop,
            observer: true,
            observeParents: true,
            autoplay: autoplay
                ? {
                      delay: 3000,
                      disableOnInteraction: false,
                  }
                : false,
            pagination: progressbar
                ? {
                      el: progressbar,
                      clickable: true,
                      type: paginationType,
                  }
                : false,
            navigation: {
                nextEl: nextBtn,
                prevEl: prevBtn,
            },
            breakpoints: {
                575: {
                    slidesPerView: mobileSm,
                    spaceBetween: spacing,
                    slidesPerGroup: perGroup,
                },
                768: {
                    slidesPerView: tablet,
                    spaceBetween: spacingMd,
                    slidesPerGroup: perGroupMd,
                },
                992: {
                    slidesPerView: preview,
                    spaceBetween: spacingLg,
                    slidesPerGroup: perGroupLg,
                },
                1200: {
                    slidesPerView: screenXl,
                    spaceBetween: spacingXl,
                    slidesPerGroup: perGroupLg,
                },
            },
        });

        if (fractionEl) {
            swiper.on("init slideChange", function () {
                const current = String(swiper.realIndex + 1).padStart(2, "0");
                const totalSlides = String(
                    swiperContainer.find(
                        ".swiper-slide:not(.swiper-slide-duplicate)"
                    ).length
                ).padStart(2, "0");
                fractionEl.innerHTML = `<span class="current">${current}</span> / <span class="total">${totalSlides}</span>`;
            });
            swiper.emit("init");
        }
    });
}

var pagithumbs = new Swiper(".gallery-sw-thumbs", {
    spaceBetween: 20,
    slidesPerView: "auto",
    freeMode: true,
    watchSlidesProgress: true,
});
  
var swiperSingle = new Swiper(".gallery-sw-single", {
    spaceBetween: 20,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    speed: 500,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    thumbs: {
      swiper: pagithumbs,
    },
});


if ($(".thumbs-sw-pagi").length > 0) {
    var preview = $(".thumbs-sw-pagi").data("preview");
    var spacing = $(".thumbs-sw-pagi").data("space");
    var pagithumbs = new Swiper(".thumbs-sw-pagi", {
        spaceBetween: spacing,
        slidesPerView: 2,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            767: {
                slidesPerView: preview,
            },
        },
    });
}

if ($(".sw-single").length > 0) {
    var loop = $(".sw-single").data("loop") || false;
    var swiperSingle = new Swiper(".sw-single", {
        spaceBetween: 16,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        },
        speed: 500,
        effect: "fade",
        fadeEffect: {
            crossFade: true,
        },
        thumbs: {
            swiper: pagithumbs,
        }
    });
}
