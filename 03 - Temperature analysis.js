//WORKING WITH TEMPERATURE DATA

//DEFINE REGION OF INTEREST
var roi = ee.FeatureCollection('users/sandrosenamachado/estados_BR')
                                .filter(ee.Filter.eq('name','MATO GROSSO'))
//MAKE CONTOUR
var empty = ee.Image().byte();

var outline = empty.paint({
  featureCollection: roi,
  color: 1,
  width: 2
});

//VISUALIZE ROI 
Map.addLayer(outline, {palette: '#000000'}, 'Region Of Interest (ROI)');
Map.centerObject(roi,6)

//DEFINE TIME RANGE
var startyear = 2001;
var endyear = 2020;

//CREATE A SEQUENTIAL LIST BY YEAR
var years = ee.List.sequence(startyear,endyear);

//CREATE A SEQUENTIAL LIST BY MONTH
var months = ee.List.sequence(1,12);

//DEFINE INITIAL AND FINAL DATE 
var startdate = ee.Date.fromYMD(startyear,1,1);
var enddate = ee.Date.fromYMD(endyear,12,31);


//SELECT A COLLECTION
var temperature = ee.ImageCollection('MODIS/061/MOD11A1')
                            .select('LST_Day_1km')
                            .filterDate(startdate, enddate)
                            .filterBounds(roi);

//ANNUAL AVERAGE TEMPERATURE
var Temperatura_media_anual = ee.ImageCollection.fromImages(
      years.map(function (year) {
      
     var annual_mean = temperature.filter(ee.Filter.calendarRange(year, year, 'year'))
        .mean() // reducer 
        .multiply(0.02) //scale factor
        .subtract(273) //convert for celsius scale
        .clip(roi)
        .rename('Annual average temperature');
    return annual_mean
        .set('year', year)
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1))
        ;
})
);
print(Temperatura_media_anual, 'Annual mean temperature image collection')

//ANNUAL MAXIMUM TEMPERATURE
var Temperatura_max_anual = ee.ImageCollection.fromImages(
      years.map(function (year) {
      
    var annual_max = temperature.filter(ee.Filter.calendarRange(year, year, 'year'))
        .max()  
        .multiply(0.02) 
        .subtract(273)
        .clip(roi)
        .rename('Annual maximum temperature');
    return annual_max
        .set('year', year)
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1))
        ;
})
);
print(Temperatura_max_anual, 'Annual maximum temperature image collection')

//ANNUAL MINIMUM TEMPERATURE
var Temperatura_min_anual = ee.ImageCollection.fromImages(
      years.map(function (year) {
      
    var annual_min = temperature.filter(ee.Filter.calendarRange(year, year, 'year'))
        .min() 
        .multiply(0.02) 
        .subtract(273) 
        .clip(roi)
        .rename('Annual minimum temperature');
    return annual_min
        .set('year', year) 
        .set('system:time_start', ee.Date.fromYMD(year, 1, 1)) 
        ;
})
);

print(Temperatura_min_anual, 'Annual minimum temperature image collection')

//Visualize reduced image collections

Map.addLayer(Temperatura_media_anual, {palette:['#5dea61','#aaf9b0','#fbdf39','#df4d1d','#b8001c'],
                                       min:26, max:37},'Annual average temperature')

Map.addLayer(Temperatura_max_anual, {palette:['#5dea61','#aaf9b0','#fbdf39','#df4d1d','#b8001c'],
                                       min:31, max:58},'Annual maximum temperature')
                                       
Map.addLayer(Temperatura_min_anual, {palette:['#5dea61','#aaf9b0','#fbdf39','#df4d1d','#b8001c'],
                                       min:1, max:26},'Annual minimum temperature')
                                       
/****************************** Annual average temperature graphic ************************************/

