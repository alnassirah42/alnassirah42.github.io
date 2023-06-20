// selecting tabs: 

var tabButtons = document.querySelectorAll(".tab-container .tab-buttons button")
var tabPanels = document.querySelectorAll(".tab-container .panel")

var panel_index = sessionStorage.getItem("panel_index");

if(!panel_index){
    panel_index = 0;
}

console.log(panel_index)
function showAllPanel(){
    tabButtons.forEach(function(node){
        node.style.backgroundColor="";
        node.style.color="";
    });
    
    tabPanels.forEach(function(node){
        node.style.display="block";
    });

}
$("#filter-input").on("keyup",filterTable)




function showPanel(p_index){
    panel_index = p_index;
    
    sessionStorage.setItem("panel_index",p_index)
    tabButtons.forEach(function(node){
        node.classList.remove("focus");
    });
    
    tabPanels.forEach(function(node){
        node.style.display="none";
    });
    tabButtons[panel_index].setAttribute("class","focus");
    tabPanels[panel_index].style.display= "block";
    // tabPanels[panel_index].style.backgroundColor= "#eee"
    redrawCharts();
}




var year = "all"
var month = "all";
var dft,yms;

var YM = 'all'; 
var category = 'all';
var credit = 'all';
const credit_d = {'credit':-1,
                  'debit': 1}

var category_colors;
var sort = 'chronological'
var sort_d = {'chronological':'date',
              'descending': 'amount'}

function makeplot() {
  Plotly.d3.csv("myspending.csv", 
      function(d){
          amount = Math.random()*400;
          if (d['transaction type'] == 'salary'){
            amount = -60*amount;
          }
          if (d['transaction type'] == 'stcpay credit'){
            amount = -amount;
          }
          return {
            date: d.date,
            amount: amount,//+d.amount,
            card: d.card,
            description: d.Description,
            YM : d.YM,
            category: d.category,
            category_n: d.category_n,
            // cumulative_sum: +d.cumulative_sum,
            transaction_type: d['transaction type'],
        }
      },  
      function(data){ 
          dft = data;
          makeCreditDebitButtons()
          yms = [... new Set(dft.map(d=>d.YM))]
          yms = d3.sort(yms,(a,b)=>d3.ascending(a,b))
          YM = "all"
          yms.push('all')
          makeYMButtons(yms)

          makeSortDropDown()

          // make unified color scheme for categories

          cats = [... new Set(dft.map(d=>d.category_n))]
          cats = d3.sort(cats,(a,b)=>d3.ascending(a,b))
          cats.push('all')
          category_colors = d3.scaleOrdinal(d3.schemeSet3)
          category_colors.domain(cats)

          // make unified color scheme for transaction_type

          txn_types = [... new Set(dft.map(d=>d.transaction_type))]
          txn_types = d3.sort(cats,(a,b)=>d3.ascending(a,b))
          txn_types.push('all')
          txn_types_colors = d3.scaleOrdinal(d3.schemeTableau10)
          txn_types_colors.domain(txn_types)


          makeCatButtons(cats)
          category = 'all'
          processData(YM,category,credit,sort) } );

};

