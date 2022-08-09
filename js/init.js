require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Search",
  "esri/widgets/Locate",
  "esri/widgets/Bookmarks",
  "esri/widgets/BasemapGallery",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/Print",
  "esri/widgets/Home",
  "esri/widgets/ScaleBar",
  "esri/widgets/DistanceMeasurement2D",
  "esri/widgets/AreaMeasurement2D",
  "esri/widgets/Sketch",
  "esri/layers/GraphicsLayer",
], function (
  WebMap,
  MapView,
  Search,
  Locate,
  Bookmarks,
  BasemapGallery,
  LayerList,
  Legend,
  Print,
  Home,
  ScaleBar,
  DistanceMeasurement2D,
  AreaMeasurement2D,
  Sketch,
  GraphicsLayer
) {
  //Specify the web map id from AGOL
  const webmapId =
    new URLSearchParams(window.location.search).get("webmap") ??
    "4862480ff26e43608b0a969a75159337";

  const graphicsLayer = new GraphicsLayer();

  const map = new WebMap({
    portalItem: {
      id: webmapId,
    },
    layers: [graphicsLayer],
  });

  const view = new MapView({
    container: "viewDiv",
    map: map,
    padding: { left: 50 },
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: function () {
          this.dockEnabled = true;
          var isMobileWidth =
            this.view && this.view.widthBreakpoint === "xsmall";
          return isMobileWidth ? "bottom-center" : top - right;
        },
        buttonEnabled: false,
      },
    },
  });

  // sketch widget

  view.when(() => {
    const sketch = new Sketch({
      layer: graphicsLayer,
      view: view,
      container: "sketch-container",
      //graphi will be selected as soon as it is created
      creationMode: "update",
    });
  });

  let actionBarExpanded = false;
  document.addEventListener("calciteActionBarToggle", (event) => {
    actionBarExpanded = !actionBarExpanded;
    view.padding = {
      left: actionBarExpanded ? 180 : 50,
    };
  });

  const homeBtn = new Home({
    view: view,
  });

  const measurementWidget = new DistanceMeasurement2D({
    view: view,
    container: "DistanceMeasurement2D-container",
    unit: "feet", //Defaults to meters, need to specify ft
  });

  const areaMeasurementWidget = new AreaMeasurement2D({
    view: view,
    container: "AreaMeasurement2D-container",
  });

  view.ui.move({ component: "zoom", position: "bottom-right", index: 2 });
  view.ui.add({ component: homeBtn, position: "top-right", index: 0 });

  const basemaps = new BasemapGallery({
    view,
    source: {
      // autocasts to PortalBasemapsSource
      portal: "https://corr.maps.arcgis.com",
    },
    container: "basemaps-container",
  });

  const bookmarks = new Bookmarks({
    view,
    editingEnabled: true,
    container: "bookmarks-container",
  });

  const search = new Search({
    //Add Search widget
    view: view,
    allPlaceholder: "District or Senator",
  });
  view.ui.add(search, "top-left");

  const locateBtn = new Locate({
    view: view,
  });
  // Add the locate widget to the top left corner of the view
  view.ui.add(locateBtn, {
    position: "top-right",
    index: 1,
  });

  const layerList = new LayerList({
    view,
    selectionEnabled: true,
    container: "layers-container",
  });

  const legend = new Legend({
    view,
    container: "legend-container",
  });

  legend.style = "card";

  const print = new Print({
    view,
    container: "print-container",
  });

  const scaleBar = new ScaleBar({
    view: view,
    unit: "dual", // Displays both metric and non-metric units.
  });

  // Add the widget to the bottom left corner of the view
  view.ui.add(scaleBar, {
    position: "bottom-left",
  });

  map.when(() => {
    const { title, description } = map.portalItem;
    document.querySelector("#header-title").textContent = title;
    document.querySelector("#item-description").innerHTML = description;
    let activeWidget;

    const handleActionBarClick = ({ target }) => {
      if (target.tagName !== "CALCITE-ACTION") {
        return;
      }

      if (activeWidget) {
        document.querySelector(
          `[data-action-id=${activeWidget}]`
        ).active = false;
        document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
      }

      const nextWidget = target.dataset.actionId;
      if (nextWidget !== activeWidget) {
        document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
        document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
        activeWidget = nextWidget;
      } else {
        activeWidget = null;
      }
    };

    document
      .querySelector("calcite-action-bar")
      .addEventListener("click", handleActionBarClick);

    document.querySelector("calcite-shell").hidden = false;
    document.querySelector("calcite-loader").active = false;

    const handleActionGroupClick = ({ target }) => {
      if (target.tagName !== "CALCITE-ACTION") {
        return;
      }

      if (activeWidget) {
        document.querySelector(
          `[data-action-id=${activeWidget}]`
        ).active = false;
        document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
      }

      const nextWidget = target.dataset.actionId;
      if (nextWidget !== activeWidget) {
        document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
        document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
        activeWidget = nextWidget;
      } else {
        activeWidget = null;
      }
    };

    document
      .querySelector("calcite-action-group")
      .addEventListener("click", handleActionGroupClick);

    document.querySelector("calcite-shell").hidden = false;
    document.querySelector("calcite-loader").active = false;

    //Theme Toggle ** Buggy

    // const toggleThemes = () => {
    //   // calcite theme
    //   document.body.classList.toggle("calcite-theme-dark");
    //   // jsapi theme
    //   const dark = document.querySelector("#jsapi-theme-dark");
    //   const light = document.querySelector("#jsapi-theme-light");
    //   dark.disabled = !dark.disabled;
    //   light.disabled = !light.disabled;
    //   // jsapi basemap color
    //   map.basemap = dark.disabled ? "gray-vector" : "dark-gray-vector";
    // };

    // document.querySelector("calcite-switch").addEventListener("calciteSwitchChange", toggleThemes);
  });
  //note
  let TextSymbol = {
    type: "text", // autocasts as new TextSymbol()
    color: "white",
    haloColor: "black",
    haloSize: "1px",
    text: "You are here",
    xoffset: 3,
    yoffset: 3,
    font: {
      // autocasts as new Font()
      size: 12,
      family: "Josefin Slab",
      weight: "bold",
    },
  };
});
