import React, { useEffect, useMemo, useState, useCallback } from 'react'
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import { MapProvider, Map, Source, Layer, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import { ControlPanel } from './control'
import GeocoderControl from './geocoder';
import { baseMapStyle, sourcesArr2017, sourcesArr2023, getLayers } from './style';
import { LanguageEng, LanguageKr } from './lang'

const INITIAL_VIEW_STATE = {
  center: [126.9761,37.5749],
  zoom: 15,
  pitch: 20
}
const MAP_CONTAINER_STYLE = { 
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '100%',
  height: '100%'
}

function formatTooltipText(string, langToUse) {
  if (!string || !string.length || string == 0) return langToUse['undefined']
  if (string[4] == 0 && string[6] == 0 ) return string[0] + string[1] + string[2] + string[3] + langToUse['yearFormat']+ string[5] +langToUse['monthFormat'] + string[7] + langToUse['dayFormat'];
  if (string[4] != 0 && string[6] == 0 ) return string[0] + string[1] + string[2] + string[3] + langToUse['yearFormat'] + string[4] + string[5] +langToUse['monthFormat'] + string[7] + langToUse['dayFormat'];
  else if (string[4] == 0 && string[6] != 0 ) return string[0] + string[1] + string[2] + string[3] + langToUse['yearFormat']+  string[5] +langToUse['monthFormat'] + string[6] + string[7] + langToUse['dayFormat'];
  else return string[0] + string[1] + string[2] + string[3] + langToUse['yearFormat']+ string[4] + string[5] +langToUse['monthFormat'] + string[6] + string[7] + langToUse['dayFormat'];
}

export default function App() {
  const [layers, setLayers] = useState(getLayers(2023))
  const [layers2017, setLayers2017] = useState(getLayers(2017))
  const [popupInfo, setPopupInfo] = useState(null);
  const [compareMode, setCompareMode] = useState(false)
  const searchParams = new URLSearchParams(document.location.search)
  
  const isEng = searchParams.get('lang')?.includes('en')
  const langToUse = isEng? LanguageEng : LanguageKr;

  const [viewState, setViewState] = useState({
    longitude: INITIAL_VIEW_STATE.center[0],
    latitude: INITIAL_VIEW_STATE.center[1],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearint: 0,
    pitch: INITIAL_VIEW_STATE.pitch
  });

  // Attach pmtile protocol to MapLibre
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    // When map gets the first view state with hash value, compare map doesn't get the updated value
    // Therefore we set the viewState with the hash value on landing
    const hashValue = window.location.hash.substring(1);
    const parts = hashValue.split('/');

    setViewState({
      longitude: parts[2],
      latitude: parts[1],
      zoom: parts[0],
      bearing: parts[3],
      pitch: parts[4]
    })

    return () => {
      maplibregl.removeProtocol('pmtiles')
    }
  },[])

  const interactiveLayerIds = useMemo(() => {
    return layers.map(l => l.id)
  },[])
  const interactiveLayer2017Ids = useMemo(() => {
    return layers2017.map(l => l.id)
  },[])

  const onMove = useCallback(evt => { setViewState(evt.viewState)}, []);
  const onClick = useCallback(evt => { 
    if (evt.features?.length && evt.features[0].properties ){
      const fp = evt.features[0].properties
      const dongKeyVal = isEng? `${langToUse['averageYear']} of ${langToUse['dong']}` : `${langToUse['averageYear']}`

      let fs = [{
        key: viewState.zoom < 13 ?  dongKeyVal : langToUse['date'],
        value:  viewState.zoom < 13 ?   Math.round(fp.APR_Y) : formatTooltipText(fp.USEAPR_DAY, langToUse)
      }, {
        key: langToUse['dong'],
        value: viewState.zoom < 13 ? fp.EMD_NM: fp.DONG
      }]
      if (viewState.zoom >= 15) {
        fs = [...fs, 
          {
          key: langToUse['address'],
          value: fp.BEONJI? `${parseInt(fp.BEONJI.slice(0,4))}-${parseInt(fp.BEONJI.slice(4,8))}번지`:''
        },{
          key: langToUse['bname'],
          value: fp.BLD_NM
        } ]
      }
      setPopupInfo({
        lngLat: evt.lngLat,
        features: fs
      });
    }

    else setPopupInfo(null)
  }, [viewState.zoom]);

  return (
    <MapProvider>
      <Map
        id="map-2023"
        initialViewState={{
          longitude: INITIAL_VIEW_STATE.center[0],
          latitude: INITIAL_VIEW_STATE.center[1],
          zoom: INITIAL_VIEW_STATE.zoom,
          pitch: INITIAL_VIEW_STATE.pitch
        }}
        onMove={onMove}
        style={MAP_CONTAINER_STYLE}
        mapStyle={baseMapStyle}
        onClick={onClick}
        maxBounds={[126.684927,37.423433,127.261022,37.702655]}
        interactiveLayerIds={interactiveLayerIds}
        hash
      >
        {sourcesArr2023.map (cSource => {
          const matchingLayer = layers.find(l => l.source === cSource.key);
          return <Source {...cSource}>
            <Layer {...matchingLayer} />
          </Source>
        })}
        {popupInfo && (
          <Popup longitude={popupInfo.lngLat.lng} latitude={popupInfo.lngLat.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
          >
            <strong> 2023 </strong>
            {popupInfo.features.map(f => {
              return (
                <div key={f.key}>
                  <strong>{f.key}: </strong>
                  <span>{f.value}</span>
                </div>
              )
            })}

          </Popup>)
        }
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" 
          // onOutOfMaxBounds={} 
          // onError
        />
        <GeocoderControl position="top-left" />
      </Map>
      {compareMode &&        
          <Map
            id="map-2017" 
            initialViewState={viewState}
            style={MAP_CONTAINER_STYLE}
            mapStyle={baseMapStyle}
            interactiveLayerIds={interactiveLayer2017Ids}
            onClick={onClick}
            styleDiffing
          >
          {sourcesArr2017.map (cSource => {
            const matchingLayer = layers2017.find(l => l.source === cSource.key);
            return <Source {...cSource}>
              <Layer {...matchingLayer} />
            </Source>
          })}
          {/* {popupInfo && (
            <Popup longitude={popupInfo.lngLat.lng} latitude={popupInfo.lngLat.lat}
              anchor="bottom"
              onClose={() => setPopupInfo(null)}
            >
            <b> 2017</b> <br />
            <span dangerouslySetInnerHTML={{__html: popupInfo.feature.key}} /> : 
            {popupInfo.feature.value}
            </Popup>)
          } */}
          
          </Map>
        }
        <ControlPanel
          compareMode={compareMode}
          onCompareChange={setCompareMode}
          layers={layers}
          setLayers={setLayers}
          compareMapLayers={layers2017}
          setCompareMapLayers={setLayers2017}
          lang={langToUse}
          setViewState={setViewState}
        />

    </MapProvider>
  );
}