function writeSummary(){

    monthly_p = $("#monthly-overview > .summary")

    max_amount_in_a_day = d3.sort(df,(a,b)=>d3.descending(a.amount,b.amount))
    max_amount_in_a_day = max_amount_in_a_day[0].amount.toFixed(2);
    max_amount_in_a_day = parseFloat(max_amount_in_a_day).toLocaleString();
    monthly_p.text(`maximum amount spent in a day is ${max_amount_in_a_day}`)


    table_p = $("#tables > .summary")
    
    total_spent = d3.sum(d3.filter(df_month,d=>d.transaction_type!="salary"),d=>d.amount);
    total_spent = total_spent.toFixed(2);
    total_spent = parseFloat(total_spent).toLocaleString();

    total_transactions = d3.sum(d3.filter(df_month,d=>d.transaction_type!="salary"),d=>1);
    total_transactions = parseFloat(total_transactions).toLocaleString();

    table_p.text(`spent ${total_spent} in ${total_transactions} transactions`)

    flow_p = $("#flow > .summary")
    total_income = -d3.sum(d3.filter(df_month,d=>d.amount<0),d=>d.amount)
    total_spent = d3.sum(d3.filter(df_month,d=>d.amount>0),d=>d.amount)
    total_saved = total_income - total_spent;

    total_income = total_income.toFixed(2);
    total_income = parseFloat(total_income).toLocaleString();
    
    total_spent = total_spent.toFixed(2);
    total_spent = parseFloat(total_spent).toLocaleString();

    total_saved = total_saved.toFixed(2);
    total_saved = parseFloat(total_saved).toLocaleString();
    // total_transactions = d3.sum(d3.filter(df_month,d=>d.transaction_type!="salary"),d=>1)

    flow_p.text(`total incoming ${total_income} total spent ${total_spent} total saved ${total_saved}`)

}

function processData(YM,category,credit,sort) {
    showAllPanel()
    // dft = data
    df_month_wsal = dft 
    if (YM !='all'){
        s_year = YM.split('-')[0]
        s_month = YM.split('-')[1]
        if (s_year !='all'){
            df_month_wsal = d3.filter(dft,d=>d.YM.split('-')[0] == s_year)
        }
        if (s_month !='all'){
            df_month_wsal = d3.filter(df_month_wsal,d=>d.YM.split('-')[1] == s_month)
        }
    }
    df_month = df_month_wsal//d3.filter(df_month_wsal,d=>d["transaction_type"] != 'salary')  
    if (category !='all'){
        df_month = d3.filter(df_month,d=>d["category_n"] == category)  
    }

    if (credit !='all'){
        df_month = d3.filter(df_month,d=>credit_d[credit]*d.amount > 0)  
    }

    cumsum = 0;
    for(i=0;i<df_month.length;i++){
        cumsum += df_month[i]['amount']
        df_month[i]['cumulative_sum'] = cumsum
    }
    df = d3.rollup(df_month,v=>d3.sum(v,d=>d.amount),d=>d.date)
    df = [...df].map(function(d){return {date:d[0],amount:d[1]}})
    layout = {

        margin: {
            // l: 100,
            // r: 10,
            // b: 40,
            // t: 10,
            l: 5,
            r: 35,
            b: 80,
            t: 20,

        },
        paper_bgcolor : '#23283e',
        plot_bgcolor : '#23283e',
        show_legend:true,
        font: {
            size: 12,
            color: "#ffffff",
        }
    }
    
    var x = [], y = [];
    var cumsum = 0; 
    for (var i=0; i<df.length; i++) {
        
        row = df[i];
        cumsum += row['amount']
        x.push( row['date'] );
        y.push(cumsum );
    }

    plotLine( x, y,"lineChart",YM);
    
    // pie chart 
    f = v=>d3.sum(v,d=>d[value])
    df_pie = prepareData(df_month,key='category_n',value='amount',f,category_colors)
    var pie_data = [{
        values : df_pie.map(d=>d['amount']),
        labels : df_pie.map(d=>d['category_n']),
        marker :{
            colors: df_pie.map(d=>category_colors(d['category_n'])),
        },
        type   : 'pie'
    }]
    Plotly.newPlot('pieChart',pie_data,layout)

    // bar chart
    f = v=>d3.sum(v,d=>d[value])
       
    makeBar(df_month);
    // makeRadar(df_month);
    makeTable(df_month,sort);
    makeSummary(df_month);
    sankeyChart(df_month_wsal)
    showPanel(panel_index)

    writeSummary()
}

