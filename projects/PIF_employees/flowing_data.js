// <!DOCTYPE html>
// <meta charset="utf-8">

// <!-- Load d3.js -->
// <script src="https://d3js.org/d3.v4.js"></script>

// <!-- Create a button to trigger the transition -->
// <button onclick="triggerTransitionDelay()">Trigger transition</button>
// 	// console.log(nodes)
// <!-- Create a svg area-->
// <svg id="dataviz_delay" width="400px" height="520px"></svg>


var USER_SPEED = "medium";
var start_year = 2015; 

var width = 1600,
    height = 1200,
	padding = 1,
	maxRadius = 3;
	// color = d3.scale.category10();
	

var num_branches = 35;
var R = 300
var counter = 4;
var radius = 3;   
// var force 
var cc = 0; 
// var nodes; 
var rBig = 130
var rReg = 50
var fontsize=20;
var margin = { top: 50, right: 50, bottom: 50, left: 50 };    
var width = 1500 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom;


var centerx = width/2 - 50
var centery = height/2 - 100
var move_counter = 0

var ts = [];



var nodes; 
var sched_objs = [],
	curr_minute = 1;


var speeds = { "slow": 1000, "medium": 200, "fast": 50 };

var foci = {} 

var coming_from = {} 
var companies = {} 

var brLoc = function(i){
    // get location of all companies
	var pos; 
	if(i ==-1){
		pos =  {x: centerx,
				y: centery}
	}
	else if (i==-3){
		//var theta = 2*Math.PI*Math.random()
		pos =  {x: 180,
            	y: 200}     

    }else if (i==-2){
        pos = {x: 80,
               y: 600} 
   }else if (i < 18){
       var RR = R +100; 
       var theta = 2*3.1415 * (i /18)
		pos = {x: RR*Math.cos(theta) + centerx  ,
			   y: RR*Math.sin(theta) + centery }

    }else if (i < 36){
       var RR = R -30; 
       var theta = 2*3.1415 * ((i-17) /17)
		pos = {x: RR*Math.cos(theta) + centerx  ,
			   y: RR*Math.sin(theta) + centery }

   }else{
        // if (i==-3) i = 10; 
        var RR = R + ( (i%2==0) ? 100:-40)
        i--; 
        var theta = 2*3.1415 * (i /(num_branches))
        //var theta = 2*Math.PI * (i / num_branches)
		pos = {x: RR*Math.cos(theta) + centerx  ,
			   y: RR*Math.sin(theta) + centery }
    }

	return pos

}
for(var i=-3; i<num_branches; i++){
    foci[i] = brLoc(i)
}



d3.select("#chart")
    .append('g')
    .attr("width",300)
    .attr("height",200)
    .attr("id","timeseries")
    .attr("transform", "translate(" + -10 + "," + 220 + ")");


d3.select("#chart")
    .append('g')
   // .attr("width",300)
   // .attr("height",200)
   // .attr("id","timeseries")
    .append("text")
    .attr("transform", "translate(" + 50 + "," + 275 + ")")
    .attr("font-size","16px")
    .attr("font-family","monospace")
    .text("employees hired per month")



