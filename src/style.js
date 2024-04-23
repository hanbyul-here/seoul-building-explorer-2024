import layers from 'protomaps-themes-base';
import { fillExtrucionColorConditions, extrudedHeightValue } from './constants';

const isProd = import.meta.env.MODE === 'production'
const dataUrl = isProd? 'https://seoul-building-2023.s3.ap-northeast-2.amazonaws.com' : `${window.location.origin}`;

const relativeDataUrl = isProd? `${window.location.origin}/${import.meta.env.BASE_URL}`: window.location.origin;
const basemapDataUrl = isProd?`${window.location.origin}/${import.meta.env.BASE_URL}`: window.location.origin;

const notVisibleLayerKeyWords = ["transit", "poi", "buildings", 'landuse', 'pois']
const baseMapFoundation = {
  "version": 8,
  "name": "Seoul Building Map",
  // @TODO: replace
  "sprite": "https://demotiles.maplibre.org/styles/osm-bright-gl-style/sprite",
  "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
}

export const sources2017 = {
  "buildings": {
    "type": "vector",
    "url": `pmtiles://${dataUrl}/bd_2017.pmtiles`,
    minzoom: 15,
    maxzoom: 16
  },
  "centroids": {
    "type": "vector",
    "url": `pmtiles://${dataUrl}/bdc_2017.pmtiles`,
    minzoom: 13,
    maxzoom: 15
  }, 
  "dong": {
    "type": "geojson",
    "data": `${relativeDataUrl}/dong_2017.geojson`
  }
}

export const sources2023 = {
  "buildings": {
    "type": "vector",
    "url": `pmtiles://${dataUrl}/bd_2023.pmtiles`,
    minzoom: 15,
    maxzoom: 16
  },
  "centroids": {
    "type": "vector",
    "url": `pmtiles://${dataUrl}/bdc_2023.pmtiles`,
    minzoom: 13,
    maxzoom: 15
  },
  "dong": {
    "type": "geojson",
    "data": `${relativeDataUrl}/dong_2023.geojson`
  }
}

export const sourcesArr2023 = Object.keys(sources2023).map (sourceKey => {
    return {
      ...sources2023[sourceKey],
      key: sourceKey
    }
})

export const sourcesArr2017 = Object.keys(sources2017).map (sourceKey => {
  return {
    ...sources2017[sourceKey],
    key: sourceKey
  }
});

export const baseMapLayers = layers('basemap','grayscale').filter(layer => !notVisibleLayerKeyWords.some(item => layer.id.includes(item)));

export const baseMapStyle = {
  ...baseMapFoundation,
  sources: {
    "basemap": {
      "type": "vector",
      "url": `pmtiles://${basemapDataUrl}/seoul.pmtiles`,
    },
    ...sources2023
  },
  layers: layers('basemap','grayscale').filter(layer => !notVisibleLayerKeyWords.some(item => layer.id.includes(item)))
}

const extrudedStyle = {
  'fill-extrusion-height': extrudedHeightValue,
  'fill-extrusion-height-transition':{
      duration: 2000,
      delay: 0
  }}


export function getLayers(year) {
  const extrusionHeightStyle = year == 2023? extrudedStyle : {};
  const keyWord = 'APR_Y';
  return [
  {
    "id": "bds",
    "source": "buildings",
    "source-layer": `bd_${year}`,
    "type": 'fill-extrusion',
    minzoom: 15,
    "paint": {
      'fill-extrusion-color':
      // Give #666 to null value
        ["case", ["==", ["get", keyWord], null], '#666',
          ['case',...fillExtrucionColorConditions(keyWord), '#666']
        ],
       ...extrusionHeightStyle
    }
  },
  {
    "id": "bdcs",
    "source": "centroids",
    "source-layer": `bdc_${year}`,
    "type": 'circle',
    minZoom: 13,
    maxzoom: 15.1,
    "paint": {
      'circle-color': ["case", ["==", ["get", keyWord], null], '#666',
      ['case',...fillExtrucionColorConditions(keyWord), '#666']],
      'circle-radius': 2
    }
  },
  {
    "id": "bds-dong",
    "source": "dong",
    "type": 'fill',
    minzoom: 10,
    maxzoom: 13.5,
    "paint": {
      "fill-outline-color": "#ccc",
      "fill-opacity": 0.8,
      'fill-color':
      // Give #666 to null value
      ["case", ["==", ["get", keyWord], null], '#666',
        ['case',...fillExtrucionColorConditions(keyWord), 'red']]
    },
    beforeId: 'places_subplace'
  }]
    

}

export const mapStyle2023 = {
  ...baseMapFoundation,
  sources: sources2023,
  layers: [...baseMapLayers, ...getLayers(2023)]
}

export const mapStyle2017 = {
  ...baseMapFoundation,
  sources: sources2017,
  layers: [...baseMapLayers, ...getLayers(2017)]
}


export function getAllUpdatedColorLayers(value, layers) {
  return layers.map(l => {
    if (l.type === 'fill-extrusion') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'fill-extrusion-color': value
        }
      }
    } else if (l.type === 'circle') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'circle-color': value
        }
      }
    } else if (l.type === 'fill') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'fill-color': value
        }
      }
    }
    return l;
  })
}

// This is overwriting the height
export function getAllUpdatedHeightLayers(value, layers) {
  return layers.map(l => {
    if (l.type === 'fill-extrusion') {
      return {
        ...l,
        paint: {
          ...l.paint,
          'fill-extrusion-height': value
        }
      }
    }
    return l;
  })
}