function plotLine(x, y, id,YM){
    var layout = {
        title: 'spending over '+ YM,
        margin: {
            l: 40,
            r: 30,
            b: 50,
            t: 50,
        },
        xaxis: {
            showgrid: true,
            zeroline: true,
            // tickcolor: "rgba(256,256,256,0.5)",
            // tickwidth: 40,
            gridcolor: "rgba(256,256,256,0.1)",
            // gridwidth: 15,

        },
        yaxis: {
            showline: true,
            tickcolor: "rgba(256,256,256,0.5)",
            tickwidth: 15,
            gridcolor: "rgba(256,256,256,0.1)",
            // gridwidth: 15,

        },
        name: 'spending',

        paper_bgcolor : '#23283e',
        plot_bgcolor : '#23283e',
        show_legend:true,
        font: {
            size: 12,
            color: "#ffffff",
        },
    }
    var plotDiv = document.getElementById("plot");

    var traces = [{
        x: x, 
        y: y,
        fill: "tozeroy",
        mode: "lines",
        type: 'scatter',
        hovermode: 'unified',
        line: {
            color: 'rgb(256,256,256)',
            width: 2.5,
        },
        

    }];

    Plotly.newPlot(id, traces ,layout);

};
function prepareData(df,key,value,f,color_scheme){
    dfg = d3.rollup(df,f,d=>d[key])
    dfg = [...dfg].map(function(d){return {[key]:d[0],[value]:d[1]}})
    dfg = [...dfg].map(function(d){
        return {[key]:d[key],
                [value]:d[value],
                color: color_scheme(d[key])
                }
    })
    return dfg
}
function makeTable(df,sort){
    
    if (sort == 'chronological'){
    df = d3.sort(df,(a,b)=>d3.ascending(a[sort_d[sort]],b[sort_d[sort]]))
    }else{
    df = d3.sort(df,(a,b)=>d3.descending(a[sort_d[sort]],b[sort_d[sort]]))
    }
    const top10 = (d)=> d.length < 10 ? d: d.slice(0,10)+'...'

    var values = [
        df.map(d=>d['date']),
        df.map(d=>top10(d['description'])),
        df.map(d=>d['category_n']),
        df.map(d=>d['transaction_type']),
        df.map(d=>d['amount'].toFixed(2)),
        df.map(d=>d['cumulative_sum'].toFixed(2)),
    ]

var data = [{
  type: 'table',
  header: {
    values: [["<b>date</b>"], ["<b>description</b>"],
			 ["<b>category</b>"], ["<b>txn. type</b>"], 
             ["<b>amount</b>"],["<b>total</b>"]],
    align: "center",
    line: {width: 1, color: 'white'},
    fill: {color: "#90a0d9"},
    font: {family: "Arial", size: 10, color: "black"}
  },
  cells: {
      values: values,
      align: "left",
      line: {color: "white", width: 1},
      font: {family: "Arial", size: 8, color: ["white"]},
      height: 20,
      margin:{
          l:0,
      },
      fill : {color : '#23283f',},
    
  },
    columnwidth : [1,1.2,1,1.2,0.8,0.8],
    customdata: [df.map(d=>d['description'])],
    hoverinfo: "{customdata[0]}",   
}]
 style_table={
     hoverlabel: { bgcolor: "salmon" },
     'overflowY': 'scroll',
     margin: {
        l: 1,
        r: 1,
        b: 1,
        t: 1,
    },
    paper_bgcolor : '#23283e',
    plot_bgcolor : '#23283e',

 },
Plotly.newPlot('tableDiv', data,style_table);
};