var plot = d3.select("#timeseries")
              .append("svg")
              .attr("id","ts_plot")
              .attr('width',330)
              .attr("height",300)
    
    var x_ts = d3.time.scale()
    .domain([0,90])
    .range([50, 320]);

    var y_ts = d3.scale.linear()
    .domain([-10,170])
    .range([270, 70]);

    var xAxis = d3.svg.axis()
                  .scale(x_ts)
                  .tickValues(d3.range(1,91,12))
                  .tickFormat(d=>(minutesToTime(d).slice(0,4)))
                  .tickPadding(10)
                  .orient("bottom")

    var yAxis = d3.svg.axis()
                  .scale(y_ts)
                  .orient("left")
                  
    var line = d3.svg.line()
                 .x(d=>x_ts(d[0]))
                 .y(d=>y_ts(d[1]))
                 .interpolate("linear")


    plot.append("rect")
        .attr("x",50)
        .attr("y",70)
        .attr("width",60)
        .attr("height",200)
        .attr("opacity",0.5)
        .attr("fill","orange")
        .attr("stroke","2px")


    plot.append("rect")
        .attr("x",110)
        .attr("y",70)
        .attr("width",210)
        .attr("height",200)
        .attr("opacity",0.5)
        .attr("fill","green")

    plot.append("g")
        .append("line")
        .attr({
            "class":"v2030",
            "x1" : 110,
            "x2" : 110,
            "y1" : 270,
            "y2" : 70,
            "opacity": 0.8, 
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "green",
            "stroke-width" : "2px"
        });
    plot.append("g")
        .attr("x",110)
        .attr("y",100)
        .append("text")
        .attr("x",115)
        .attr("y",100)
        .text("vision 2030 launched")
        .attr("opacity",0.9)
        .attr("font-size",15)
        .attr("font-family","monospace")

    plot.append("g")
        .attr("transform","translate(50,0)")
        .call(yAxis)
        .attr("font-size","14px")

    plot.append("g")
        .attr("transform","translate(0,265)")
        .call(xAxis)
        .attr("font-size","15px")
        .attr('color',"green")

    plot.append("g")
        .selectAll("line.verticalGrid").data(x_ts.ticks(9)).enter()
        .append("line")
        .attr(
        {
            "class":"horizontalGrid",
            "x1" : d=>x_ts(d),
            "x2" : d=>x_ts(d),
            "y1" : 275,
            "y2" : 70,
            "opacity": 0.6, 
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "grey",
            "stroke-width" : "1px"
        });

 
    plot.append("g")
        .selectAll("line.horizontalGrid").data(y_ts.ticks(9)).enter()
        .append("line")
        .attr(
        {
            "class":"horizontalGrid",
            "x1" : 45,
            "x2" : 322,
            "y1" : function(d){ return y_ts(d);},
            "y2" : function(d){ return y_ts(d);},
            "opacity": 0.6, 
            "fill" : "none",
            "shape-rendering" : "crispEdges",
            "stroke" : "grey",
            "stroke-width" : "1px"
        });

    plot.append("g")
         // .attr("clip-path","url(#innerGraph)")
          .attr("transform","translate(0,0)")
          .append("svg:path")
          .attr("class","line")
          .attr("d",line(ts))



d3.select("#chart")
    .append('g')
    .attr("width",300)
    .attr("height",200)
    .append("text")
    .attr("id","current_time")
    .attr("transform", "translate(" + 40 + "," + 50 + ")");

var svg = d3.select("svg#chart")//.append("svg")
            .attr("width", width) 
            .attr("height", height)
            .append("g")
    	    .attr("transform", "translate(" + 250 + "," + 50 + ")");

function color(activity) {
	
	var colorbyactivity = {
		"0": "#e0d400",
		"1": "#1c8af9",
		"2": "#51bc05",
		"3": "#ff7f00",
		"4": "#db32a4",
		"5": "#00cdf8",
		"6": "#e63b60",
		"7": "#8e5649",
		"8": "#68c99e",
		"9": "#a477c8",
		"10": "#5c76ec",
		"11": "#e773c3",
		"12": "#799fd2",
		"13": "#038a6c",
		"14": "#cc87fa",
		"15": "#ee8e76",
		"16": "#bbbbbb",
	}
v
	return colorbyactivity[activity];
	
}



function minutesToTime(n) {
    y = Math.floor((n-1)/12) + start_year
    nn = n%12

    m = ((n%12 == 0) ?  12:(n%12))
    m = ((m<10) ? '0':'') + m
    return y + '-' + m
}

