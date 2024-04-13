import React, { useState } from 'react';

import { baseYear, virdisColors, expressionConditions, completeColorExpression, nullKeyExpression, missingColor } from './constants';
import { getAllUpdatedColorLayers } from './style'
import useMakeControl from './make-control'
import useMapCompare from './use-map-compare';


export function CompareControl ({ compareMode, onChange, lang, disabled }) {
  return (
    <div className="switch-wrapper">
    <label className="switch">
      <input type="checkbox" onChange={onChange} disabled={disabled} defaultChecked={compareMode} />
      <span dangerouslySetInnerHTML={{__html: lang['compare']}} className="slider" />
    </label>
    <div dangerouslySetInnerHTML={{__html: lang['linkTo2017']}} />
    </div>
  )
}

export function YearControl ({ customMapLayers, disabled, setLayers, compareMapLayers, setCompareMapLayers, lang }) {
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
        const style = disabled? {backgroundColor: 'grey', color: 'darkgrey'}:(selectedIdx!== null)? idx === selectedIdx? {backgroundColor: color} : {backgroundColor: 'grey'}: {backgroundColor: color};
        return <button disabled={disabled} className="colorblock" key={color} onClick={() => {onClick(idx)}} style ={style}> {baseYear + idx * 10} </button>
      })}
      <button disabled={disabled} className="show-all" onClick={() => {onClick(null)}}> {lang['show']} </button>
    </div>
    
  )
}

function Explainer({showDetail, setShowDetail, lang, disabled}) {
  return (
    <>
    <div style={{display: 'flex','justifyContent':'space-between'}}>
      <h1>{lang['title']}</h1> 
      <button disabled={disabled} className="mobile sub-button" onClick={setShowDetail}> {showDetail?'설명접기':'설명보기'}</button>
    </div>
    {showDetail&& <p className="description" dangerouslySetInnerHTML={{ __html:lang['description']}} />}
    </>

  )
}

export function ControlPanel({onCompareChange, compareMode, layers, setLayers, compareMapLayers, setCompareMapLayers, lang, showDetail, setShowDetail, ...rest }) {
  useMapCompare();
  useMakeControl(() => {
    return (
      <div id="control">
        <Explainer lang={lang} showDetail={showDetail} setShowDetail={setShowDetail} disabled={false} />
        <YearControl customMapLayers={layers} setLayers = {setLayers} compareMapLayers={compareMapLayers} setCompareMapLayers = {setCompareMapLayers} disabled={false} lang={lang} />
        <CompareControl 
          onChange={onCompareChange} 
          compareMode={compareMode} 
          lang={lang} 
          disabled={false}
          />
    </div>)}, 
    {...rest}
  )
}

export function ControlPanelLook(props) {
  const {onCompareChange, compareMode, layers, setLayers, compareMapLayers, setCompareMapLayers, lang, showDetail, setShowDetail, ...rest } = props;
  useMakeControl(() => {
    return (
      <div id="control">
        <Explainer lang={lang} showDetail={showDetail} setShowDetail={setShowDetail} disabled={true} />
        <YearControl customMapLayers={layers} setLayers = {setLayers} compareMapLayers={compareMapLayers} setCompareMapLayers = {setCompareMapLayers} lang={lang}  disabled={true} />
        <CompareControl 
          onChange={onCompareChange} 
          compareMode={true} 
          lang={lang}
          disabled={true}
           />
    </div>)}, 
    {...rest});
}