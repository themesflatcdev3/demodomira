(function ($) {
    "use strict";

    mapboxgl.accessToken = "pk.eyJ1IjoiaG9hbmdoYW5kbiIsImEiOiJjbTdsbTkydm8wZGpiMmxxcTdvdzVqbHd3In0.HUUli-jvI1ALTBuzSeKTpw";

    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-122.4194, 37.7749],
        zoom: 13,
        cooperativeGestures: true,
    });

    const properties = [
        {
            id: 1,
            address: "245 Elm Street, San Francisco, CA 94102",
            title: "Sunset Heights Estate",
            price: "$6640,00",
            per: "/SqFT",
            coordinates: [-122.4194, 37.7749],
            image: "images/house/house-1.jpg",
        },
        {
            id: 2,
            address: "72 Sunset Avenue, Los Angeles, California",
            title: "Villa del Mar Retreat, Malibu",
            price: "$250,00",
            per: "/month",
            coordinates: [-122.4094, 37.7849],
            image: "images/house/house-2.jpg",
        },
        {
            id: 3,
            address: "245 Elm Street, San Francisco, CA 94102",
            title: "Sunset Heights Estate",
            price: "$6640,00",
            per: "/SqFT",
            coordinates: [-122.4294, 37.7649],
            image: "images/house/house-3.jpg",
        },
        {
            id: 4,
            address: "918 Maple Avenue, Brooklyn, NY 11215",
            title: "Coastal Serenity Cottage",
            price: "$250,00",
            per: "/month",
            coordinates: [-122.4154, 37.7929],
            image: "images/house/house-4.jpg",
        },
        {
            id: 5,
            address: "456 Pacific Heights, San Francisco, CA 94115",
            title: "Elegant Townhouse",
            price: "$6640,00",
            per: "/SqFT",
            coordinates: [-122.4394, 37.7889],
            image: "images/house/house-5.jpg",
        },
        {
            id: 6,
            address: "77 Lakeview Court, Orlando, FL 32801",
            title: "Rancho Vista Verde",
            price: "$250,00",
            per: "/month",
            coordinates: [-122.4494, 37.7719],
            image: "images/house/house-6.jpg",
        },
        {
            id: 7,
            address: "1422 Sunset Avenue, Los Angeles, CA 90026",
            title: "Palmcrest Residences",
            price: "$6640,00",
            per: "/SqFT",
            coordinates: [-122.4044, 37.7699],
            image: "images/house/house-7.jpg",
        },
        {
            id: 8,
            address: "456 Pacific Heights, San Francisco, CA 94115",
            title: "Elegant Townhouse",
            price: "$250,00",
            per: "/month",
            coordinates: [-122.4394, 37.7611],
            image: "images/house/house-8.jpg",
        },
        {
            id: 9,
            address: "91 Coastal Breeze Drive, San Diego, CA 92101",
            title: "Oceanview Heights",
            price: "$6640,00",
            per: "/SqFT",
            coordinates: [-122.4494, 37.7511],
            image: "images/house/house-9.jpg",
        },
    ];

    const geoData = {
        type: "FeatureCollection",
        features: properties.map((property) => ({
            type: "Feature",
            properties: {
                property_id: property.id.toString(),
                ...property,
            },
            geometry: {
                type: "Point",
                coordinates: property.coordinates,
            },
        })),
    };

    let currentPopup = null;

    properties.forEach((property) => {
        const markerElement = document.createElement("div");
        markerElement.className = "office-marker";
        markerElement.innerHTML = `<i class="icon-House"></i>`;

        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(property.coordinates)
            .addTo(map);

        markerElement.addEventListener("click", () => {
            if (currentPopup) currentPopup.remove();

            document.querySelectorAll(".office-marker").forEach((m) =>
                m.classList.remove("active")
            );
            markerElement.classList.add("active");

            const popupContent = `
            <div class="popup-property">
                <div class="img-style">
                    <img src="${property.image}" width="140" height="105" alt="popup-property">
                </div>
                <div class="content">
                    <h6 class="mb_4">${property.title}</h6>
                    <p class="text-caption-1 mb_12">${property.address}</p>
                    <div class="d-flex">
                        <div class="h6 text-cl-primary">
                            ${property.price}
                        </div>
                        <div class="text-body-default">
                            ${property.per}
                        </div>
                    </div>
                </div>
            </div>`;

            // 👉 Fly to property location
            map.flyTo({
                center: property.coordinates,
                zoom: 14,
                speed: 1.2,
                curve: 1,
                offset: [-150, 0],
                easing: (t) => t,
            });

            currentPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                anchor: "left",
                offset: [40, 0],
            })
                .setLngLat(property.coordinates)
                .setHTML(popupContent)
                .addTo(map);
        });
    });

    function jumpToProperty(map, feature) {
        const [lng, lat] = feature.geometry.coordinates;
        map.flyTo({ center: [lng, lat], zoom: 14, speed: 1.2 });
    }

    function createPopupMap(map, feature) {
        const prop = feature.properties;

        const popupContent = `
        <div class="popup-property">
            <div class="img-style">
                <img src="${prop.image}" width="140" height="105" alt="popup-property">
            </div>
            <div class="content">
                <h6 class="mb_4">${prop.title}</h6>
                <p class="text-caption-1 mb_12">${prop.address}</p>
                <div class="d-flex">
                    <div class="h6 text-cl-primary">
                        ${prop.price}
                    </div>
                    <div class="text-body-default">
                        ${prop.per}
                    </div>
                </div>
            </div>
        </div>`;

        if (currentPopup) currentPopup.remove();

        currentPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            anchor: "left",
                offset: [40, 0],
        })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(popupContent)
            .addTo(map);
    }

    function mouseoverPropertyMapBox(map, geoData) {
        $(".card-house").on("mouseover", function () {
            const dataId = $(this).attr("data-id");
            for (const feature of geoData.features) {
                if (feature.properties.property_id === dataId) {
                    jumpToProperty(map, feature);
                    createPopupMap(map, feature);
                }
            }
        });
    }

    map.on("load", function () {
        mouseoverPropertyMapBox(map, geoData);

         // 👉 Lấy property id = 1
    const defaultProperty = properties.find(p => p.id === 1);

    if (defaultProperty) {
        // active marker UI
        const markers = document.querySelectorAll(".office-marker");
        markers.forEach((m, index) => {
            if (properties[index].id === 1) {
                m.classList.add("active");
            }
        });

        // 👉 fly + show popup
        map.flyTo({
            center: defaultProperty.coordinates,
            zoom: 14,
            speed: 1.2,
            offset: [-150, 0]
        });

        const popupContent = `
        <div class="popup-property">
            <div class="img-style">
                <img src="${defaultProperty.image}" width="140" height="105">
            </div>
            <div class="content">
                <h6 class="mb_4">${defaultProperty.title}</h6>
                <p class="text-caption-1 mb_12">${defaultProperty.address}</p>
                <div class="d-flex">
                    <div class="h6 text-cl-primary">
                        ${defaultProperty.price}
                    </div>
                    <div class="text-body-default">
                        ${defaultProperty.per}
                    </div>
                </div>
            </div>
        </div>`;

        currentPopup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            anchor: "left",
            offset: [40, 0],
        })
            .setLngLat(defaultProperty.coordinates)
            .setHTML(popupContent)
            .addTo(map);
        }
    });

    map.on("click", (e) => {
        if (!e.originalEvent.target.closest(".office-marker")) {
            if (currentPopup) {
                currentPopup.remove();
                currentPopup = null;
            }
        }
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(
        new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
        }),
        "top-right"
    );
})(jQuery);
