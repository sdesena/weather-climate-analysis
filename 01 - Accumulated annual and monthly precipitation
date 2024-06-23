/*
 * Este script realiza análises de dados de precipitação usando o conjunto de dados CHIRPS no Google Earth Engine.
 * Ele calcula a precipitação acumulada por mês ao longo de um período específico e visualiza os resultados em um mapa.
 */

// Definir a região de interesse (ROI)
var roi = ee.FeatureCollection('users/sandrosenamachado/estados_BR')
                              .filter(ee.Filter.eq('name','MATO GROSSO'));

// Criar contorno da ROI para visualização
var empty = ee.Image().byte();
var outline = empty.paint({
              featureCollection: roi,
              color: 1,
              width: 2
                          });

// Adicionar contorno da ROI ao mapa e centralizar a visualização na ROI
Map.addLayer(outline, {palette: '#000000'}, 'ROI');
Map.centerObject(roi, 7);

// Definir o intervalo de tempo
var startyear = 2000;
var endyear = 2020;

// Criar listas com anos e meses
var years = ee.List.sequence(startyear,endyear);
var months = ee.List.sequence(1,12);

// Criar objetos de data para o início e fim dos anos
var startdate = ee.Date.fromYMD(startyear,1,1);
var enddate = ee.Date.fromYMD(endyear,12,31);

// Importar o conjunto de dados CHIRPS
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
                                .select('precipitation')
                                .filterDate(startdate, enddate)
                                .filterBounds(roi);
print('Número de imagens no conjunto de dados CHIRPS:', chirps.size());

// Criação de uma ImageCollection para a precipitação acumulada anual
var chirps_annual_precip = ee.ImageCollection.fromImages(
    years.map(function (year) {
        // Filtra a coleção CHIRPS para o ano específico
        var chirps_annual_precip2 = chirps.filter(ee.Filter.calendarRange(year, year, 'year'))
            // Calcula a soma da precipitação para o ano
            .sum() 
            // Define a região de interesse (ROI)
            .clip(roi);
        // Adiciona metadados à imagem resultante
        return chirps_annual_precip2
            .set('year', year)
            .set('system:time_start', ee.Date.fromYMD(year, 1, 1));
}));

// Criação de uma ImageCollection para a precipitação acumulada mensal
var chirps_month_precip = ee.ImageCollection.fromImages(
    years.map(function (y) { 
        // Mapeia sobre os meses para cada ano
        return months.map(function(m) {
            // Filtra a coleção CHIRPS para o ano e mês específicos
            var chirps_month_precip_2 = chirps
                    .filter(ee.Filter.calendarRange(y, y, 'year'))
                    .filter(ee.Filter.calendarRange(m, m, 'month'))
                    // Calcula a soma da precipitação para o mês
                    .sum() 
                    // Define a região de interesse (ROI)
                    .clip(roi);
            // Adiciona metadados à imagem resultante
            return chirps_month_precip_2.set('year', y)
              .set('month', m)
              .set('system:time_start', ee.Date.fromYMD(y, m, 1));                        
        });
    }).flatten() 
);

// Visualizar conjuntos de dados no mapa
Map.addLayer(chirps_annual_precip,
            {min: 995, max:2394,
            palette:['#ffffff','#ff3333','	#fff581','#33ecff','#6f5eff','#171cb1']},
            'Precipitação acumulada anual (CHIRPS)');

Map.addLayer(chirps_month_precip,
            {min:53, max:529,
            palette:['#ffffff','#ff3333','	#fff581','#33ecff','#6f5eff','#171cb1']},
            'Precipitação acumulada mensal (CHIRPS)');

// Análise gráfica

// Gráfico por ano
var chartP_anual = ui.Chart.image.seriesByRegion({
    imageCollection: chirps_annual_precip, 
    regions: roi,  
    reducer: ee.Reducer.mean(), 
    band: 'precipitation', 
    scale: 5000, 
    xProperty: 'system:time_start',  
    seriesProperty: 'Nome'}) 
    .setOptions({ 
      title: 'Precipitação média acumulada anual (CHIRPS)', 
      hAxis: {title: 'Anos'},
      vAxis: {title: 'P (mm)'}, 
      lineWidth: 1, 
      pointSize: 5, 
      series: {
        0:  {color: 'DeepSkyBlue'},
        1: {color: 'blue'}, 
        2: {color: 'SteelBlue'},
        3: {color: 'Green'} 
          }}
      )
    .setChartType('ColumnChart');  

print(chartP_anual);

// Gráfico por mês
var chartP = ui.Chart.image.seriesByRegion({
    imageCollection: chirps_month_precip,
    regions: roi, 
    reducer: ee.Reducer.mean(), 
    band: 'precipitation', 
    scale: 5000, 
    xProperty: 'system:time_start', 
    seriesProperty: 'Nome'})
    .setOptions({
      title: 'Precipitação média acumulada mensal (CHIRPS)',
      hAxis: {title: 'Anos'},
      vAxis: {title: 'P (mm)'},
      lineWidth: 1,
      pointSize: 5,
      pointShape: 'square',
      series: {
          0:  {pointShape: 'circle',color: 'blue'},
          1: { pointShape: 'triangle', rotation: 180, color: 'DeepSkyBlue'},
          2: {pointShape: 'square' , color: 'SteelBlue'},
          3: {pointShape: 'square' , color: 'Green'}
          }}
      )
    .setChartType('ScatterChart');  

print(chartP);
