
var padding = 3;
// var color = d3.scale.category10();
	
var margin = { top: 50, right: 50, bottom: 50, left: 50 };    
var width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


var force,
    labels,
    circle;

var flag = 1
var svg = d3.select("svg#chart")
            .attr("width", width) 
            .attr("height", height)
 //           .append("g")
    	    //.attr("transform", "translate(" + 250 + "," + 100 + ")");


var locations = {
         'العصر الجاهلي' :[ 100, height/2+200+Math.random()*70],
         'عصر المخضرمون' :[ 250,height/2+200+Math.random()*70],
         'العصر الإسلامي':[ 300, height/2+200+Math.random()*70],
         'العصر الأموي'  :[ 450,height/2+200+Math.random()*70],
         'العصر الأندلسي':[ 600,height/2+200+Math.random()*70],
         'العصر العباسي' :[ 750, height/2+200+Math.random()*70],
         'العصر العثماني':[ 900, height/2+200+Math.random()*70],
         'العصر الأيوبي' :[ 1150,height/2+200+Math.random()*70],
         'العصر المملوكي':[ 1300, height/2+200+Math.random()*70],
         'العصر الحديث'  :[ 1450,height/2+200+Math.random()*70],
       'العصر الحديث-الإمارات':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-البحرين':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-الجزائر':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-السعودية':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-السودان':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-العراق':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-المغرب':[1450,height/2+150+Math.random()*20],
       'العصر الحديث-اليمن':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-تونس':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-سوريا':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-عمان':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-فلسطين':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-لبنان':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-ليبيا':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-مصر': [1450,height/2+150+Math.random()*200],
       'العصر الحديث-الأردن':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-الكويت':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-قطر':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-موريتانيا':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-الصومال':[1450,height/2+150+Math.random()*200],
       'العصر الحديث-السنغال':[1450,height/2+150+Math.random()*200],
    }
const modern_era = ['العصر الحديث-الإمارات', 'العصر الحديث-البحرين',
       'العصر الحديث-الجزائر', 'العصر الحديث-السعودية',
       'العصر الحديث-السودان', 'العصر الحديث-العراق',
       'العصر الحديث-المغرب', 'العصر الحديث-اليمن', 'العصر الحديث-تونس',
       'العصر الحديث-سوريا', 'العصر الحديث-عمان', 'العصر الحديث-فلسطين',
       'العصر الحديث-لبنان', 'العصر الحديث-ليبيا', 'العصر الحديث-مصر',
       'العصر الحديث-الأردن', 'العصر الحديث-الكويت', 'العصر الحديث-قطر',
       'العصر الحديث-موريتانيا', 'العصر الحديث-الصومال',
       'العصر الحديث-السنغال']
const modern_colors = d3.scale.category20(modern_era)

svg.append('rect')
   .attr('width',1400)
   .attr('height',700)
   .style('fill','rgba(135,62,35,0.8)')
   .style('border-radius','8px')
   .style('opacity',0.3)
    .attr('transform','translate(0,'+ -30+')')

var eras = [
    {'era':'العصر الجاهلي' ,'loc':{x: 100,   y:550}}, 
    {'era': 'عصر المخضرمون' ,'loc':{x: 200,  y:550}},
    {'era': 'العصر الإسلامي','loc':{x: 230,  y:520}}, 
    {'era': 'العصر الأموي'  , 'loc':{x: 300, y:550}},
    {'era': 'العصر الأندلسي', 'loc':{x: 400, y:550}},
    {'era': 'العصر العباسي' , 'loc':{x: 530, y:550}}, 
    {'era': 'العصر العثماني', 'loc':{x: 680, y:550}}, 
    {'era': 'العصر الأيوبي' , 'loc':{x: 800, y:550}},
    {'era': 'العصر المملوكي', 'loc':{x: 900, y:550}}, 
    {'era': 'العصر الحديث'  , 'loc':{x: 1050,y:550}},

]
 
function color(era) {
    var colors = {
         'العصر الجاهلي': "#e0d400", 
         'العصر الإسلامي': "#1c8af9", 
         'العصر العباسي': "#51bc05",
         'العصر الأيوبي': "#ff7f00", 
         'العصر العثماني': "#db32a4", 
         'عصر المخضرمون': "#00cdf8",
         'العصر الأموي': "#e63b60",
         'العصر الأندلسي': "#8e5649", 
         'العصر المملوكي': "#68c99e", 
         'العصر الحديث': "#a477c8"}

    var color = colors[era]
    if (color ==undefined){
        color = modern_colors(era)
    }

	return color//s[era];
}

function setLocation(era){

    return {'x': locations[era][0], //+ Math.random()*150-margin.left-margin.right,
            'y' :locations[era][1] - margin.top - margin.bottom

        }
}



var era,era_origin;

var df; 
var poet_df;
var beat_breakdown;


