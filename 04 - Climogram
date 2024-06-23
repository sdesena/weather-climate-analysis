/* The climogram is a classic climate representation tool that allows 
   an easier understanding of the climate profile of a given region. 
   Through the climogram, temperature and precipitation variations can be graphically 
   represented during a certain period of time.  */
// Select the Region Of Interest (ROI) with a feature collection:
var roi = ee.FeatureCollection('users/sandrosenamachado/estados_BR')
                               .filter(ee.Filter.eq('name','MATO GROSSO'))
                              
// Draw ROI contour:
var empty = ee.Image().byte();
var outline = empty.paint({
                           featureCollection: roi,
                           color: 'black',
                           width: 2
  
                         });
// Add the contour layer on the display:
Map.addLayer(outline,{pallete:['black']},'ROI')
// Centralize it
Map.centerObject(roi,6)
// Define time range by year:
var startyear = 2001
var endyear = 2022
// Make a sequential list by years:
var years = ee.List.sequence(startyear,endyear)
// Make a sequential list by months:
var months = ee.List.sequence(1,12)
// Define Start and End date:
var startdate = ee.Date.fromYMD(startyear,1,1)
var enddate = ee.Date.fromYMD(endyear,12,31)
/********************************* Precipitation dataset *********************************************/
// Select and filter the image collection with precipitation data:
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                                .select('precipitation')
                                .filterDate(startdate, enddate)
                                .filterBounds(roi); //use filterBounds when working with a image collection
// Calculate annual precipitation. 
// Set a function to reduce the image collection by years:
var annual_chirps = ee.ImageCollection.fromImages(
                    years.map(function(year) {
                              var annual_precip = chirps.filter(ee.Filter.calendarRange(year,year,'year'))
                                                 .sum() // accumulate
                                                 .clip(roi) // use clip when working with a image
                                                 .rename('CHIRPS precipitation');
                                  return annual_precip
                                                 .set('year',year)
                                                 .set('system:time_start', ee.Date.fromYMD(year, 1, 1))
                                            }));
print('CHIRPS (precipitation) annual image collection size',annual_chirps.size())
//Visualize precipitation dataset
Map.addLayer(annual_chirps,{palette:['#56e2ef','#00b4ff','#009eff','#0066ff','#004fff'],
                                       min:1015, max:2394},'Accumulated annual precipitation')
/********************************* Temperature dataset *********************************************/
// Select and filter the image collection with temperature data:
var modis = ee.ImageCollection(ee.ImageCollection("MODIS/061/MOD11A1"))
                                       .select ('LST_Day_1km')
                                       .filterDate(startdate, enddate)
                                       .filterBounds(roi);
// Calculate annual average temperature. 
// Set a function to reduce image collection by years:
var annual_modis = ee.ImageCollection.fromImages(
                   years.map(function(year) {
                             var annual_temp = modis.filter(ee.Filter.calendarRange(year,year,'year'))
                                                    .mean() //reducer
                                                    .multiply(0.02) // dataset scale factor
                                                    .subtract(273) // transform kelvins to celsius (°C)
                                                    .clip(roi) 
                                                    .rename('MODIS Temperature')
                             return annual_temp
                                    .set('year',year)
                                    .set('system:time_start', ee.Date.fromYMD(year, 1, 1));
                     
                   }));
                   
print('MODIS (temperature)',annual_modis.size())
// Visualize temperature dataset:
Map.addLayer(annual_modis, {palette:['#5dea61','#aaf9b0','#fbdf39','#df4d1d','#b8001c'],
                                       min:26, max:37},'Annual average temperature')
/**************************** Join collections (precipitation + temperature) ******************************/
/* To be concise and avoid mistakes, let's assign functions to variables, 
which will later be used as arguments */
//Assign function "join" to a variable:
var innerJoin = ee.Join.inner();
//Assign function "filter.equals" to a variable and set field "year" as the key for the join:
var filterTimeEq = ee.Filter.equals({
  leftField: 'year',
  rightField: 'year'
});
// Join precipitation and temperature data:
var innerJoin_Temp_Prec = innerJoin.apply(annual_modis, annual_chirps, filterTimeEq);
print(innerJoin_Temp_Prec,'Inner Join (TEMP - PREC)')
/* Apply function "map" to iterate for each feature and use
function ee.Image.cat to combine given images into a single band  */
var joined_Temp_Prec= innerJoin_Temp_Prec.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), 
                      feature.get('secondary'));
});
print(joined_Temp_Prec,'Joined (TEMP-PREC)')
// Assign function ee.ImageCollection to the combined variable:
var MODIS_CHIRPS = ee.ImageCollection(joined_Temp_Prec);
print('Joined MODIS-CHIRPS', MODIS_CHIRPS)
/****************************   Configure the chart   ******************************************/
var chart = ui.Chart.image.series(MODIS_CHIRPS.select(['MODIS Temperature', 'CHIRPS precipitation'])
    ,roi, ee.Reducer.mean(), 2500, 'year')
    .setChartType('ComboChart')
    .setSeriesNames(['MODIS Temperature', 'CHIRPS precipitation'])
    .setOptions({
      title: 'Climogram: Precipitation (mm/year) and Temperature (C°)',
      seriesType: "line",
      series: {
      0: {targetAxisIndex: 0, 
          color: 'red'},
      1: {
          targetAxisIndex: 1,
          type: 'bars',
          color: 'DeepSkyBlue'},
      },
      vAxes: {
        0: {title: ' Temperature'},
        1: {title: 'Rainfall (mm/year)'}
        },
      hAxes: {
        0: {
          title: 'Years', 
                        }
                },
    lineWidth: 1,
    pointSize: 0,
      bar: {groupWidth: '80%'}
      });
      
print(chart)
