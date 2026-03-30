/**
 
 * preventDefault
 * headerFixed
 * handleFooter
 * spliting
 * effect_button
 * loadProduct
 * showform
 * hoverTabs
 * infiniteslide
 * showInput
 * wishList
 * fillterIso
 * tabSlide
 * video
 * hoverActive
 * oneNavOnePage
 * sendmail
 * slideBarPrivacy
 * goTop
 
**/

(function ($) {
    ("use strict");

    /* preventDefault
    -------------------------------------------------------------------------*/
    const preventDefault = () => {
        $(".link-no-action").on("click", function (e) {
            e.preventDefault();
        });
    };

    /* header_sticky
    -------------------------------------------------------------------------------------*/
    const headerFixed = function () {
        let lastScrollTop = 0;
        const delta = 10;
        const $header = $(".header-sticky");
        let navbarHeight = $header.outerHeight();

        let resizeTimeout;
        $(window).on("resize", function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                navbarHeight = $header.outerHeight();
            }, 100);
        });
        $(window).on("scroll", function () {
            let scrollTop = $(this).scrollTop();

            if (scrollTop < 350) {
                $header.removeClass("is-sticky");
                return;
            }

            if (scrollTop > lastScrollTop + delta) {
                $header.removeClass("is-sticky");
                $(".sticky-top").css("top", "0");
            } else if (scrollTop < lastScrollTop - delta) {
                $header.addClass("is-sticky");
                $(".sticky-top").css("top", `${15 + navbarHeight}px`);
            }

            lastScrollTop = scrollTop;
        });
    };

    /* headerFixed
    -------------------------------------------------------------------------------------*/
    const headerFixed2 = () => {
        const $header = $(".header-fixed");
        if (!$header.length) return;
        $(window).on("scroll", () => {
            $header.toggleClass("is-fixed", $(window).scrollTop() >= 350);
        });
    };

    /* footer accordion
    -------------------------------------------------------------------------*/
    var handleFooter = function () {
        var footerAccordion = function () {
            var args = { duration: 250 };
            $(".footer-heading-mobile").on("click", function () {
                $(this).parent(".footer-col-block").toggleClass("open");
                if (!$(this).parent(".footer-col-block").is(".open")) {
                    $(this).next().slideUp(args);
                } else {
                    $(this).next().slideDown(args);
                }
            });
        };
        function handleAccordion() {
            if (matchMedia("only screen and (max-width: 767px)").matches) {
                if (
                    !$(".footer-heading-mobile").data("accordion-initialized")
                ) {
                    footerAccordion();
                    $(".footer-heading-mobile").data(
                        "accordion-initialized",
                        true
                    );
                }
            } else {
                $(".footer-heading-mobile").off("click");
                $(".footer-heading-mobile")
                    .parent(".footer-col-block")
                    .removeClass("open");
                $(".footer-heading-mobile").next().removeAttr("style");
                $(".footer-heading-mobile").data(
                    "accordion-initialized",
                    false
                );
            }
        }
        handleAccordion();
        window.addEventListener("resize", function () {
            handleAccordion();
        });
    };

    /* effect_button
    -------------------------------------------------------------------------*/
    var effect_button = () => {
        $(".tf-btn").each(function () {
            var button_width = $(this).outerWidth();
            $(this).css("--button-width", button_width + "px");
        });
        $(".tf-btn")
            .on("mouseenter", function (e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find(".bg-effect").css({ top: relY, left: relX });
            })
            .on("mouseout", function (e) {
                var parentOffset = $(this).offset(),
                    relX = e.pageX - parentOffset.left,
                    relY = e.pageY - parentOffset.top;
                $(this).find(".bg-effect").css({ top: relY, left: relX });
            });
    };

    /* showform
    -------------------------------------------------------------------------------------*/
    var showform = function () {
        if ($(".show-form").length > 0) {
            $(".show-form").on("click", function (e) {
                e.preventDefault();
                $(this).toggleClass("click");
                $(".wd-search-form").toggleClass("show");
                $(".wg-filter").toggleClass("active");
            });
        }
    };

    /* hoverTabs 
    -------------------------------------------------------------------------------------*/
    var hoverTabs = function () {
        if (!$(".tabs-hover-wrap").length) return;
        $(".tabs-hover-wrap").each(function () {
            const $wrapper = $(this);
            const $tabBtns = $wrapper.find(".item");
            const $tabContents = $wrapper.find(".tab-content");
            let hoverTimer;
            $tabBtns
                .on("mouseenter", function () {
                    const $this = $(this);
                    hoverTimer = setTimeout(function () {
                        const tabId = $this.data("tab");
                        if (!$this.hasClass("active")) {
                            $tabBtns.removeClass("active");
                            $this.addClass("active");
                            $tabContents.removeClass("active");
                            $wrapper.find(`#${tabId}`).addClass("active");
                        }
                    }, 100);
                })
                .on("mouseleave", function () {
                    clearTimeout(hoverTimer);
                });
            $tabBtns.first().addClass("active");
            $tabContents.first().addClass("active");
        });
    };

    /* infiniteslide
    -------------------------------------------------------------------------------------*/
    const infiniteslide = () => {
        if ($(".infiniteslide").length > 0) {
            $(".infiniteslide").each(function () {
                var $this = $(this);
                var style = $this.data("style") || "left";
                var clone = $this.data("clone") || 4;
                var speed = $this.data("speed") || 50;
                $this.infiniteslide({
                    speed: speed,
                    direction: style,
                    clone: clone,
                });
            });
        }
    };

    /* fillterIso
    -------------------------------------------------------------------------------------*/
    const fillterIso = () => {
        if (!$(".fillters-wrap").length) return;
        var $grid = $(".fillters-wrap").isotope({
            itemSelector: ".item-fillter",
            layoutMode: "fitRows",
        });
        $(".tf-filters button").on("click", function () {
            $(".tf-filters button").removeClass("active");
            $(this).addClass("active");
            var filterValue = $(this).attr("data-filter");
            $grid.isotope({ filter: filterValue });
        });
    };

    /* video
    -------------------------------------------------------------------------------------*/
    var video = function () {
        if ($("div").hasClass("widget-video")) {
            $(".popup-youtube").magnificPopup({
                type: "iframe",
            });
        }
    };

    /* goTop
    -------------------------------------------------------------------------------------*/
    const goTop = () => {
        if ($("div").hasClass("progress-wrap")) {
            var progressPath = document.querySelector(".progress-wrap path");
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition =
                progressPath.style.WebkitTransition = "none";
            progressPath.style.strokeDasharray = pathLength + " " + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition =
                progressPath.style.WebkitTransition =
                    "stroke-dashoffset 10ms linear";
            var updateprogress = function () {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength) / height;
                progressPath.style.strokeDashoffset = progress;
            };
            updateprogress();
            $(window).scroll(updateprogress);
            var offset = 200;
            var duration = 0;
            jQuery(window).on("scroll", function () {
                if (jQuery(this).scrollTop() > offset) {
                    jQuery(".progress-wrap").addClass("active-progress");
                } else {
                    jQuery(".progress-wrap").removeClass("active-progress");
                }
            });
            jQuery(".progress-wrap").on("click", function (event) {
                event.preventDefault();
                jQuery("html, body").animate({ scrollTop: 0 }, duration);
                return false;
            });
        }
    };

    /* auto popup
    ------------------------------------------------------------------------------------- */
    var autoPopup = function () {
        if($("body").hasClass("popup-loader")){
        if ($(".auto-popup").length > 0) {
            let showPopup = sessionStorage.getItem("showPopup");
            if (!JSON.parse(showPopup)) {
            setTimeout(function () {
                $(".auto-popup").modal('show');
            }, 3000);
            }
        }
        $(".btn-hide-popup").on("click", function () {
            sessionStorage.setItem("showPopup", true);
        });
        };

    };

    /* check_map 
    -------------------------------------------------------------------------------------*/ 
    var check_map = function () {
        $(document).ready(function () {
            if ($('#check-map').is(':checked')) {
                $('.wg-map').show();
            } else {
                $('.wg-map').hide();
            }
        });
        $('#check-map').on('change', function () {
            $('.wg-map').toggle(this.checked);
            $('.wrap-layout-map').toggleClass("hide-map");
        });
    }

    /* Handle Sidebar Filter 
    -------------------------------------------------------------------------------------*/ 
    var handleSidebarFilter = function () {
        $(".filterShop").click(function () {
        if ($(window).width() < 1200) {
            $(".filter_canvas,.overlay-filter").addClass("show");
        }
        });
        $(".close-canvas-filter ,.overlay-filter").click(function () {
            $(".filter_canvas,.overlay-filter").removeClass("show");
        });
    };

    // Dom Ready
    $(function () {
        check_map();
        preventDefault();
        headerFixed();
        headerFixed2();
        handleFooter();
        effect_button();
        showform();
        hoverTabs();
        infiniteslide();
        fillterIso();
        video();
        goTop();
        autoPopup();
        handleSidebarFilter();
    });
})(jQuery);