d3.csv('aldiwan_short.csv',function(data){
//d3.csv('aldiwan_short2.csv',function(data){
//d3.csv('aldiwan.csv',function(data){
    df = data
     var tooltip = d3.select("body")
                    .append("div")
                    .attr("class","tooltip")
                    .style('text-align','right')
                    .style('background-color','rgb(219, 219, 225,0.5)')
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style('border-radius','20px')
                    .style("margin","20px")
                    .style("padding","10px")

       var poet_page = d3.select("body")
                    .append("div")
                    .attr('class','poet_page')
                    .style('background','rgba(135,62,35,0.8)')
                    .style('border-radius','8px')
                    //.style('display','flex')
                    .style("visibility", "hidden")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("top", "600px")
                    .style("left", "575px")
                    .style('padding' ,'1%')
                    .style('text-align','right')
                    .style('min-width','400px')
                    .style('max-width','800px')
                    .style('min-height','500px')


    nodes = data.map(function(p){
        era = p.era
        era_origin = p.era
        if (era.includes('العصر الحديث')){
            era = 'العصر الحديث'  
        }
        
        var pos =  setLocation(era_origin)
        return {
            'name': p.poet,
            'era': era_origin,
            'poems' : Math.pow(+p.poems_count,1/2.2),
            'cx' : pos.x+500 ,//+ Math.random()*150,
            'cy' : pos.y,
            'color': color(era_origin),
        }

    })
    labels = svg.selectAll('.text')
                .data(eras)
                .enter()
                .append("text")
                .text(d=>d.era)
                .style('font-size','13px')
                .attr('transform-origin', 'center')
                .attr('transform',d=>'translate('+(+d.loc.x-30)+','+d.loc.y+')')//+'rotate(45)');
                

    force = d3.layout.force()
              .nodes(nodes)
              .size([width, height])
		      .charge(charge)
		      .friction(.9)
		      .on("tick", tick)
		      .start()

    circle = svg.selectAll('.poet')
                    .data(force.nodes())
                    .enter().append("circle")
                    .attr('id',d=>d.name)
                    .style('opacity',0.4)
                    .style('fill',d=> d.color)
                    .attr('r',(d=>d['poems']))
                    .attr('cx',d=>d.x)
                    .attr('cy',d=>d.y)
                    .attr('id',d=>d.name)
                    .on("mouseover", function(d){
                        if (flag==1){
                            tooltip.text(d.name)
                            tooltip.style("visibility", "visible");
                            poetSummary(d.name)
                        }

                    })
                    .on("mousemove", function(){
                         tooltip
                            .style("top", (event.pageY-10)+"px")
                            .style("left",(event.pageX+10)+"px");})
                    .on("mouseout", function(){tooltip.style("visibility", "hidden");})
                    .on('click',function(d){
//                       d3.select(this)
//                         .transition()
//                         .duration(1000)
//                         .style('fill','gray') 

                        flag = 1 - flag 

                    })
 
    function poetSummary(poet){
       d3.selectAll('div.chart_tooltip').remove()
       var chart_tooltip = d3.select("body")
                    .append("div")
                    .attr('class','chart_tooltip')
                    .style('text-align','right')
                    .attr('background-color','black')
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
     
        poet_df = df.filter(d=>d.poet==poet)[0]
        
        var beat_df = poet_df.beat_count.split(',')

        beat_df = beat_df.map(function(d){
            bb  = d.split(':');
            return {'key' : bb[0],
                    'value': +bb[1]
                   }
               })
        
        beat_breakdown = beat_df.map(function(d){
                return {'beat'  : d.key,
                        'poems' : d.value,//.filter(dd=>dd.poem_flag=='poem').length
                        }
            }).filter(d=>d.beat!='')
    
        beat_breakdown = beat_breakdown.sort((a,b)=>d3.descending(a.poems,b.poems))
        
        beat_breakdown = beat_breakdown.map(function(d,i){
            if (i < 5){
                return d
            }else{
                return {'beat': 'اخرى',
                        'poems': d.poems}
            }
        })
        
        beat_breakdown = d3.nest().key(d=>d.beat).entries(beat_breakdown)
        beat_breakdown = beat_breakdown.map(function(d){
            return {'beat': d.key,
                    'poems': d.values.map(dd=>dd.poems).reduce((a,b)=>a+b)}
        }).sort((a,b)=>d3.descending(a.poems,b.poems))


        var poet = poet_df

        var pie = d3.layout.pie().value(d=>d.poems)
        var pie_colors = d3.scale.category20()


        genres =   poet_df.genre_count.split(',')
        genres = genres.map(function(d){
                    bb  = d.split(':');
                    return {'genre' : bb[0],
                            'poems': +bb[1]
                           }
                    }) 
        genres = genres.sort((a,b)=>d3.descending(a.poems,b.poems))
        genres = genres.map(function(d,i){
            if (i < 5){
                return d
            }else{
                return {'genre': 'اخرى',
                        'poems': d.poems}
            }
        })
        genres = d3.nest().key(d=>d.genre).entries(genres)
        genres = genres.map(function(d){

            return {'genre': d.key,
                    'poems': d.values.map(dd=>dd.poems).reduce((a,b)=>a+b)}

        }).sort((a,b)=>d3.descending(a.poems,b.poems))


        var dots = poet.long_descr.slice(0,300) + ((poet.long_descr.length > 300) ? '...' : '')
        poet_page.selectAll("*").remove()
        poet_page
            .style("visibility", "visible")

       var poet_info =  poet_page.append('div')
                                .attr('class','container')
                                .style("display","flex")
 

        quotes = poet_df.quote
        q = quotes.split(',')
        if (quotes.length > 0){
            poet_info
                .append('div')
                .style('padding','5px')
                .style('margin','5px')
                .style('background','grey')
                .style('float','right')
                .style('border-radius','8px')
                .style('min-width','385px')
                .attr('class','content')
                .html(`<h3>اقتباسات الشاعر</h3>`)
                .selectAll('.qq')
                .data(q)
                .enter()
                .append('div')
                .style('float','right')
                .attr('class','qq')
                
                .html(d=>`
                       <p>${d} </p>
                     `)	
        }

        poet_info
            .append('div')
            .style('min-width','385px')
            .style('padding','5px')
            .style('margin','5px')
            .style('background','grey')
            .style('border-radius','8px')
            .attr('class','content')
            .html(`<h3> ${poet.poet}  (${poet.era})</h3>
                   <p> ${dots}</p>   
                   <a href="${poet.poet_url}">الى صفحة الشاعر</a>
                 `)	



      var poet_charts =  poet_page.append('div')
                                .style("display","flex")
 

      var pie_charts =  poet_charts 
            .append('div')
            .style('padding','5px')//(d,i)=>pie_colors(i))
            .style('margin','5px')
            .attr('class','pie_chart')
            .style('background','grey')
            .style('border-radius','8px')
            .style('float','right')
            .style('min-width','385px')
            .append('svg')
            .attr('width','385px')


      pie_charts.append('g')
            .selectAll('.arc')
            .data(pie(beat_breakdown))
            .enter()
            .append('g')
            .append('path')
            .style('fill',(d,i)=>pie_colors(i))
            .style('stroke','white')
            .attr('d',d3.svg.arc()
                    .outerRadius(50)
                    .innerRadius(25)
            )
    	    .attr("transform", "translate(" + 100 + "," + 80 + ")")
            .on('mouseover',function(d){
                chart_tooltip.text(d.data.beat)
                chart_tooltip.style("visibility", "visible");
            }) 
                           
            .on("mousemove", function(){
                chart_tooltip
                    .style("top", (event.pageY-10)+"px")
                    .style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){
                 chart_tooltip.style("visibility", "hidden");
            })
        

       pie_charts
            .append('g')
        .selectAll('.garc')
            .data(pie(genres))
            .enter()
            .append('g')
            .append('path')
            .style('fill',(d,i)=>pie_colors(i))
            .style('stroke','white')
            .attr('d',d3.svg.arc()
                    .outerRadius(50)
                    .innerRadius(25)
            )
    	    .attr("transform", "translate(" + 260 + "," + 80 + ")")
            .on('mouseover',function(d){
                chart_tooltip.html(`<p>${d.data.genre}</p>`)
                chart_tooltip.style("visibility", "visible");
            }) 
                           
            .on("mousemove", function(){
                 chart_tooltip
                    .style("top", (event.pageY-10)+"px")
                    .style("left",(event.pageX+10)+"px");})
            .on("mouseout", function(){
                 chart_tooltip.style("visibility", "hidden");
            });

    }
   
});

function charge(d){
    return -d.poems*d.poems*0.25
}

function tick(e){

	  circle.each(moveTowardEraCenter(e.alpha));
      circle
	  	  .each(collide(.5))
	  	  .style("fill",d=>d.color )
          .style('stroke','black')
	      .attr("cx", function(d) { return d.x; })
	      .attr("cy", function(d) { return d.y})
          .attr('opacity',.5);
    
}

function moveTowardEraCenter(alpha){
    return function(d){
        var center = setLocation(d.era);
        d.x +=(center.x-d.x)*0.1*alpha
        d.y +=(center.y-d.y)*0.1*alpha
    }
}
    // Resolve collisions between nodes.
	
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	  return function(d) {
	    var r = d.len+3 
	        nx1 = d.x - r,
	        nx2 = d.x + r,
	        ny1 = d.y - r,
	        ny2 = d.y + r;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y),
	            r = d.radius + quad.point.radius + (d.act !== quad.point.act) * padding;
	        if (l < r) {
	          l = (l - r) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}
//


