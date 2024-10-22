import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import * as pmtiles from 'pmtiles';
import * as maplibregl from 'maplibre-gl';
import { MapProvider, Map, Source, Layer, Popup, NavigationControl, GeolocateControl, AttributionControl } from 'react-map-gl/maplibre';
import { ControlPanel, ControlPanelLook } from './control'
import GeocoderControl from './geocoder';
import { baseMapStyle, sourcesArr2017, sourcesArr2023, getLayers, getAllUpdatedHeightLayers } from './style';
import { LanguageEng, LanguageKr } from './lang'
import { extrudedHeightValue } from './constants';
import 'maplibre-gl/dist/maplibre-gl.css';
import './app.css'

const INITIAL_VIEW_STATE = {
  center: [126.9761,37.5749],
  zoom: 15,
  pitch: 20
}
const MAP_CONTAINER_STYLE = { 
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh'
}

function formatTooltipText(string, langToUse) {
  if (!string || !string.length || string === '0') return langToUse['undefined'];
  // Extracting year, month, and day from the string
  const year = string.slice(0, 4);
  const month = string[4] === '0' ? string[5] : string.slice(4, 6);
  const day = string[6] === '0' ? string[7] : string.slice(6);

  const formattedMonth = month.length? `${month}${langToUse['monthFormat']}`: ''
  const formattedDay = day.length? `${day}${langToUse['dayFormat']}`: ''

  return `${year}${langToUse['yearFormat']}${formattedMonth}${formattedDay}`;
}

const popupDisplayKey = {
  'DONG' : 'dong',
  'EMD_NM' : 'dong',
  'BEONJI': 'address',
  'APR_Y': 'averageYear',
  'USEAPR_DAY': 'date',
  'BLD_NM': 'bname'
}

const highZoomPopupDisplayKey = {
  'DONG' : 'dong',
  'BEONJI': 'address',
  'BLD_NM': 'bname',
  'USEAPR_DAY': 'date',
}

const lowZoomPopupDisplayKey = {
  'EMD_NM' : 'dong',
  'APR_Y': 'averageYear'
}

