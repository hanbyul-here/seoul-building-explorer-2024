import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { virdisColors, expressionConditions, completeColorExpression, nullKeyExpression, missingColor } from './constants';

import * as MaplibreglCompare from "@maplibre/maplibre-gl-compare";

export function CompareControl () {
  const [compareOn, setCompareOn] = useState(false)

  useEffect(() => {
    if (!compareOn) {
      window.map.setPaintProperty('bds','fill-extrusion-height', ['get', 'HEIGHT'])
      return
    }
    if (!window.compareMap || !window.map) return
    window.map.setPaintProperty('bds', 'fill-extrusion-height', 0);
    window.compareMap.setCenter(window.map.getCenter());
    window.compareMap.setZoom(window.map.getZoom());
    let compareControl = new MaplibreglCompare(window.compareMap, window.map, "#wrapper", {
      orientation: 'vertical',
      // Set this to enable comparing two maps by mouse movement:
      mousemove: false
    });
    
    return () => {
      compareControl.remove();
    };
  }, [compareOn])

  function onClick () {
    if (!window.map || !window.compareMap) return
    setCompareOn(!compareOn)
  }

  return (
    <label class="switch">
      <input type="checkbox" onClick={onClick} checked={compareOn} />
      <span class="slider"></span>
    </label>
  )
}

export default function YearControl () {
  const [selectedIdx, setSelectedIdx] = useState()

  function onClick (idx) {
    if (!window.map) return
    setSelectedIdx(null)
    if (!idx) { 
      window.map.setPaintProperty('bds', 'fill-extrusion-color', completeColorExpression);
    } else {
      window.map.setPaintProperty('bds', 'fill-extrusion-color', ["case", nullKeyExpression('APR_Y'), missingColor,['case', expressionConditions('APR_Y')[idx], virdisColors[idx],  missingColor]]);
    }
  }


  return (
    <div>
      {virdisColors.map((color, idx) => {
        const style = (selectedIdx)? idx === selectedIdx? {backgroundColor: color} : {backgroundColor: 'grey'}: {backgroundColor: color};
        return <button onClick={() => {onClick(idx)}} style ={style}> {1930 + idx * 10} </button>
      })}
      <button onClick={() => {onClick(null)}}> Show All </button>
    </div>
    
  )
}

render(<><YearControl /> <CompareControl /> </>, document.getElementById('yearcontrol'));