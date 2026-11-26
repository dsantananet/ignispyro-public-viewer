import test from 'node:test';import assert from 'node:assert/strict';import {validate,bounds}from './geojson.mjs';
const fc=g=>({type:'FeatureCollection',features:[{type:'Feature',properties:{label:'<script>'},geometry:g}]});
test('point and bounds',()=>assert.deepEqual(bounds(validate(fc({type:'Point',coordinates:[-7,40]})).points),[-7,40,-7,40]));
test('polygon',()=>assert.equal(validate(fc({type:'Polygon',coordinates:[[[-8,39],[-7,39],[-7,40],[-8,39]]]})).points.length,4));
test('reject invalid coordinates',()=>assert.throws(()=>validate(fc({type:'Point',coordinates:[181,0]}))));
test('reject wrong schema',()=>assert.throws(()=>validate({type:'FeatureCollection',features:[{}]})));
test('reject nested collections',()=>assert.throws(()=>validate(fc({type:'GeometryCollection',geometries:[{type:'GeometryCollection',geometries:[]}]}))));
test('empty data',()=>assert.deepEqual(bounds(validate({type:'FeatureCollection',features:[]}).points),[-180,-90,180,90]));