export default function App() {
  const [layers, setLayers] = useState(getLayers(2023))
  const [layers2017, setLayers2017] = useState(getLayers(2017))
  const [popupInfo, setPopupInfo] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [showDetail, setShowDetail] = useState(true);

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

    return () => {
      maplibregl.removeProtocol('pmtiles')
    }
  },[])

  const interactiveLayerIds = useMemo(() => {
    return layers.map(l => l.id)
  },[])
  const interactiveLayerIds2017 = useMemo(() => {
    return layers2017.map(l => l.id)
  },[])

  const onMove = useCallback(evt => { setViewState(evt.viewState)}, []);
  const onClick = useCallback(evt => { 
    // Do not show popup for circles
    if (viewState.zoom < 15 && viewState.zoom >=13) {
      setPopupInfo(null);
      return
    }

    if (evt.features?.length && evt.features[0].properties) {
      const fp = evt.features[0].properties

      const keySets = (viewState.zoom >=15)? highZoomPopupDisplayKey: lowZoomPopupDisplayKey
        const fs = Object.keys(keySets)
        .reduce((acc, curr) => {
          let val = fp[curr];
          if (curr === 'USEAPR_DAY') {
            val = formatTooltipText(fp[curr], langToUse)
          }
          if (curr  === 'APR_Y') {
            val = fp[curr].toFixed(2)
          }
          if (curr === 'BEONJI' && val) {
            const sub = parseInt(fp[curr].slice(4,8));
            val = (!!sub)? `${parseInt(fp.BEONJI.slice(0,4))}-${parseInt(fp.BEONJI.slice(4,8))}번지`: `${parseInt(fp.BEONJI.slice(0,4))}번지`
          }
          return [...acc, {
            key: langToUse[popupDisplayKey[curr]],
            value: val
          }]
        }, [])
        setPopupInfo({
          lngLat: evt.lngLat,
          features: fs
        });
        return;
      }
    else setPopupInfo(null)
    return
  
    
  }, [viewState.zoom]);

  function onCompareChange () {
    setCompareMode(prev => !prev);
  }

  function onDetailChage() {
    setShowDetail(prev => !prev);
  }

  const newLayers = compareMode? getAllUpdatedHeightLayers(0, layers): getAllUpdatedHeightLayers(extrudedHeightValue, layers);

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
        doubleClickZoom={false}
        // @TECH_DEBT : There is a bug that map doesn't fill up the height
        // Resize the map on load to make sure the map stretches properly
        onLoad={(event) => {
          event.target.resize() 
        }}
        hash={true}
      >
        {sourcesArr2023.map (cSource => {
          const matchingLayer = newLayers.find(l => l.source === cSource.key);
          return <Source {...cSource}>
            <Layer {...matchingLayer} />
          </Source>
        })}
        {popupInfo && (
          <Popup className="popup" longitude={popupInfo.lngLat.lng} latitude={popupInfo.lngLat.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
          >
            {compareMode && <strong> 2024 </strong>}
            {popupInfo.features
            .map(f => {
              return (
                <div key={f.key}>
                  <strong>{f.key}: </strong>
                  <span>{!!f.value? f.value: langToUse['undefined']}</span>
                </div>
              )
            })}

          </Popup>)
        }
        <ControlPanel
          compareMode={compareMode}
          onCompareChange={onCompareChange}
          layers={layers}
          setLayers={setLayers}
          compareMapLayers={layers2017}
          setCompareMapLayers={setLayers2017}
          lang={langToUse}
          setViewState={setViewState}
          showDetail={showDetail}
          setShowDetail={onDetailChage}
          position="top-right"
        />
        <GeocoderControl position="top-right" />
        
          <AttributionControl customAttribution={"Map data from <a href='https://openstreetmap.org/'>OpenStreetMap</a> | <a href='https://www.vworld.kr/dtmk/dtmk_ntads_s002.do?dsId=30524'>VWorld</a>"} 
          compact={true}
          position="bottom-right" />
        <NavigationControl showCompass={false} position="bottom-right" />
        <GeolocateControl 
          position="bottom-right" 
          positionOptions={{
            enableHighAccuracy: true
          }}
          trackUserLocation={true}
          showUserLocation={true}
          onError = {() => {window.popup(lang['locateError'])}}
        />
      </Map>
        {compareMode &&
          <Map
            id="map-2017" 
            initialViewState={viewState}
            style={MAP_CONTAINER_STYLE}
            mapStyle={baseMapStyle}
            maxBounds={[126.684927,37.423433,127.261022,37.702655]}
            onClick={onClick}
            interactiveLayerIds={interactiveLayerIds2017}
            doubleClickZoom={false}
            styleDiffing
          >
          {sourcesArr2017.map (cSource => {
            const matchingLayer = layers2017.find(l => l.source === cSource.key);
            return <Source {...cSource}>
              <Layer {...matchingLayer} />
            </Source>
          })}
        {/* {popupInfo && (
          <Popup className="popup" longitude={popupInfo.lngLat.lng} latitude={popupInfo.lngLat.lat}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
          >
            {compareMode && <strong> 2017 </strong>}
            {popupInfo.features
            .map(f => {
              return (
                <div key={f.key}>
                  <strong>{f.key}: </strong>
                  <span>{!!f.value? f.value: langToUse['undefined']}</span>
                </div>
              )
            })}

          </Popup>)
        } */}
        <ControlPanelLook
          compareMode={compareMode}
          onCompareChange={onCompareChange}
          layers={layers}
          setLayers={setLayers}
          compareMapLayers={layers2017}
          setCompareMapLayers={setLayers2017}
          lang={langToUse}
          showDetail={showDetail}
          setShowDetail={onDetailChage}
          position="top-right"
        />
          </Map>
        }
      
    </MapProvider>
  );
}
