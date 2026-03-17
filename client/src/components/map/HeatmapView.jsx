import React, { useEffect, useState } from 'react';
import Map, { Source, Layer, Popup } from 'react-map-gl';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';

const heatmapLayer = {
  id: 'earthquakes-heat',
  type: 'heatmap',
  source: 'earthquakes',
  maxzoom: 15,
  paint: {
    // Increase the heatmap weight based on severity
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'severity'],
      1, 0.2,
      5, 1
    ],
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      15, 3
    ],
    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(10, 15, 30, 0)',
      0.2, 'rgb(6, 182, 212)',     // cyan
      0.4, 'rgb(59, 130, 246)',    // blue
      0.6, 'rgb(16, 185, 129)',    // green
      0.8, 'rgb(245, 158, 11)',    // yellow
      1, 'rgb(239, 68, 68)'        // red
    ],
    // Adjust the heatmap radius by zoom level
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 2,
      15, 20
    ],
    // Transition from heatmap to circle layer by zoom level
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      7, 1,
      15, 0.5
    ]
  }
};

const pointLayer = {
  id: 'earthquakes-point',
  type: 'circle',
  source: 'earthquakes',
  minzoom: 14,
  paint: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      14, 5,
      20, 10
    ],
    'circle-color': [
      'match',
      ['get', 'status'],
      'Resolved', 'rgb(16, 185, 129)',
      'Reported', 'rgb(245, 158, 11)',
      'Under_Review', 'rgb(59, 130, 246)',
      'rgb(239, 68, 68)'
    ],
    'circle-stroke-color': 'white',
    'circle-stroke-width': 1,
    'circle-opacity': 0.8
  }
};


export const HeatmapView = () => {
  const [data, setData] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const res = await api.get('/heatmap');
        setData(res.data);
      } catch (e) {
        console.error('Failed to load map data', e);
      }
    };
    fetchHeatmap();
  }, []);

  const onHover = (event) => {
    const { features, point: { x, y } } = event;
    const hoveredFeature = features && features[0];
    
    if (hoveredFeature && hoveredFeature.layer.id === 'earthquakes-point') {
      setHoverInfo({ feature: hoveredFeature, x, y });
    } else {
      setHoverInfo(null);
    }
  };

  const onClick = (event) => {
    const { features } = event;
    const clickedFeature = features && features[0];
    if (clickedFeature && clickedFeature.layer.id === 'earthquakes-point') {
      navigate(`/issues/${clickedFeature.properties.issueId}`);
    }
  };

  if (!import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN === 'your_mapbox_public_token_here') {
    return <div className="p-8 text-center border rounded-xl border-dashed">Mapbox token required in .env</div>;
  }

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border">
      <Map
        initialViewState={{
          longitude: -74.0060,
          latitude: 40.7128,
          zoom: 11
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        interactiveLayerIds={['earthquakes-point']}
        onMouseMove={onHover}
        onClick={onClick}
        cursor={hoverInfo ? 'pointer' : 'auto'}
      >
        {data && (
          <Source type="geojson" data={data}>
            <Layer {...heatmapLayer} />
            <Layer {...pointLayer} />
          </Source>
        )}

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.feature.geometry.coordinates[0]}
            latitude={hoverInfo.feature.geometry.coordinates[1]}
            closeButton={false}
            className="z-50"
            anchor="bottom"
          >
            <div className="p-2 text-slate-800 text-sm">
              <p className="font-bold">{hoverInfo.feature.properties.address}</p>
              <p>Category: {hoverInfo.feature.properties.category}</p>
              <p>Status: {hoverInfo.feature.properties.status}</p>
              <p className="italic mt-1 text-blue-600">Click to view details</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