var chart_anual = ui.Chart.image.seriesByRegion({
    imageCollection: Temperatura_media_anual,
    regions: roi,
    reducer: ee.Reducer.mean(),
    band: 'Annual average temperature',
    scale: 2500,
    xProperty: 'system:time_start',
    seriesProperty: 'Nome'})
    .setOptions({
      title: 'Annual average temperature',
      hAxis: {title: 'Years'},
      vAxis: {title: 'Cº'},
      lineWidth: 1,
      pointSize: 5,
      series: {
        0:  {color: 'orange'},
          }}
      )
    .setChartType('ColumnChart');

print(chart_anual)

/*********************** Monthly average temperature **********************************/ 
var temperatura_mensal =  ee.ImageCollection.fromImages(
      
      years.map(function (y) {
      return months.map(function(m) {
      
      var temperature_month = temperature.filter(ee.Filter.calendarRange(y, y, 'year'))
                    .filter(ee.Filter.calendarRange(m, m, 'month'))
                    .mean()
                    .multiply(0.02)
                    .subtract(273)
                    .clip(roi);
      
      return temperature_month.set('year', y)
              .set('month', m)
              .set('system:time_start', ee.Date.fromYMD(y, m, 1));
                        
    });
  }).flatten()
);

print(temperatura_mensal, 'Monhtly average temperature')

//Visualize image
Map.addLayer(temperatura_mensal, {palette:['#5dea61','#aaf9b0','#fbdf39','#df4d1d','#b8001c']
                               , min:25, max:41},'Monhtly average temperature')

//Monhtly temperature graphic 
var chart_month = ui.Chart.image.seriesByRegion({
    imageCollection: temperatura_mensal,
    regions: roi, 
    reducer: ee.Reducer.mean(), 
    band: 'LST_Day_1km', 
    scale: 2500, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nome'})
    .setOptions({
      title: 'Monthly average temperature',
      hAxis: {title: 'Months'},
      vAxis: {title: 'ºC'},
      lineWidth: 1,
      pointSize: 5,
      pointShape: 'square',
      series: {
          0:  {pointShape: 'circle',color: 'orange'},
          }}
      )
    .setChartType('ScatterChart');  

print(chart_month)

/*************************** Joining collections  ******************************/
var innerJoin = ee.Join.inner();

var filterTimeEq = ee.Filter.equals({
  leftField: 'year',
  rightField: 'year'
});

var innerJoin_min_mean = innerJoin.apply(Temperatura_min_anual, Temperatura_media_anual, filterTimeEq);

var joined_min_mean = innerJoin_min_mean.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
});

var min_mean = ee.ImageCollection(joined_min_mean);

print('Inner join, joined bands (min & mean)', min_mean)

/************************JOIN min_mean + max *******************************/
var innerJoin_min_mean_max = innerJoin.apply(min_mean, Temperatura_max_anual, filterTimeEq);

var joined_min_mean_max = innerJoin_min_mean_max.map(function(feature) {
  return ee.Image.cat(feature.get('primary'), feature.get('secondary'));
});

var min_mean_max = ee.ImageCollection(joined_min_mean_max);

print('Inner join, joined bands (min_mean_max)', min_mean_max)

/**************************** Temperature statistics comparative graphic ******************************************/
var chart = ui.Chart.image.series(min_mean_max.select(['Annual minimum temperature', 'Annual average temperature','Annual maximum temperature'])
    ,roi, ee.Reducer.mean(), 2500, 'year')
    .setChartType('ComboChart')
    .setSeriesNames(['Minimum', 'Mean', 'Maximum'])
    .setOptions({
      title: 'Temperature comparison (°C) minimum, mean and maximum',
      seriesType: "bars",
      series: {
      0: {targetAxisIndex: 0, 
          color: 'orange'},
      1: {
          targetAxisIndex: 0,
          type: 'bars',
          color: 'red'},
      2: {
          targetAxisIndex: 0,
          type: 'bars',
          color: 'yellow'}
      },
      vAxes: {
        0: {title: ' Temperature (°C)'},
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

