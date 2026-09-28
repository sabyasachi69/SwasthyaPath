'use client';
import {useEffect,useRef} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type {Facility} from '@/domain/facility';
export default function CareMap({facilities}:{facilities:Facility[]}){const el=useRef<HTMLDivElement>(null);useEffect(()=>{if(!el.current)return;const map=L.map(el.current).setView([20.2961,85.8245],12);facilities.forEach(f=>{const marker=L.circleMarker([f.latitude,f.longitude],{color:'#237b57',radius:10}).addTo(map);const label=document.createElement('span');label.textContent=f.name_en;marker.bindPopup(label);});fetch('/api/v1/map-config').then(r=>r.json()).then(d=>{if(d.url)L.tileLayer(d.url,{attribution:d.attribution,maxZoom:18}).addTo(map);}).catch(()=>{});return()=>{map.remove();};},[facilities]);return <><p className="small">Map tiles require a configured provider. Markers remain available without tiles.</p><div ref={el} style={{height:320,borderRadius:16}} aria-label="Facility map"/></>;}