var tt; 
var ttt;
var ww;
function wrap(text, width) {
    ttt = text;
    text.each(function (d) {
        var text = d3.select(this),
            words = d.company_slug.split(/\s+/).reverse().filter(d=>d.length > 0),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.7, // ems
            x = +text.attr("x"),
            y = +text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tt = text.append("text")//text(null)
                        .attr('font-size',(words[0] === 'PIF') ? '30px':'15px')
                        .attr("font-family",'monospace')
                        .attr('word-wrap','break-word')
                        .style('width','50px'),

            tspan =   tt.append("tspan")
                        .attr("x", x)
                        .attr("y", y + 5)//*(3-words.length))
                        .attr("dy", dy + "em");


        //tt = tex
        ww = words
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = tt.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}

d3.csv('PIF_comps_test5.csv',function(c_data){
    //num_branches = c_data.length-2
    svg.selectAll('.c_circle')
    .data(c_data)
    .enter().append("circle")
    .style('opacity',0.4)
    .style('fill',(d=> d.cid == -1 ? 'green': 'orange'))
    .attr('r',(d=> (d.cid < 0 && d.cid > -3) ? rBig: rReg))
    .attr('cx',(d=>foci[+d.cid].x))
    .attr('cy',(d=>foci[+d.cid].y))
    .attr('id',d=>d.cid)
    
   var labels = svg.selectAll('text')
                 .data(c_data)
                 .enter().append("g")//.append("text")
                 .attr('class','comp name')
                 .attr('id',d=>d.cid)
                 .attr('x',(d=>foci[+d.cid].x  -30))//- (d.cid < 0 ? 0: rReg) ))
                 .attr('y',function(d){
                    var yloc = foci[d.cid].y-30;
                    return yloc;
                  })
                 .call(wrap,80)

     c_data.filter(d=>(d.cid != -1 ) || (d.cid !=-2) ).forEach(function(d){
        coming_from[d.cid] = 0
        companies[d.cid] = d.company_slug

        if(d.cid == -3){
            companies[d.cid] = 'Fresh Graduates'
        }
     })
     
//
//    labels.append('tspan')
//        .attr('x',function(d){
//         return d3.select(this.parentNode).attr('x');
//         })
//         .attr('y',function(d){
//         var yloc = d3.select(this.parentNode).attr('y');
//         return yloc;
//         })
//         // .attr('text-anchor','left')
//         .attr('font-size',`${fontsize}px`)
//         .attr("font-family",'monospace')
//         .attr('word-wrap','break-word')
//         .style('width','50px')
//         .attr("dy","1.2em")
//         .text(d=> companies[d.cid])

    total = svg.append('text')
                .attr('class','total emp')
                .attr('x',centerx)
                .attr('y',centery+30)
                .attr('font-size',`${fontsize}px`)


});


// Load data and let's do it.
d3.csv("PIF_employee_test5.csv", function(error, data) {	
    console.log(data)
	data.forEach(function(d) {
		var day_array = d.moveto.split(",");
		var activities = [];
        var color = (d.gender=='male') ? 'blue' : 'red'
		for (var i=0; i < day_array.length; i++) {
			// Duration
			if (i % 2 == 1) { 
				activities.push({'act': day_array[i-1], 
                                 'duration': +day_array[i],
                                 'color':color,
                                 'id':d.linkedin_username});
			}
		}
		sched_objs.push(activities);
	});

	// A node for each person's schedule
	nodes = sched_objs.map(function(o,i) {
		var act = o[0].act;
		var id = o[0].id;
		var init_x = foci[act].x + Math.random();
		var init_y = foci[act].y + Math.random();
		return {
			act: act,
			radius: radius,
			x: init_x,
			y: init_y,
			color: o[0].color,//color(act),
			moves: 0,
			next_move_time: o[0].duration,
			sched: o,
            id : id,
		}
	});

	var force = d3.layout.force()
		.nodes(nodes)
		.size([width, height])
		// .links([])
		.gravity(0)
		.charge(0)
		.friction(.9)
		.on("tick", tick)
		.start();


	var circle = svg.selectAll("circle")
		.data(nodes)
	    .enter().append("circle")
		.attr("r", function(d) { return d.radius; })
		.style("fill", function(d) { return d.color; })
		// .call(force.drag);
	
    


    // setup time series plot 
	
    var plot = d3.select("#timeseries")
              .append("svg")
              .attr("id","ts_plot")
              .attr('width',330)
              .attr("height",300)
   
    // add legend 
    svg.append("g")
       .attr("class","legend")
       .attr('transform','translate('+-100+','+ 30+')')

    svg.select(".legend")
       .append("circle")
       .attr("r","15px")
       .attr("cx",-100)
       .attr("cy",10)
       .attr("fill","blue")
       .attr("opacity",0.5)
 
    svg.select(".legend")
       .append("text")
       .attr("transform","translate(-75,13)")
       .text("male")
       .attr("font-size","25px")
       .attr("font-family","monospace")
 
    svg.select(".legend")
       .append("text")
       .attr("transform","translate(-75,56)")
       .text("female")
       .attr("font-size","25px")
       .attr("font-family","monospace")

    svg.select(".legend")
       .append("circle")
       .attr("r","15px")
       .attr("cx",-100)
       .attr("cy",50)
       .attr("fill","red")
       .attr("opacity",0.5)


     // Update nodes based on activity and duration
	function timer() {
        var count = 0
        if(curr_minute == 0){
            ts = []
		    d3.range(nodes.length).map(function(i) {
                nodes[i].act = nodes[i].sched[0].act;
                nodes[i].next_move_time = nodes[i].sched[0].duration;
                nodes[i].moves = 0;
            })
        }
		d3.range(nodes.length).map(function(i) {
			var curr_node = nodes[i],
				curr_moves = curr_node.moves; 

			// Time to go to next activity
			if (curr_node.next_move_time == curr_minute) {
				if (curr_node.moves == curr_node.sched.length-1) {
					curr_moves = 0;
				} else {
					curr_moves += 1;
				}
			    
                if((curr_node.sched[curr_moves].act == -1)){
                    count++; 

                }

                if((curr_node.sched[curr_moves].act == -1) && (curr_node.act != -2)){
                    coming_from[curr_node.act]+=1;

                }
				// Move on to next activity
				curr_node.act = curr_node.sched[ curr_moves ].act;
			
				curr_node.moves = curr_moves;
				curr_node.cx = foci[curr_node.act].x;
				curr_node.cy = foci[curr_node.act].y;
				nodes[i].next_move_time = nodes[i].sched[ curr_node.moves ].duration;
			}

		});

		force.resume();
        ts.push([curr_minute,count])
        plotTs()


		// Update time
		var true_minute = curr_minute % 91;
		d3.select("#current_time").text(minutesToTime(true_minute));
        if (minutesToTime(true_minute) == '2022-06'){
		    setTimeout(timer, 10000);
            curr_minute = 0; 
        }else{ 
            setTimeout(timer, speeds[USER_SPEED]);
		    curr_minute += 1;
        }
	}


	var true_minute = curr_minute % 91;
	d3.select("#current_time").text(minutesToTime(true_minute));
	setTimeout(timer, 5000);
	//setTimeout(timer, 10000);

		
	function tick(e) {
	  var k = 0.04 * e.alpha;
      
	  // Push nodes toward their designated focus.
	  nodes.forEach(function(o, i) {
		var curr_act = o.act;
		
		// Make sleep more sluggish moving.
		if (curr_act == "-1") {
			var damper = 1;
		} else {
			var damper = 1;
		}
		//o.color = color(curr_act);
	    o.y += (foci[curr_act].y - o.y) * k * damper;
	    o.x += (foci[curr_act].x - o.x) * k * damper;
	  });

	  circle
	  	  .each(collide(.5))
	  	  .style("fill", function(d) { return d.color; })
	      .attr("cx", function(d) { return d.x; })
	      .attr("cy", function(d) { return d.y; })
          //.style("opacity",d=> (d.act==-3) ? 0.0:0.5 );
          .attr('opacity',.5);
    
      //console.log(circle)
	}

    
	// Resolve collisions between nodes.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	  return function(d) {
	    var r = d.radius + maxRadius + padding,
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


    function plotTs(){
        var count = 0; 
        nodes.forEach(function(n,i) {
            if(n.act ==-1){
                count++;
            }
        })
        //ts.push([curr_minute,count ])

        var pts = d3.select("#ts_plot")
        pts.select(".line")
           .attr("fill","none")
           .attr("stroke-width","2.5px")
           .attr("stroke","black")
           .attr("d",line(ts))
           .transition()
           .delay(0)
           .duration(USER_SPEED-100)
           .ease("linear")
           

        d3.select(".current_count")
            .text("incoming employees at PIF: " + ts[ts.length-1][1])
    }



}); // @end d3.tsv


