import express from 'express';
import {
  generateGeoJson,
  generateProperties,
  getGeoJsonSize,
} from '@utils/geojson/generateGeoJson';
import * as turf from '@turf/turf';

/**
 * Endpoint for custom feature layers
 */
const router = express.Router();

/**
 * Build endpoint
 *
 * @param req current http request
 * @param res http response
 * @returns GeoJSON feature collection
 */
router.get('/feature', async (req, res) => {
  try {
    const property = {
      Polygon: {
        type: 'Polygon',
        generateProperties: () => {
          const randomString = Math.random().toString(36).substring(7);
          return {
            name: `Polygon ${randomString}`,
          };
        },
        numGeometries: 1000,
      },
      LineString: {
        type: 'LineString',
        generateProperties: () => {
          const randomString = Math.random().toString(36).substring(7);
          return {
            name: `LineString ${randomString}`,
          };
        },
        numGeometries: 1000,
      },
      Point: {
        type: 'Point',
        generateProperties: () => {
          const randomString = Math.random().toString(36).substring(7);
          return {
            name: `Point ${randomString}`,
          };
        },
        numGeometries: 1000,
      },
    };
    const geoType: any = req.query.type;
    const geoJsonData = generateGeoJson(property[geoType]);

    console.log(
      'befor GeoJson simplify size in bytes ===>>> ',
      getGeoJsonSize(geoJsonData, 'Bytes')
    );

    /**
     * Simplify Polygon and LineString geo json data
     */
    const tolerance: any = req.query.tolerance ? req.query.tolerance : 1;
    const highQuality: any = req.query.highquality
      ? req.query.highquality
      : true;
    let features: any;
    switch (geoType) {
      case 'Point':
        features = generateProperties(geoJsonData, property[geoType]);
        break;
      case 'Polygon':
      case 'LineString':
        const simplifiedGeoJson = turf.simplify(geoJsonData, {
          tolerance: tolerance,
          highQuality: highQuality,
        });
        console.log(
          'after GeoJson simplify size in bytes ===>>> ',
          getGeoJsonSize(simplifiedGeoJson, 'Bytes')
        );
        features = generateProperties(simplifiedGeoJson, property[geoType]);
        break;
    }

    //use this API for filter records with mongodb
    //https://www.mongodb.com/docs/manual/reference/operator/query/polygon/


    const featureCollection = {
      type: 'FeatureCollection',
      features: features,
    };
    res.send(featureCollection);
  } catch (error) {
    res.send(error);
  }
});

export default router;
