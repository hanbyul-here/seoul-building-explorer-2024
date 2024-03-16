import React, { useState, useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
// I had to install events package to use maplibre-gl-compare
import * as MaplibreglCompare from "@maplibre/maplibre-gl-compare";
import "@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css";
import { virdisColors, expressionConditions, completeColorExpression, nullKeyExpression, missingColor, extrudedHeightValue } from './constants';
import { getAllUpdatedColorLayers, getAllUpdatedHeightLayers } from './style'

export function CompareControl ({compareMode, onChange, customMapLayers, setLayers, lang }) {
  const maps = useMap()
  const map2023 = maps['map-2023']
  const map2017 = maps['map-2017']
  useEffect(() => {
    if (compareMode && map2017 && map2023) {
      const compareControl = new MaplibreglCompare(map2017, map2023, "#wrapper", {
        orientation: 'vertical',
        mousemove: false
      });
      const newLayer = getAllUpdatedHeightLayers(0, customMapLayers);
      setLayers(newLayer);
      return () => {
        compareControl.remove();
      };
    } else {
        if (map2023) {
          const newLayer = getAllUpdatedHeightLayers(extrudedHeightValue, customMapLayers);
          setLayers(newLayer);
        }
    }
  }, [compareMode, maps])

  function onClick () {
    onChange(!compareMode)
  }

  return (
    <label className="switch">
      <input type="checkbox" onChange={onClick} checked={compareMode} />
      <span dangerouslySetInnerHTML={{__html: lang['compare']}} className="slider" />
    </label>
  )
}

export function YearControl ({ customMapLayers, setLayers, compareMapLayers, setCompareMapLayers, lang }) {
  const [selectedIdx, setSelectedIdx] = useState(null)

  // Show All
  function onClick (idx) {
    if (idx === null) { 
      setSelectedIdx(null)
      const newLayer = getAllUpdatedColorLayers(completeColorExpression('APR_Y'), customMapLayers);
      const newLayer2017 = getAllUpdatedColorLayers(completeColorExpression('Year'), compareMapLayers);
      
      setLayers(newLayer)
      setCompareMapLayers(newLayer2017)

    } else {
      setSelectedIdx(idx);

      const newLayer = getAllUpdatedColorLayers(["case", nullKeyExpression('APR_Y'), missingColor,['case', expressionConditions('APR_Y')[idx], virdisColors[idx],  missingColor]], customMapLayers);
      const newLayer2017 = getAllUpdatedColorLayers(["case", nullKeyExpression('Year'), missingColor,['case', expressionConditions('Year')[idx], virdisColors[idx],  missingColor]], compareMapLayers);

      setLayers(newLayer);
      setCompareMapLayers(newLayer2017)
    }
  }

  return (
    <div>
      {virdisColors.map((color, idx) => {
        const style = (selectedIdx!== null)? idx === selectedIdx? {backgroundColor: color} : {backgroundColor: 'grey'}: {backgroundColor: color};
        return <button className="colorblock" key={color} onClick={() => {onClick(idx)}} style ={style}> {1920 + idx * 10} </button>
      })}
      <button className="show-all" onClick={() => {onClick(null)}}> {lang['show']} </button>
    </div>
    
  )
}

export function ControlPanel({onCompareChange, compareMode, layers, setLayers, compareMapLayers, setCompareMapLayers, lang }) {
  return (
    <div id="control">
      <h1>{lang['title']}</h1>
      <p dangerouslySetInnerHTML={{ __html:lang['description']}} />
      <YearControl customMapLayers={layers} setLayers = {setLayers} compareMapLayers={compareMapLayers} setCompareMapLayers = {setCompareMapLayers} lang={lang} />
      <CompareControl onChange={onCompareChange} compareMode={compareMode} customMapLayers={layers} setLayers = {setLayers} compareMapLayers={compareMapLayers} setCompareMapLayers={setCompareMapLayers} lang={lang} />
    </div>
  )
}