function makeRadar(df){
    df_radar = d3.flatRollup(df_month,
                        x => ({
                          transaction_type: x.map(d => d.transaction_type),
                          category: x.map(d => d.category_n),
                          amount: x.map(d=>d.amount),  
                        }),
                        d => d.transaction_type,
                        d=> d.category_n
                      );
    df_radar = df_radar.map(function(d){
    return {
        transaction_type: d[0],
        category: d[1],
        total_amount: d3.sum(d[2].amount)
        }
    })
    df_radar = d3.rollup(df_radar,v=>v,d=>d.transaction_type)

    data = []

    range = 0
    df_radar.forEach(function(d){
        rs = d3.map(d,d=>d.total_amount)
        if (range < d3.max(rs)){
            range = d3.max(rs)
        }
        rs.push(rs[0])
        cats = d3.sort(d3.map(d,d=>d.category))
        cats.push(cats[0])
        data.push({
            type: 'scatterpolar',
            r : rs,
            theta: cats,
            name: d[0].transaction_type,
            fill:'toself',
           })
    });

    layout = {
        polar: {
            radialaxis: {
                visible: true,
                range: [0, range],
                color: "white",
            },
            bgcolor : '#23283e',
        },
      // showlegend: false
        margin: {
            l: 30,
            r: 50,
            b: 40,
            t: 20,
        },
        font: {
            size: 10,
            color: "#ffffff"
        },
        show_legend:true,
        xaxis : {
            visible : false,
        },
        paper_bgcolor : '#23283e',
    }
    Plotly.newPlot('barChart',data,layout)

}
function makeBar(df){

    df_bar = prepareData(df,key='transaction_type',value='amount',f,txn_types_colors)
    df_bar = d3.map(df_bar,function(d){
        return {
                amount: Math.abs(d.amount),
                color: d.color,
                transaction_type: d.transaction_type
        }
    });
    df_bar = d3.sort(df_bar,(aa,bb)=>d3.descending(aa['amount'],bb['amount']))
     
    df3 = df_bar.map(function(d){
        var trace = {
            x : [d['transaction_type']],
            y : [d['amount']],
            legendgroup : [d['transaction_type']],
            type : 'bar',
            marker: {
                color: d['color'],
            },
            name : d['transaction_type'],
            showlegend:true,
        }
        return trace
    })
    layout = {margin: {
        l: 30,
        r: 10,
        b: 40,
        t: 10,
    },
        font: {
            size: 10,
            color: "#ffffff"
        },

        // paper_bg_color:"#eee",
        // plot_bgcolor: '#c7c7c7',
        show_legend:true,
        xaxis : {
            visible : false,
        },
        paper_bgcolor : '#23283e',
        plot_bgcolor : '#23283e',

    }
    Plotly.newPlot('barChart',df3,layout)
}


function makeSummary(df){
    f = v=>d3.sum(v,d=>d[value])

    summary = prepareData(df,key='category_n',value='amount',f,category_colors)
    f = v=>v.length
    summary_num = prepareData(df,key='category_n',value='amount',f,category_colors)


    for(i=0; i<summary.length;i++){
        summary[i]['transactions'] = summary_num[i]['amount']
        summary[i]['avg. ticket'] = summary[i]['amount']/summary[i]['transactions']
    }
    sum = d3.sum(d3.filter(summary,d=>d.category !='salary').map(d=>d.amount))
    txn_sum = d3.sum(summary.map(d=>d.transactions))

    summary.push({category_n:'total',
                  amount:sum.toFixed(2),
                  transactions:txn_sum,
                  'avg. ticket':sum/txn_sum,  
                })

    var values = [
        summary.map(d=>d['category_n']),
        summary.map(d=>(+d['amount']).toFixed(2)),
        summary.map(d=>d['transactions']),
        summary.map(d=>(+d['avg. ticket']).toFixed(2)),
        summary.map(d=>((+d['amount'])/sum*100).toFixed(2) + '%'),
    ]

var data = [{
  type: 'table',
  header: {
    values: [["<b>category</b>"],
             ["<b>amount</b>"],
             ["<b>transactions</b>"],
             ["<b>average</b>"],
             ["<b>pct</b>"],
            ],
    align: "left",
    line: {width: 1, color: 'white'},
    fill: {color: "#90a0d9"},
    font: {family: "Arial", size: 10, color: "black"},
    height: 15,
  },
  cells: {
    values: values,
    align: "left",
    line: {color: "white", width: 1},
    font: {family: "Arial", size: 10, color: ["white"]},
    height: 20,
    fill : {color : '#23283f',},
  }
}]
 style_table={
     'overflowY': 'scroll',
     margin: {
        l: 1,
        r: 1,
        b: 1,
        t: 1
    },
    paper_bgcolor : '#23283e',
    plot_bgcolor : '#23283e',
 },
Plotly.newPlot('summaryDiv', data,style_table);

}

