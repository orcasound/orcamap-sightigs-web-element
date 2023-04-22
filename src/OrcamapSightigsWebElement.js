import { html, css, LitElement } from 'lit';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import { Icon, Style } from 'ol/style';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import {useGeographic} from 'ol/proj';

export class OrcamapSightigsWebElement extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        padding: 25px;
        color: var(--orcamap-sightigs-web-element-text-color, #000);
      }
      #map {
        height: 500px;
        width: 500px;
      }
      .ol-popup[show] {
        background-color: white;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
      }
      .ol-popup:after,
      .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
      }
      .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
      }
      .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
      }
    `;
  }

  static get properties() {
    return {
      map: { type: Map },
      sightings: { type: Array },
      catalog: { type: Object }
    };
  }

  constructor() {
    super();
    this.catalog = {
      blue: {
        src: 'data:image/png;base64,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',
      },
      dolphin: {
        src: 'data:image/png;base64,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',
      },
      fin: {
        src: 'data:image/png;base64,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'
      },
      gray: {
        src: 'data:image/png;base64,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'
      },
      humbpack: {
        src: 'data:image/png;base64,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'
      },
      orca: {
        src: 'data:image/png;base64,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'
      },
      sperm: {
        src: 'data:image/png;base64,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'
      },
      resident: {
        src: 'data:image/png;base64,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'
      }
    };
  }

  firstUpdated() {
    this.__loadMap();
    this.__getSightigs().then(() => {
      this.__showSightigs();
      this.__configPopover();
    });
  }

  async __getSightigs() {
    const response = await fetch('https://acartia.io/api/v1/sightings/current');
    const data = await response.json();
    this.sightings = data;
  }

  __loadMap() {
    useGeographic();
    this.map = new Map({
      target: this.shadowRoot.getElementById('map'),
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }

  __showSightigs() {
    const iconsFeature = [];
    for(let i = 0; i < this.sightings.length; i += 1) {
      const sighting = this.sightings[i];
      const iconFeature = new Feature({
        geometry: new Point([sighting.longitude,sighting.latitude]),
        name: sighting.type,
        source: sighting.data_source_name,
        no_sighted: sighting.no_sighted,
        comments: sighting.data_source_comments,
        date: new Date(sighting.ssemmi_date_added)
      });
      let srcContent = this.catalog.blue.src;
      switch (sighting.type)
      {
        case "Southern Resident Killer Whale":
            srcContent = this.catalog.resident.src;
            break
        case "Killer Whale (Orca)":
        case "Orca": 
            srcContent = this.catalog.orca.src;
            break;
        case "Grey":
        case "Gray Whale":
            srcContent = this.catalog.gray.src;
            break;
        case "Humpback":
            srcContent = this.catalog.humbpack.src;
            break;
        default: 
            srcContent = this.catalog.blue.src;
      }
      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.01, 2],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          scale: 0.4,
          src: srcContent
        }),
      });
  
      iconFeature.setStyle(iconStyle);
      iconsFeature.push(iconFeature);
    }
    const vectorSource = new VectorSource({
      features: iconsFeature,
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });
    this.map.addLayer(vectorLayer);
    this.map.setView(new View({
      center: [-122.26878, 47.9948],
      zoom: 7,
    }));
  }

  __configPopover() {
    const popupElement = this.shadowRoot.getElementById('popup');
    const popup = new Overlay({
      element: popupElement,
      positioning: 'bottom-center',
      stopEvent: false,
    });
    this.map.addOverlay(popup);
    this.map.on('click', evt => {
      const popupContentElement = this.shadowRoot.getElementById('popup-content');
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, ft => ft);
      const elementPopupFather = this.shadowRoot.getElementById('popup');
      elementPopupFather.setAttribute('show', true);
      popupContentElement.innerHTML = `
      Type: ${feature.get('name')} <br>
      Comments: ${feature.get('comments')}<br>
      Date: ${feature.get('date')}<br>
      No. Sighted: ${feature.get('no_sighted')}<br>
      Source: ${feature.get('source')}<br>
      `;
      popup.setPosition(feature.getGeometry().flatCoordinates);
    });
  }


  render() {
    return html`
      <div id="map">
        <div id="popup" class="ol-popup">
          <div id="popup-content"></div>
        </div>
      </div>
    `;
  }
}
