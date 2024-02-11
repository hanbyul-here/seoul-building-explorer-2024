export const virdisColors = ['#b0dd2f', '#70cf57','#3dbc74','#21a585','#218e8d','#2a768e','#355e8d','#414287','#482475',
'#440154']

export const missingColor = '#666'

export function expressionConditions(key) {
  return [
  ['all', ['>=', ['get', key], 1000], ['<', ['get', key], 1930]],
  ['all', ['>=', ['get', key], 1930], ['<', ['get', key], 1940]],
  ['all', ['>=', ['get', key], 1940], ['<', ['get', key], 1950]],
  ['all', ['>=', ['get', key], 1950], ['<', ['get', key], 1960]],
  ['all', ['>=', ['get', key], 1960], ['<', ['get', key], 1970]],
  ['all', ['>=', ['get', key], 1970], ['<', ['get', key], 1980]],
  ['all', ['>=', ['get', key], 1980], ['<', ['get', key], 1990]],
  ['all', ['>=', ['get', key], 1990], ['<', ['get', key], 2000]],
  ['all', ['>=', ['get', key], 2000], ['<', ['get', key], 2010]],
  ['all', ['>=', ['get', key], 2010]]]
}

export function fillExtrucionColorConditions(key) {
  return expressionConditions(key).reduce((acc, curr, idx) => {
    return [...acc, curr, virdisColors[idx]]
  },[])
}

export function nullKeyExpression (key) {
  return ["==", ["get", key], null];
}

export function completeColorExpression(key) {
  return ["case", nullKeyExpression(key), missingColor,['case',...fillExtrucionColorConditions(key), missingColor]]
}

export const notVisibleLayerKeyWords = ["transit", "poi", "buildings", 'landuse', 'pois']

export const aprCol2023 = 'APR_Y'
export const aprCol2017 = 'Year'


export const extrudedHeightValue = [
  "interpolate", ["linear"], ["zoom"],
  14, 0,
  15.05, ["get", "HEIGHT"]
]
