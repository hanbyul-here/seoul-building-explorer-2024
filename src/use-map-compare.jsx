// Lightly modified from https://github.com/NASA-IMPACT/veda-ui/blob/main/app/scripts/components/common/map/hooks/use-map-compare.ts
import { useEffect } from 'react';
// I had to install events package to use maplibre-gl-compare
import * as MaplibreglCompare from "@maplibre/maplibre-gl-compare";
import "@maplibre/maplibre-gl-compare/dist/maplibre-gl-compare.css";
import { useMap } from 'react-map-gl';

export default function useMapCompare() {
  
  const maps = useMap();
  const map2023 = maps['map-2023']
  const map2017 = maps['map-2017']
  const hasMapCompare = !!map2017;

  useEffect(() => {
    if (!map2023) return;
    if (hasMapCompare) {
      const compareControl = new MaplibreglCompare(map2017, map2023, "#wrapper");
      return () => {
        compareControl.remove();
      };
    }
  }, [hasMapCompare]);
}
