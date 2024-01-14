import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import layers from 'protomaps-themes-base';
// need to install events package to use maplibre-gl-compare
import "@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css";
import { virdisColors, expressionConditions, fillExtrucionColorConditions } from './constants';
import * as M  from './control';

const notVisibleLayerKeyWords = ["transit", "poi", "buildings", 'landuse', 'pois']

let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles",protocol.tile);
console.log(['case',...fillExtrucionColorConditions('APR_Y')])
let map = new maplibregl.Map({
  container: 'map',
  // https://maps.protomaps.com/#map=0.95/20.1/-28.6&theme=grayscale&renderer=maplibregl&tiles=https://build.protomaps.com/20231020.pmtiles
  center: [126.9761,37.5749],
  pitch: 20, // pitch in degrees
  zoom: 14,
  style: {
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    
    "sources": {
      "basemap": {
        "type": "vector",
        "url": "pmtiles://http://localhost:5173/basemap/my_area.pmtiles",
      },
      "buildings": {
        "type": "vector",
        "url": "pmtiles://http://localhost:5173/data/alt10.pmtiles",
      },
    },
    "layers": [...layers('basemap','grayscale').filter(layer => !notVisibleLayerKeyWords.some(item => layer.id.includes(item))), {
      "id": "bds",
      "source": "buildings",
      "source-layer": "diffengine",
      "type": 'fill-extrusion',
      "paint": {
        'fill-extrusion-color':
        // Give #666 to null value
        ["case", ["==", ["get","APR_Y"], null], '#666',
          ['case',...fillExtrucionColorConditions('APR_Y'), 'red']],
        'fill-extrusion-height': ['get', 'HEIGHT'],
      }
    }]
  }
});

let compareMap = new maplibregl.Map({
  container: 'compare-map',
  // https://maps.protomaps.com/#map=0.95/20.1/-28.6&theme=grayscale&renderer=maplibregl&tiles=https://build.protomaps.com/20231020.pmtiles
  center: [126.9761,37.5749],
  pitch: 20, // pitch in degrees
  zoom: 14,
  style: {
    "version": 8,
    "name": "MapLibre Demo Tiles",
    "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    
    "sources": {
      "basemap": {
        "type": "vector",
        "url": "pmtiles://http://localhost:5173/basemap/my_area.pmtiles",
      },
      "bds_2017": {
        "type": 'vector',
        url: 'pmtiles://http://localhost:5173/data/bd_2017.pmtiles',
        minzoom: 13,
        maxzoom: 15
      }
    },
    "layers": [...layers('basemap','grayscale').filter(layer => !notVisibleLayerKeyWords.some(item => layer.id.includes(item))), {
      "id": "bds_2017",
      "source": "bds_2017",
      "source-layer": "simplified_merged_tile_zoom15",
      "type": 'fill-extrusion',
      "paint": {
        'fill-extrusion-color':[
          'case', ...fillExtrucionColorConditions('Year'), 'grey'
        ],
        // I cannot get it.. Just disable height on compare mode.
        'fill-extrusion-height': 0
      }
    }]
  }
});

window.map = map
window.compareMap = compareMap;

map.on('load', () => {
  // Click event
  map.on('click', 'bds', (e) => {
    const description = JSON.stringify(e.features[0].properties['USEAPR_DAY']);
    new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(description)
        .addTo(map);
  });
})

compareMap.on('load', () => {
  compareMap.on('click', 'bds_2017', (e) => {
    const description = JSON.stringify(e.features[0].properties['USEAPR_DAY']);
    new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(description)
        .addTo(compareMap);
  });
})