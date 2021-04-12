// https://observablehq.com/@edvarfilho/relece-analises-e-visualizacoes-sobre-o-censo-e-resultado-e@1425
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# REleCe: Análises e visualizações sobre o censo e resultado eleitoral de 2020 no Estado do Ceará`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>
<style>
line.link {
  fill: none;
  stroke: #ddd;
  stroke-opacity: 0.8;
  stroke-width: 1.5px;
}
<style>`
)});
  main.variable(observer("view")).define("view", ["md","container"], function(md,container){return(
md`${container()}`
)});
  main.variable(observer("buildvis")).define("buildvis", ["barChart","candidatoDim","d3","dc","candidatoGroup","civilChart","grauEscolaridadeDim","grauEscolaridadeGroup","colorsEscolaridade","rowChart","vereadoresScale","vereadoresDim","vereadoresGroup","view"], function(barChart,candidatoDim,d3,dc,candidatoGroup,civilChart,grauEscolaridadeDim,grauEscolaridadeGroup,colorsEscolaridade,rowChart,vereadoresScale,vereadoresDim,vereadoresGroup,view)
{  
  barChart.width(700)
          .height(400)
          .margins({top: 40, right: 0, bottom: 40, left: 60})
          .dimension(candidatoDim)
          .x(d3.scaleOrdinal())
          .xUnits(dc.units.ordinal)
          .brushOn(true)  
          .gap(10)
          .group(candidatoGroup)
  
  civilChart.width(700)
           .height(300)
           .dimension(grauEscolaridadeDim)
           .cx(350)
           .group(grauEscolaridadeGroup, 'Quantidade de eleitores')
           .legend(dc.legend().x(550).y(220).itemHeight(15))
           .slicesCap(4)
           .innerRadius(0)
           .colors(colorsEscolaridade)
  
  rowChart.width(800)
          .height(300)
          .elasticX(true)
          .labelOffsetX(10)
          .margins({top: 20, right: 40, bottom: 40, left: 20})
          .x(vereadoresScale)
          .dimension(vereadoresDim)
          .group(vereadoresGroup)
          .cap(10)
          .keyAccessor(d => d.key[1])
          .valueAccessor(d => +d.value)
          .colorAccessor(d => +d.value)
          .othersGrouper(false)

  dc.renderAll()
  
  return view
}
);
  main.variable(observer("rowChart")).define("rowChart", ["dc","view"], function(dc,view){return(
dc.rowChart(view.querySelector("#rowchart"))
)});
  main.variable(observer("barChart")).define("barChart", ["dc","view"], function(dc,view){return(
dc.barChart(view.querySelector("#barchart"))
)});
  main.variable(observer("civilChart")).define("civilChart", ["dc","view"], function(dc,view){return(
dc.pieChart(view.querySelector("#piechart"))
)});
  main.variable(observer("updateFiltersVereador")).define("updateFiltersVereador", ["municipioDimVereador","dc"], function(municipioDimVereador,dc){return(
function updateFiltersVereador(e){
  console.log(e.properties.name.toUpperCase());
  municipioDimVereador.filter(d => d == e.properties.name.toUpperCase());
  
  dc.redrawAll();
}
)});
  main.variable(observer("updateFiltersPyramid")).define("updateFiltersPyramid", ["munDim","d3","margin","sexoDim","width","data","centreSpacing"], function(munDim,d3,margin,sexoDim,width,data,centreSpacing){return(
function updateFiltersPyramid(e){
  munDim.filter(d => d == e.properties.name.toUpperCase())
  d3.select("#pyramid").select("svg").remove();
  
  var height = munDim.top(Infinity).length/2 * 25 + margin.top + margin.bottom
  
  var xM = d3.scaleLinear()
             .domain([0, d3.max(sexoDim.filter(d=>d=="M").top(Infinity), d => d.QT_COMPARECIMENTO)])
             .rangeRound([width/2, margin.left])
  
  var  xF= d3.scaleLinear()
         .domain([0, d3.max(sexoDim.filter(d=>d=="F").top(Infinity), d => d.QT_COMPARECIMENTO)])
         .rangeRound([width / 2, width - margin.right])
  
  var y = d3.scaleBand()
    .domain(data.map(d => d.DS_FAIXA_ETARIA)) //faixa etaria no meio
    .rangeRound([height - margin.bottom, margin.top])
    .padding(0.1)
  
  var xAxis = g => g
    .attr("transform", `translate(${(centreSpacing + 5)/2},${height - margin.bottom})`)
    .call(g => g.selectAll(".domain").remove())
    .call(g => g.selectAll(".tick:first-of-type").remove())
  
  var yAxis = g => g
    .attr("transform", `translate(${xM(0)},0)`)
    .call(d3.axisRight(y).tickSizeOuter(0))
    .call(g => g.selectAll(".tick text").attr("fill", "black"))
  
  var scale = d3.scaleLinear()
          .domain([0, xM.domain()[1] + centreSpacing + 5 + xF.domain()[1]])
          .range([0, width])
   
  var svg = d3.select('#pyramid')
              .append("svg:svg")
              .attr("width",width + margin.left + margin.right)
              .attr("height",height + margin.top + margin.bottom);
  

  svg.attr("font-family", "sans-serif")
    .attr("font-size", 10);

    let gM = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    gM.selectAll('rect')
      .data(sexoDim.filter(d=>d=="M").top(Infinity))
      .enter()
      .append('rect')
      .attr('x', d => xM(d.QT_COMPARECIMENTO) - 5)
      .attr('y', d => y(d.DS_FAIXA_ETARIA))
      .attr('height', y.bandwidth())
      .attr('width', d => xM(0) - xM(d.QT_COMPARECIMENTO))
      .style('fill', d => d3.schemeSet1[1]);

    sexoDim.filterAll()
    let gF = svg
      .append("g")
      .attr('transform','translate('+(margin.left+(width-centreSpacing)/2+centreSpacing)+","+margin.top+")");

    gF.selectAll('rect')
      .data(sexoDim.filter(d=>d=="F").top(Infinity))
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', d => y(d.DS_FAIXA_ETARIA))
      .attr('height', y.bandwidth())
      .attr('width', d => xF(d.QT_COMPARECIMENTO) - xF(0))
      .style('fill', d => d3.schemeSet1[0]);

    sexoDim.filterAll()
    svg.append("g")
        .attr("fill", "black")
        .selectAll("text")
        .data(munDim.top(Infinity))
        .join("text")
        .attr("text-anchor", d => d.DS_GENERO === "M" ? "start" : "end")
        .attr("x", d => d.DS_GENERO === "M" ? xM(d.QT_COMPARECIMENTO) + 10: xF(d.QT_COMPARECIMENTO)+ 110+centreSpacing/2)
        .attr("y", d => y(d.DS_FAIXA_ETARIA) + y.bandwidth()/1.25)
        .attr("dy", "0.35em")
        .text(d => d.QT_COMPARECIMENTO);

    let gLabels = svg
      .append('g')
      .attr(
        'transform',
        'translate(' +
          (margin.left + (width - centreSpacing) / 2 + ',' + margin.top + ')')
      )

    gLabels
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .attr('x', centreSpacing / 2)
      .attr('y', d => y(d.DS_FAIXA_ETARIA) + y.bandwidth()/1.5)
      .text((d => d.DS_FAIXA_ETARIA));

     svg.append("g")
        .call(xAxis);
  
  svg.append("circle").attr("cx",700).attr("cy",30).attr("r", 6).style("fill", d3.schemeSet1[1])
  svg.append("circle").attr("cx",700).attr("cy",60).attr("r", 6).style("fill", d3.schemeSet1[0])
  svg.append("text").attr("x", 720).attr("y", 30).text("Homens").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 720).attr("y", 60).text("Mulheres").style("font-size", "15px").attr("alignment-baseline","middle")


    return svg.node();
}
)});
  main.variable(observer("updateFiltersNetwork")).define("updateFiltersNetwork", ["d3","datasetPartidos","color"], function(d3,datasetPartidos,color){return(
function updateFiltersNetwork(e){
  d3.select("#network").select("svg").remove();
  const width = 800
  const height = 600
  
  var k = Object.keys(datasetPartidos)
  var v = Object.values(datasetPartidos)
  
  var cidade = e.properties.name.toUpperCase()
  
  var data
  
  for(let i=0; i<k.length; i++){
    if(k[i]==cidade){
      data = v[i]
    }
  }
  
  console.log(data)
  
  function drag(simulation){
        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        }
        function dragged(d) {
          d.fx = d3.event.x
          d.fy = d3.event.y
        }
        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }
        return d3.drag()
                 .on("start", dragstarted)
                 .on("drag", dragged)
                 .on("end", dragended)
    }
  
  function forceSimulation(nodes, links) {
      return d3.forceSimulation(nodes)
               .force("link", d3.forceLink(links).id(d => d.id).distance(50))
               .force("charge", d3.forceManyBody().strength(-50).distanceMax(270))
               .force("center", d3.forceCenter())
  }
  
  var circleScale = d3.scaleSqrt()
                .domain(d3.extent(data.nodes, d => d.votos))
                .range([2, 30])
  
  var svg = d3.select('#network')
              .append("svg:svg")
              .attr("width",width)
              .attr("height",height)
              .attr("viewBox", [-width / 2, -height / 2, width, height]);
  
  const nodes = data.nodes;
  const links = data.links;
  
  const simulation = forceSimulation(nodes, links).on("tick", ticked);
  
  const link = svg.append("g")
                  .selectAll("line")
                  .data(links)
                  .enter()
                  .append("line")
                  .attr("class", "link");
  
  const node = svg.append("g")
                  .selectAll("circle")
                  .data(nodes)
                  .enter()
                  .append("circle")
                  .attr("class", "node")
                  .attr("r", d => circleScale(d.votos))
                  .attr("fill", color)
                  .call(drag(simulation));
  
  var titulo = function(d){
      if(d.prefeito){
        return d.name + ': ' + d.prefeito + ' - ' +d.votos + ' votos'
      }else{
        return d.name + ': ' + d.votos + ' votos'}
  }
  
  node.append("title")
      .text(d => titulo(d));
  
  function ticked(){
      link.attr("x1", d => d.source.x);
      link.attr("y1", d => d.source.y);
      link.attr("x2", d => d.target.x);
      link.attr("y2", d => d.target.y);
      node.attr("cx", d => d.x);
      node.attr("cy", d => d.y);
  }
  return svg.node()
}
)});
  main.variable(observer("color")).define("color", ["d3"], function(d3)
{
    var scale = d3.scaleOrdinal(d3.schemeCategory10);
    return d => scale(d.coligacao)
  }
);
  main.variable(observer("updateFiltersPrefeito")).define("updateFiltersPrefeito", ["municipioDim","candidatoDim","candidatoGroup","barChart","d3"], function(municipioDim,candidatoDim,candidatoGroup,barChart,d3){return(
function updateFiltersPrefeito(e){
  let c = []
  let v = []
  console.log(e.properties.name.toUpperCase())
  municipioDim.filter(d => d == e.properties.name.toUpperCase())
  for(let i=0; i<candidatoDim.top(Infinity).length; i++){
    c[i] = candidatoGroup.top(Infinity)[i].key
    v[i] = +candidatoGroup.top(Infinity)[i].value
  }
  console.log(v)
  barChart.x(d3.scaleOrdinal().domain(c))
  barChart.y(d3.scaleLinear().domain([0,d3.max(v)]))
  //dc.redrawAll()
  barChart.redraw()
}
)});
  main.variable(observer()).define(["candidatoGroup"], function(candidatoGroup){return(
candidatoGroup.top(Infinity)[0]
)});
  main.variable(observer("updateFiltersEstadoCivil")).define("updateFiltersEstadoCivil", ["municipioDimPE","civilChart"], function(municipioDimPE,civilChart){return(
function updateFiltersEstadoCivil(e){
  console.log(e.properties.name.toUpperCase())
  municipioDimPE.filter(d => d == e.properties.name.toUpperCase())
  
  civilChart.redraw()
}
)});
  main.variable(observer("map")).define("map", ["buildvis","L"], function(buildvis,L)
{
  buildvis;
  let mapInstance = L.map('mapid').setView([-5.3171536,-39.5833793], 7)
    L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
                attribution:  `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
 Map tiles by &copy; <a href="https://carto.com/attribution">CARTO</a>`,
                minZoom: 7,
                maxZoom: 8                
                }).addTo(mapInstance)
 // mapInstance.on('click', updateFilters)
  return mapInstance
}
);
  main.variable(observer("geojson")).define("geojson", ["view","L","info","updateFiltersPrefeito","updateFiltersEstadoCivil","updateFiltersVereador","updateFiltersPyramid","updateFiltersNetwork","cidades","style","map"], function(view,L,info,updateFiltersPrefeito,updateFiltersEstadoCivil,updateFiltersVereador,updateFiltersPyramid,updateFiltersNetwork,cidades,style,map)
{
  let lastClickedLayer;
  let lastMouseLayer;
  let geoj; 
  function highlightFeature(e) {
    view.querySelector("#texto").style.display = 'inline';
    view.querySelector("#pyramid").style.display = 'inline';
    view.querySelector("#piechart").style.display = 'inline';
//    view.querySelector("#coluna2").style.display = 'inline';
    view.querySelector("#rowchart").style.display = 'inline';
    view.querySelector("#barchart").style.display = 'inline';
    view.querySelector("#network").style.display = 'inline';
    
    if(lastClickedLayer){
      geoj.resetStyle(lastClickedLayer);
    }
		let layer = e.target;
		layer.setStyle({
					weight: 3,
					color: '#696969',
					dashArray: '',
					fillOpacity: 0.7
		});
		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
		info.update(layer.feature);
    updateFiltersPrefeito(layer.feature);
    updateFiltersEstadoCivil(layer.feature);
    updateFiltersVereador(layer.feature);
    updateFiltersPyramid(layer.feature);
    updateFiltersNetwork(layer.feature);
    
    lastClickedLayer = layer;
	}
  function mouseover(e){
    geoj.resetStyle(lastMouseLayer);
    e.target.setStyle({
					weight: 3,
					color: '#696969',
					dashArray: '',
					fillOpacity: 0.7
		});
    info.update(e.target.feature);
    lastMouseLayer = e.target;
  }
  function mouseout(e){
    info.update(lastClickedLayer.feature);
    lastClickedLayer.setStyle({
					weight: 3,
					color: '#696969',
					dashArray: '',
					fillOpacity: 0.7
		});
    geoj.resetStyle(lastMouseLayer);
  }
	function onEachFeature(feature, layer) {
		layer.on({
          mouseout: mouseout,
          mouseover: mouseover,
					click: highlightFeature
				});
	}
  geoj = L.geoJson(cidades, {
				style: style,
				onEachFeature: onEachFeature
		}).addTo(map)
  return geoj;
}
);
  main.variable(observer("legend")).define("legend", ["L","greens","colorScale","d3","map"], function(L,greens,colorScale,d3,map)
{
  let legendControl = L.control({position: 'bottomright'});

	legendControl.onAdd = function (map) {

		let div = L.DomUtil.create('div', 'info legend'),
			labels = [],
            n = greens.length,
			from, to;

		for (let i = 0; i < n; i++) {
			let c = greens[i]
            let fromto = colorScale.invertExtent(c);
			labels.push(
				'<i style="background:' + greens[i] + '"></i> ' +
				d3.format("d")(fromto[0]) + (d3.format("d")(fromto[1]) ? '% &ndash; ' + d3.format("d")(fromto[1]) + '%' : ' +'));
		}
    
    let fromto = colorScale.invertExtent(greens[n-1]);
    labels[n-1] = '<i style="background:' + greens[n-1] + '"></i> ' +
				d3.format("d")(fromto[0]) + '% &ndash; acima de ' + d3.format("d")(fromto[0]) + '%'

		div.innerHTML = labels.join('<br>')
		return div
	}

   	legendControl.addTo(map)
  return legendControl
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">'
      <h3 align="center"> REleCe: Análises e visualizações sobre o censo e resultado eleitoral de 2020 no Estado do Ceará </h3><br>
    <p align="center"> Para analisar informações acerca das eleições do 1º turno em algum municípo do Estado do Ceará clique sobre o município no mapa abaixo, que ilustra a taxa de comparecimento dos eleitores, segundo a quantidade de eleitores aptos</p>
    </div>
    
    <div class='row'>
      <div id="mapid" class='row' style='margin-left: auto;margin-right: auto;'>
      </div>
      <div id="texto" class='row'>
       <p align="justify">Neste trabalho constam informações acerca do 1º turno das Eleições de 2020 do estado do Ceará. Serão mostradas informações quantitativas acerca dos votos recebidos por candidatos a prefeitos e dos dez vereadores mais votados do município selecionado no mapa.</p><p align="justify">Além disso, também constará o perfil do eleitorado, sendo quantificados os eleitores setorizados por grau de escolaridade, bem como a pirâmide populacional referente a eles.</p><p align="justify">E por fim, temos um gráfico de rede que ilustra a relação entre as coligações dos candidatos a prefeito e os partidos dos vereadores candidatos que compõem essa coligação.</p>
     </div>
    </div>

<div class='row'>
        <div id='barchart' style='display: none;'>
          <h5 align="center"> Votos recebidos por candidatos a prefeito</h5><br>
          <p align="justify">No gráfico apresentamos a principal informação requerida em uma Eleição municipal, da qual destacamos a do ano 2020,  a quantidade de votos por candidato a prefeito.Abaixo, temos a quantidade de votos que cada candidato a prefeito do município obteve, além dos votos Nulos e Brancos. Os gráfico é ordando seguindo a quantidade de votos.</p>
        </div>
    
    </div>

    <div class='row'>
          <div id='rowchart' style='display: none;'>
            <h5 align="center"> Top-10 candidatos a vereador do município</h5><br>
            <p align="justify">A seguir temos os 10 principais candidatos a vereadores do município, segundo a quantidade de votos, vale ressaltar que dependendo dos demais candidatos do partido destes, possivelmente estes 10 candidatos foram eleitos, devido a quantidade de votos recbidos.</p>
          </div>

     </div>

    <div class='row' id='network' style='display:none;'>
        <h5 align="center">Rede de coligações e partidos</h5><br>
        <p align="justify">Com o intuito de analisarmos o impacto da quantidade de votos por coligação de um candidato a prefeito e partidos dos candidatos a vereadores, temos a rede apresentada abaixo.</p><p align="justify">A rede apresenta para cada município diversos grafos, em que cada nó é compreendido por partido ou coliagção do municipo, para cada cor temos uma coligação. </p><p align="justify">O nó principal de cada rede compreende a coligação do candidato a prefeito e quantidade de votos que ele recebeu. Os nós conectados a este, referem-se aos partidos daquela coligação e quantidade de votos para cada partido destinado aos vereadores.</p>
   </div> 
    
    <div class='row'>
        <div id='piechart' style='display: none;'>
          <h5 align="center"> Quantidade de eleitores por grau de escolaridade</h5><br>
          <p align="justify">O gráfico abaixo ilustra a quantidade de eleitores do município, segundo o grau de escolaridade dos mesmos, classificamos os eleitores em 4 categorias, sendo 3 delas referindo-se ao grau completo de escolaridade e a categoria Outros refere-se aqueles eleitores que possuem algum grau incompleto ou são analfabetos.</p><p align="justify">Desfinimos essas 4 categorias com o intuito de facilitar a visualização dessa informação e além disso os graus de escolaridade ilustrados são informações relevantes para a prefeitura do município, em especial a Secretaria de Educação para aplicação de políticas educacionais.</p>
        </div>
    </div>

    <div class='row' id='pyramid' style='display:none;'>
        <h5 align="center">Pirâmide populacional dos eleitores do município</h5><br>
        <p align="justify">O gráfico abaixo apresenta a pirâmide populacionado dos eleitores que compareceram as eleiçõs no município, em que para cada faixa etária temos a quantidade de eleitores para cada sexo, masculino ou feminino. Essa informação pode ser levada em consideração para possíveis aplicações de políticas públicas, para crescimento da taxa de mortalidade no município, por exemplo.</p>
    </div>

    

  </main>
 `
}
)});
  main.variable(observer("greens")).define("greens", ["d3"], function(d3){return(
d3.schemeYlGn[5]
)});
  main.variable(observer("colorScale")).define("colorScale", ["d3","pcComparecimentos","greens"], function(d3,pcComparecimentos,greens){return(
d3.scaleQuantize()
    .domain([d3.min(pcComparecimentos), d3.max(pcComparecimentos)])
    .range(greens)
)});
  main.variable(observer("zoomToFeature")).define("zoomToFeature", ["map"], function(map){return(
function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds())
	}
)});
  main.variable(observer("info")).define("info", ["L","qtComparecimentoPercentByName","map"], function(L,qtComparecimentoPercentByName,map)
{
	let infoControl = L.control()

	infoControl.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	}

	infoControl.update = function (feat) {
			this._div.innerHTML = '<h5>Taxa de comparecimento:</h5>' +  (feat ?
				'<b>' + feat.properties.name + '</b><br />Taxa de comparecimento dos eleitores: '+ qtComparecimentoPercentByName.get(feat.properties.name.toUpperCase()) + '%'
				: 'Clique em um município');
	}

	infoControl.addTo(map);
  return infoControl
}
);
  main.variable(observer("pcComparecimentos")).define("pcComparecimentos", ["qtComparecimentoPercentByName"], function(qtComparecimentoPercentByName)
{
 let array = []
qtComparecimentoPercentByName.forEach(function(value) {
  array.push(value)
})
return array
}
);
  main.variable(observer()).define(["d3","pcComparecimentos"], function(d3,pcComparecimentos){return(
d3.max(pcComparecimentos)
)});
  main.variable(observer("qtComparecimentoPercentByName")).define("qtComparecimentoPercentByName", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Brabissima/datasets-projeto/main/perfilEleitoradoMunicipios.csv').then(function(data) {
    let cidades = []
    let comparecimento = []
    let aptos = []
    let mapeamento = new Map()
    let i = 0
    let j = 0
    let k = 0
    data.forEach(function(d){
      if(Number.isNaN(+d.QT_COMPARECIMENTO)){
        d.QT_COMPARECIMENTO = 0
      }
      if(Number.isNaN(+d.QT_APTOS)){
        d.QT_APTOS = 0
      }
      if(!cidades.includes(d.NM_MUNICIPIO)){
        cidades[i] = d.NM_MUNICIPIO
        comparecimento[i] = +d.QT_COMPARECIMENTO
        aptos[i] = +d.QT_APTOS
        i = i + 1
      }
      else{
        let indice = cidades.indexOf(d.NM_MUNICIPIO)
        comparecimento[indice] = comparecimento[indice] + (+d.QT_COMPARECIMENTO)
        aptos[indice] = aptos[indice] + (+d.QT_APTOS)
      }
      for(let j = 0; j < cidades.length; j ++){
        mapeamento.set(cidades[j], +(+comparecimento[j]/+aptos[j] * 100).toFixed(2))
      }
    })
    return mapeamento
  })
)});
  main.variable(observer("arr")).define("arr", ["qtComparecimentoPercentByName"], function(qtComparecimentoPercentByName){return(
qtComparecimentoPercentByName.values()
)});
  main.variable(observer("dataset_perfil_eleitorado")).define("dataset_perfil_eleitorado", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Brabissima/datasets-projeto/main/perfilEleitoradoMunicipiosEscolaridade.csv')
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://raw.githubusercontent.com/Brabissima/datasets-projeto/main/votos1turno.csv")
)});
  main.variable(observer("dataset_vereadores")).define("dataset_vereadores", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Brabissima/datasets-projeto/main/votos1turnoVereador.csv')
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("facts_eleitorado")).define("facts_eleitorado", ["crossfilter","dataset_perfil_eleitorado"], function(crossfilter,dataset_perfil_eleitorado){return(
crossfilter(dataset_perfil_eleitorado)
)});
  main.variable(observer("facts_vereadores")).define("facts_vereadores", ["crossfilter","dataset_vereadores"], function(crossfilter,dataset_vereadores){return(
crossfilter(dataset_vereadores)
)});
  main.variable(observer("grauEscolaridadeDim")).define("grauEscolaridadeDim", ["facts_eleitorado"], function(facts_eleitorado){return(
facts_eleitorado.dimension(d => d["DS_GRAU_ESCOLARIDADE"])
)});
  main.variable(observer("grauEscolaridadeGroup")).define("grauEscolaridadeGroup", ["grauEscolaridadeDim"], function(grauEscolaridadeDim){return(
grauEscolaridadeDim.group().reduceSum(d => +d.QT_COMPARECIMENTO)
)});
  main.variable(observer()).define(["grauEscolaridadeGroup"], function(grauEscolaridadeGroup){return(
grauEscolaridadeGroup.all()
)});
  main.variable(observer("escolaridade")).define("escolaridade", ["grauEscolaridadeGroup"], function(grauEscolaridadeGroup)
{
  let sorted = grauEscolaridadeGroup.all()
  return sorted.map(d => d.key)
  //return sorted.map(d => [d.key, d.value])
}
);
  main.variable(observer("vereadoresDim")).define("vereadoresDim", ["facts_vereadores"], function(facts_vereadores){return(
facts_vereadores.dimension(d => [d.NM_MUNICIPIO, d.NM_VEREADOR])
)});
  main.variable(observer("vereadoresGroup")).define("vereadoresGroup", ["vereadoresDim"], function(vereadoresDim){return(
vereadoresDim.group().reduceSum(d => d.QT_VOTOS_VEREADOR)
)});
  main.variable(observer("vereadores")).define("vereadores", ["vereadoresGroup"], function(vereadoresGroup)
{
  let sorted = vereadoresGroup.top(10)
  return sorted.map(d => d.key[1])
}
);
  main.variable(observer("vereadoresScale")).define("vereadoresScale", ["d3","vereadores"], function(d3,vereadores){return(
d3.scaleOrdinal().domain(vereadores).range(d3.schemeBlues[6])
)});
  main.variable(observer("colorsEscolaridade")).define("colorsEscolaridade", ["d3","escolaridade"], function(d3,escolaridade){return(
d3.scaleOrdinal()
              .domain(escolaridade[0])
              .range(d3.schemeYlGnBu[6])
)});
  main.variable(observer("candidatoDim")).define("candidatoDim", ["facts"], function(facts){return(
facts.dimension(d => d.NM_VOTAVEL)
)});
  main.variable(observer("candidatoGroup")).define("candidatoGroup", ["candidatoDim"], function(candidatoDim){return(
candidatoDim.group().reduceSum(d => +d.QT_VOTOS)
)});
  main.variable(observer("municipioDim")).define("municipioDim", ["facts"], function(facts){return(
facts.dimension(d => d.NM_MUNICIPIO)
)});
  main.variable(observer("municipioGroup")).define("municipioGroup", ["municipioDim"], function(municipioDim){return(
municipioDim.group()
)});
  main.variable(observer("municipioDimPE")).define("municipioDimPE", ["facts_eleitorado"], function(facts_eleitorado){return(
facts_eleitorado.dimension(d => d.NM_MUNICIPIO)
)});
  main.variable(observer("municipioGroupPE")).define("municipioGroupPE", ["municipioDimPE"], function(municipioDimPE){return(
municipioDimPE.group()
)});
  main.variable(observer("municipioDimVereador")).define("municipioDimVereador", ["facts_vereadores"], function(facts_vereadores){return(
facts_vereadores.dimension(d => d.NM_MUNICIPIO)
)});
  main.variable(observer("municipioGroupVereador")).define("municipioGroupVereador", ["municipioDimVereador"], function(municipioDimVereador){return(
municipioDimVereador.group()
)});
  main.variable(observer("layerList")).define("layerList", function(){return(
[]
)});
  main.variable(observer("style")).define("style", ["colorScale","qtComparecimentoPercentByName"], function(colorScale,qtComparecimentoPercentByName){return(
function style(feature) {
		 return {
					weight: 1,
					opacity: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.6,
					fillColor: colorScale(qtComparecimentoPercentByName.get(feature.properties.name.toUpperCase()))
				};
	}
)});
  main.variable(observer("cidades")).define("cidades", ["d3"], function(d3){return(
d3.json("https://raw.githubusercontent.com/Brabissima/datasets-projeto/main/cidades.json")
)});
  main.variable(observer("centreSpacing")).define("centreSpacing", function(){return(
130
)});
  main.variable(observer("data")).define("data", ["d3"], function(d3){return(
d3.csv("https://raw.githubusercontent.com/Brabissima/datasets-projeto/main/piramide_pop_mun.csv").then(function(data){
 data.forEach(function(d){
  d.QT_COMPARECIMENTO = +d.QT_COMPARECIMENTO
 }) 
 return data
})
)});
  main.variable(observer("datasetPartidos")).define("datasetPartidos", ["d3"], function(d3){return(
d3.json('https://raw.githubusercontent.com/EdvarFilho/Visualizacao-Cientifica/main/datasetPartidos.json')
)});
  main.variable(observer("facts2")).define("facts2", ["crossfilter","data"], function(crossfilter,data){return(
crossfilter(data)
)});
  main.variable(observer("munDim")).define("munDim", ["facts2"], function(facts2){return(
facts2.dimension(d => d.NM_MUNICIPIO)
)});
  main.variable(observer("sexoDim")).define("sexoDim", ["facts2"], function(facts2){return(
facts2.dimension(d => d.DS_GENERO)
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 10, right: 60, bottom: 20, left: 60}
)});
  main.variable(observer("width")).define("width", function(){return(
700
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da Visualização
<style>
#mapid {
				width: 750px;
				height: 590px;
			}
			.info {
				padding: 6px 8px;
				font: 14px/16px Arial, Helvetica, sans-serif;
				background: white;
				background: rgba(255,255,255,0.8);
				box-shadow: 0 0 15px rgba(0,0,0,0.2);
				border-radius: 5px;
			}
			.info h4 {
				margin: 0 0 5px;
				color: #777;
			}

			.legend {
				text-align: left;
				line-height: 18px;
				color: #555;
			}
			.legend i {
				width: 18px;
				height: 18px;
				float: left;
				margin-right: 8px;
				opacity: 0.7;
			}
</style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require("dc")
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.6.0')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  return main;
}
