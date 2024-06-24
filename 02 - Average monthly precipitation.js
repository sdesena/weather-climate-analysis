
// Working with precipitation data

// Import your region of interest boundary (ROI)
var roi = ee.FeatureCollection('users/sandrosenamachado/estados_BR')
                              .filter(ee.Filter.eq('name','MATO GROSSO'))
                              
// Make ROI contour
var empty = ee.Image().byte()
var outline = empty.paint({
              featureCollection: roi,
              color: 1,
              width: 2
                          })
                          
// Visualize ROI and center the map
Map.addLayer(outline, {palette: '#000000'}, 'ROI');
Map.centerObject(roi, 7)

// Set time range
var startyear = 2000;
var endyear = 2020;

// Make a list with years
var years = ee.List.sequence(startyear,endyear);

// Make a list with months
var months = ee.List.sequence(1,12);

// Create two date objects for start and end years.
var startdate = ee.Date.fromYMD(startyear,1,1);
var enddate = ee.Date.fromYMD(endyear,12,28);

// Import the CHIRPS dataset
// Make a sequential list for days
// var days = ee.List.sequence(1,31).getInfo();

// Make a sequential list for years
var years = ee.List.sequence(2000,2020).getInfo();

// Make a sequential list for months
var months = ee.List.sequence(1,12).getInfo(); 

// Make a function to iterate over the months
var serie_temporal = months.map(loop);

function loop(month){
                                    
        var startdate = ee.Date.fromYMD(2000, month, 1)
        var enddate = ee.Date.fromYMD(2020, month, 28)

/*****************************************Coleção*********************************/
var precipitation = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                                      .select('precipitation')
                                      .filterDate(startdate, enddate)
                                      .filterBounds(roi)
                
var precipitation_accum =  precipitation.reduce(ee.Reducer.sum()) //precipitation_sum
/*rename substituir o precipitatio_sum*/.rename('precipitation') 
                                        .clip(roi)
                                        
                          

/**************************Adicionado Mapa de Precipitação por mes***********/
Map.addLayer(precipitation_accum, {palette:['white','red','yellow','green','blue'],
                                   min:1100, max:1600},
                                  'Precipitação mensal média - mês'.concat(month),false);    
/********************************Exportando Imagens Anual***********************/
Export.image.toDrive({
  image: precipitation_accum,
  folder: 'GEE',
  description: 'CHIRPS '.concat(month),
  region: roi,
  scale: 5000,
  maxPixels: 1e13
  })   
} //Fim da função Loop