function sankeyChart(df){
    
    dfg = prepareData(df,
                      key='category_n',
                      value='amount',
                      v=>d3.sum(v,d=>d.amount),
                      category_colors)

    incoming = d3.filter(df,d=>d.amount<0)
    incoming = prepareData(incoming,
                           key='category_n',value='amount',
                           v=>-d3.sum(v,d=>d.amount),
                           category_colors)

    spending = d3.filter(df,d=>d.amount>0)
    spending = prepareData(spending,
                           key='category_n',value='amount',
                           v=>d3.sum(v,d=>d.amount),
                           category_colors)
    
    targets = []
    values = []
    sources = []
    labels = []
    colors = []

    // source first: 
    total_index= incoming.length;
    for(i=0; i<incoming.length; i++){
        c = incoming[i]
        sources.push(i)
        targets.push(total_index)
        labels.push(c['category_n'])
        values.push(c['amount'].toFixed(2))
        colors.push(category_colors(c['category_n']))
    }
    // total 
    labels.push('total')
    colors.push('gray')
    
    // outgoing: 
    for(i=0; i<spending.length; i++){
        c = spending[i]
        sources.push(total_index)
        targets.push(i+total_index+1)
        labels.push(c['category_n'])
        values.push(c['amount'].toFixed(2))
        colors.push(category_colors(c['category_n']))
    }

    saved = d3.sum(incoming,d=>d.amount) - d3.sum(spending,d=>d.amount)
    labels.push('saved')
    if (saved > 0) {
        targets.push(sources.length+1)
        sources.push(total_index)
        values.push(saved)
        colors.push('lightblue')

    }else{
        sources.push(sources.length+1)
        targets.push(total_index)
        values.push(-saved)
        colors.push('#aa0000')
    }
    var data = {
        type: "sankey",
        orientation: "h",
        node: {
        pad: 15,
        thickness: 30,
        line: {
          color: "white",
          width: 0.5
        },
       label: labels,
       color: colors
          },

      link: {
        source: sources,
        target: targets,
        value:  values,
      }
    }

    var data = [data]

    var layout = {
        // autosize=false,
        // width = "100%",
        // height = "100%",
        title: "money flow",
        font: {
            size: 12,
            color: "#ffffff",
        },
        margin: {
            l: 20,
            r: 20,
            b: 10,
            t: 50,
        },
        paper_bgcolor : '#23283e',
        plot_bgcolor : '#23283e',

    }

    Plotly.react('sankeyChart', data, layout)
}

const buttons = d3.select("#year-month")

const categories = d3.select("#categories")
const credit_debit = d3.select("#credit-debit")
const sorts = d3.select("#sort-table")


function makeYMButtons(yms) {
    years = [... new Set(d3.map(yms.slice(0,yms.length-1),d=>d.slice(0,4)))]
    years = [...['year','all'],...years]
    months = [... new Set(d3.map(yms.slice(0,yms.length-1),d=>d.slice(5,7)))]
    months = d3.sort(months)
    months = [...['month','all'],...months]
    buttons
        .append("select")
        .attr("class","select-year")
        .attr("id","years")
        .selectAll("input.year")
        .data(years)
        .enter()
        .append('option')
        .attr('id','select-year')
        .attr('class','button')
        .attr('type','button')
        .attr('value',d=>d)
        .style("color","white")
        // .property("selected", d=> d)
        .text(d=>d)
        .each(function(d) {
            if (d === "year") {
                d3.select(this).property("disabled", true)
                d3.select(this).style("display", "none")
            }
        });


        d3.select(".select-year")
          .on('change',changeYear)

    buttons
        .append("select")
        .attr("class","select-month")
        .attr("id","years")
        .selectAll("input.year")
        .data(months)
        .enter()
        .append('option')
        .attr('id','select-year')
        .attr('class','button')
        .attr('type','button')
        .attr('value',d=>d)
        .style("color","white")
        .text(d=>d)
        .each(function(d) {
            if (d === "month") {
                d3.select(this).property("disabled", true)
                d3.select(this).style("display", "none")
            }
        });

        d3.select(".select-month")
          .on('change',changeMonth)

}
function makeCatButtons(cats) {
    categories
        .selectAll('input')
        .data(cats)
        .enter()
        .append('input')
        .attr('id','select-category')
        .attr('class','button')
        .style('background-color',d=>category_colors(d))
        .style('color',"black")
        .attr('type','button')
        .attr('value',d=>d)
        .text(d=>d)
        .on('click',selectCategory)
}

