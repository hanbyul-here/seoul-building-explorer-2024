import React, { useState } from 'react';

import { virdisColors, expressionConditions, completeColorExpression, nullKeyExpression, missingColor } from './constants';
import { getAllUpdatedColorLayers } from './style'
import useMakeControl from './make-control'
import useMapCompare from './use-map-compare';

export function CompareControl ({ compareMode, onChange, lang }) {
  return (
    <div className="switch-wrapper">
    <label className="switch">
      <input type="checkbox" onChange={onChange} value={compareMode} />
      <span dangerouslySetInnerHTML={{__html: lang['compare']}} className="slider" />
    </label>
    <div dangerouslySetInnerHTML={{__html: lang['linkTo2017']}} />
    </div>
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
    <div className='blocks'>
      {virdisColors.map((color, idx) => {
        const style = (selectedIdx!== null)? idx === selectedIdx? {backgroundColor: color} : {backgroundColor: 'grey'}: {backgroundColor: color};
        return <button className="colorblock" key={color} onClick={() => {onClick(idx)}} style ={style}> {1920 + idx * 10} </button>
      })}
      <button className="show-all" onClick={() => {onClick(null)}}> {lang['show']} </button>
    </div>
    
  )
}

export function ControlPanel({onCompareChange, compareMode, layers, setLayers, compareMapLayers, setCompareMapLayers, lang, ...rest }) {
  useMapCompare();
  
  useMakeControl(() => {
    return (
      <div id="control">
        <h1>{lang['title']}</h1>
        <p className="description" dangerouslySetInnerHTML={{ __html:lang['description']}} />
        <YearControl customMapLayers={layers} setLayers = {setLayers} compareMapLayers={compareMapLayers} setCompareMapLayers = {setCompareMapLayers} lang={lang} />
        <CompareControl 
          onChange={onCompareChange} 
          compareMode={compareMode} 
          customMapLayers={layers} 
          setLayers = {setLayers} 
          compareMapLayers={compareMapLayers} 
          setCompareMapLayers={setCompareMapLayers} 
          lang={lang} />
    </div>)}, 
    {...rest})
}