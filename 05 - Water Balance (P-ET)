//Balanço hídrico GEE
//Referência livro do Google Earth Engine 

// Definição da área de estudo 
var roi = ee.FeatureCollection('users/sandrosenamachado/BR_Municipios_2021')
                               .filter(ee.Filter.eq('NM_MUN','Sorriso'))
// Center the map.
Map.centerObject(roi, 7);

// Adicone ao map o layer da bacia
Map.addLayer(roi, {}, 'Bacia hidrográfica do rio Santa Maria');

// Defina a data inicial e final
var startYear = 2002;
var endYear = 2021;

// Crie a lista de datas
var startDate = ee.Date.fromYMD(startYear, 1, 1);
var endDate = ee.Date.fromYMD(endYear + 1, 1, 1);//Engloba os 365 dias do ano

// Faça a lista de anos 
var years = ee.List.sequence(startYear, endYear);

// Faça a lista de meses
var months = ee.List.sequence(1, 12);

// Import os dados de evapotranspiraçõ MOD16 dataset.
var mod16 = ee.ImageCollection('MODIS/006/MOD16A2').select('ET');

// Filtrar pelo período selecionado
mod16 = mod16.filterDate(startDate, endDate);

//Precipitação 
var CHIRPS = ee.ImageCollection('UCSB-CHG/CHIRPS/PENTAD');

// Filtrando os dados pelo período
CHIRPS = CHIRPS.filterDate(startDate, endDate);

//Calculo do Balanço Hídrico
// Aplicamos um loop aninhado onde primeiro mapeamos
// os anos relevantes e, em seguida, mapear sobre os relevantes
// meses. A função retorna uma imagem com P - ET
// para cada mês. Um achatamento é aplicado para converter um
// coleção de coleções em uma única coleção.
var waterBalance = ee.ImageCollection.fromImages(
    years.map(function(y) {
        return months.map(function(m) {
            
            //Dados de precipitação
            var P = CHIRPS.filter(ee.Filter
                    .calendarRange(y, y, 'year')) //Ano
                .filter(ee.Filter.calendarRange(m, m,'month')) //Mês
                .sum();//Acumula os dados de precipitação por mês
           
           //Dados de evapotranspiração
            var ET = mod16.filter(ee.Filter
                    .calendarRange(y, y, 'year')) //ano
                .filter(ee.Filter.calendarRange(m, m, //mês
                    'month'))
                .sum()
                .multiply(0.1); //Fato de escala
            
            //Equação do Balanço Hídrico
            // P − E  = Q + ΔS
            
            var wb = P.subtract(ET).rename('wb');

            return ee.Image.cat([P, ET, wb])
                .set('year', y)
                .set('month', m)
                .set('system:time_start', ee.Date
                    .fromYMD(y, m, 1));//sistema de data 


        });
    }).flatten()
);


//Visualizando o balanço hídrico 
var balanceVis = {
    min: 20,
    max: 100,
    palette: 'red, orange, yellow, blue, cyan,darkblue'
};

Map.addLayer(waterBalance.select('wb').mean().clip(roi),
    balanceVis,
    'Balanço Hídrico Mensal');

print('Bandas',waterBalance.first().bandNames())

//Gráfico
// /****************************Gráfico******************************************/
var chart = ui.Chart.image.series(waterBalance.select(['ET', 'precipitation','wb'])
    ,roi, ee.Reducer.mean(), 500, 'system:time_start')
    .setSeriesNames(['ET', 'Precipitação','Bal.Hídrico'])
    .setChartType('ComboChart')
    .setOptions({
      title: 'Balanço Hídrico da Bacia Hidrigráfica do Rio Santa Maria - RS',
      seriesType: "bars",
      series: {
      0: {targetAxisIndex: 0,
          type: 'line', //linha da variável climática ET
          pointShape: 'triangle', rotation: 180,
          lineWidth: 2,
          pointSize: 7,
          color: '#757373'},
      1: {
          targetAxisIndex: 0,
          type: 'line',//linha da variável climática P
          pointShape: 'circle', rotation: 180,
          lineWidth: 2,
          pointSize: 7,
          color: '#25a6d7'},
       2: {
          targetAxisIndex: 0,
          type: 'bar', // Barra do WB
          color: '#eb9800'},
      },
      vAxes: {
        0: {title: 'mm/mês'}
        },
      hAxes: {
        0: {
          title: 'Intervalo de Tempo', 
                        }
                },
    
      bar: {groupWidth: '100%'}
      });

//Print do Gráfico      
print(chart)