function makeCreditDebitButtons(){
    credit_debit.append('select')
        .attr('class','credit-debit-s')
        .selectAll(".crdb")
        .data(['credit/debit','all','credit','debit'])
        .enter()
        .append('option')
        .attr('id','txn-type')
        .attr('class','txn-type')
        .attr('value',d=>d)
        .text(d=>d)
        .each(function(d) {
            if (d === "credit/debit") {
                d3.select(this).property("disabled", true)
                d3.select(this).style("display", "none")
            }
        });


        d3.select(".credit-debit-s")
          .on('change',selectCreditDebit)

}
function changeMonth(){
    month = this.value;
    YM = year + '-' + month;
    if (YM == 'all-all'){
        YM = 'all';
    }
    processData(YM,category,credit,sort)
}
function changeYear(){
    year = this.value;
    YM = year + '-' + month;
    if (YM == 'all-all'){
        YM = 'all';
    }
    processData(YM,category,credit,sort)
}
function changeYM(){
    YM = this.value
    processData(YM,category,credit,sort)
}

function selectCategory(){
    category = this.value
    processData(YM,category,credit,sort)
}

function selectCreditDebit(){
    credit = this.value
    processData(YM,category,credit,sort)
}
function selectSort(){
    sort = this.value
    processData(YM,category,credit,sort)
}

function makeSortDropDown(){
    sorts.append('select')
        .attr('class','sort')
        .selectAll(".sort")
        .data(['sort','chronological','descending'])
        .enter()
        .append('option')
        .attr('id','sort')
        .attr('class','sort')
        .attr('value',d=>d)
        .text(d=>d)
        .each(function(d) {
            if (d === "sort") {
                d3.select(this).property("disabled", true)
                d3.select(this).style("display", "none")
            }
        });

        d3.select(".sort")
          .on('change',selectSort)

}
function filterTable(){

    filter = this.value.toLowerCase()
    df_filtered = d3.filter(df_month,function(d){
        return (d.category.toLowerCase().includes(filter)) ||
               (d.date.toLowerCase().includes(filter)) ||
               (d.description.toLowerCase().includes(filter)) ||
               (d.transaction_type.toLowerCase().includes(filter))

    })
    makeTable(df_filtered,sort)
    makeSummary(df_filtered)
}
makeplot();

// to fix window resizing 

function redrawCharts(){

    divs = ["lineChart","pieChart","tableDiv","summaryDiv","barChart","sankeyChart"]

    for(i=0; i<divs.length; i++){
        var update = {
            width: $(`#${divs[i]}`).width(),
            height: $(`#${divs[i]}`).height(),
        }
        Plotly.relayout(`${divs[i]}`,update)
    }
}
$(window).resize(redrawCharts);


document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
         evt.originalEvent.touches; // jQuery
}                                                     
                                                                         
function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];                                      
    xDown = firstTouch.clientX;                                      
    yDown = firstTouch.clientY;                                      
};                                                
                                                                         
function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
                                                                         
    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            panel_index = Math.min(2,panel_index+1)
            showPanel(panel_index)
        } else {
            panel_index = Math.max(0,panel_index-1)
            showPanel(panel_index)
        }                       
    }    
    /* reset values */
    xDown = null;
    yDown = null;                                             
};
