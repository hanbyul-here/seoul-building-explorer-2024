import * as React from 'react';
import { useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { useControl } from 'react-map-gl/maplibre';
import MapLibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

/* eslint-disable complexity,max-statements */
export default function GeocoderControl(props) {
  const [marker, setMarker] = useState(null);

  useControl(
    ({ map }) => {
      const ctrl = new MapLibreGeocoder(
        {
          forwardGeocode: async (cfg) => {
            let features = [];
            try {
              const response = await fetch(
                `https://api.geocode.earth/v1/autocomplete?text=${cfg.query}&focus.point.lat=37.57490594749267&focus.point.lon=126.97608590126039&api_key=ge-5c11caa6fac22390`
              );
              const responseJson = await response.json()

              features = responseJson.features.map((f) => ({
                type: 'Feature',
                geometry: {
                  ...f.geometry
                },
                place_type: f.properties.layer,
                properties: f.properties,
                text: `${f.properties.neighbourhood} ${f.properties.locality}`,
                place_name: f.properties.name,
                center: f.geometry.coordinates
              }));
            } catch (e) {
              console.error(`Failed to forwardGeocode with error: ${e}`);
            }
            return { features };
          }
        },
        {
          showResultsWhileTyping: true,
          showResultMarkers: true,
          marker: true,
          flyTo: true,
          clearOnBlur: true,
          collapsed: true,
          render: (json) => {
            return `<strong>${json.place_name}</strong><br><span>${json.text}</span>`;
          },
          maplibregl
        }
      );
      return ctrl;
    },
    {
      position: props.position
    }
  );
  return marker;
}
