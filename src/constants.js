export const baseYear = 1930;
export const virdisColors = ['#b0dd2f', '#70cf57','#3dbc74','#21a585','#218e8d','#2a768e','#355e8d','#414287','#482475',
'#440154']

export const missingColor = '#666'

export function expressionConditions(key) {
  return [
  ['all', ['>=', ['get', key], 1000], ['<', ['get', key], baseYear + 10]],
  ['all', ['>=', ['get', key],  baseYear + 10], ['<', ['get', key],  baseYear + 20]],
  ['all', ['>=', ['get', key],  baseYear + 20], ['<', ['get', key],  baseYear + 30]],
  ['all', ['>=', ['get', key],  baseYear + 30], ['<', ['get', key],  baseYear + 40]],
  ['all', ['>=', ['get', key],  baseYear + 40], ['<', ['get', key],  baseYear + 50]],
  ['all', ['>=', ['get', key],  baseYear + 50], ['<', ['get', key],  baseYear + 60]],
  ['all', ['>=', ['get', key],  baseYear + 60], ['<', ['get', key],  baseYear + 70]],
  ['all', ['>=', ['get', key],  baseYear + 70], ['<', ['get', key],  baseYear + 80]],
  ['all', ['>=', ['get', key],  baseYear + 80], ['<', ['get', key],  baseYear + 90]],
  ['all', ['>=', ['get', key],  baseYear + 90]]]
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

