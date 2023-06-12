// selecting tabs: 

var tabButtons = document.querySelectorAll(".tab-container .tab-buttons button")
var tabPanels = document.querySelectorAll(".tab-container .panel")

var panel_index = 0
function showAllPanel(){
    tabButtons.forEach(function(node){
        node.style.backgroundColor="";
        node.style.color="";
    });
    
    tabPanels.forEach(function(node){
        node.style.display="block";
    });

}


function showPanel(p_index){
    panel_index = p_index;
    tabPanels.forEach(function(node){
        node.style.display="none";
    });
    tabPanels[panel_index].style.display= "block"
    tabPanels[panel_index].style.backgroundColor= "#eee"
}




var dft,yms;
var YM; 
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
            amount = -70*amount;
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
          YM = yms[yms.length -1]
          yms.push('all')
          makeYMButtons(yms)

          makeSortDropDown()

          cats = [... new Set(dft.map(d=>d.category_n))]
          cats = d3.sort(cats,(a,b)=>d3.ascending(a,b))
          cats.push('all')
          category_colors = d3.scaleOrdinal(d3.schemeSet3)
          category_colors.domain(cats)

          makeCatButtons(cats)
          category = 'all'
          processData(YM,category,credit,sort) } );

};
  
function processData(YM,category,credit,sort) {
    showAllPanel()
    // dft = data
    df_month_wsal = dft 
    if (YM !='all'){
        df_month_wsal = d3.filter(dft,d=>d.YM == YM)  
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
            l: 100,
            r: 10,
            b: 40,
            t: 10,
        },
        paper_bgcolor : '#eee',
        plot_bgcolor : '#eee',
        show_legend:true,
        font: {
            size: 20
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

    plotLine( x, y,"lineChart",layout,YM);
    
    // pie chart 
    f = v=>d3.sum(v,d=>d[value])
    df_pie = prepareData(df_month,key='category_n',value='amount',f)
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
    df_bar = prepareData(df_month,key='transaction_type',value='amount',f)
    df_bar = d3.sort(df_bar,(aa,bb)=>d3.descending(aa['amount'],bb['amount']))
        
    makeBar(df_bar);
    makeTable(df_month,sort);
    makeSummary(df_month);
    sankeyChart(df_month_wsal)
    showPanel(panel_index)
}

function plotLine(x, y, id,layout,YM){
    var plotDiv = document.getElementById("plot");
    var traces = [{
        x: x, 
        y: y,
        type: 'scatter'
    }];

    Plotly.newPlot(id, traces, 
        {title: 'spending over '+ YM},layout);

};
function prepareData(df,key,value,f){
    dfg = d3.rollup(df,f,d=>d[key])
    dfg = [...dfg].map(function(d){return {[key]:d[0],[value]:d[1]}})
    cat_color = d3.scaleOrdinal(d3.schemeSet3)
    cat_color.domain(dfg.map(d=>d[key]))
    dfg = [...dfg].map(function(d){
        return {[key]:d[key],
                [value]:d[value],
                color: cat_color(d[key])
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
    var values = [
        df.map(d=>d['date']),
        df.map(d=>d['description']),
        df.map(d=>d['category_n']),
        df.map(d=>d['transaction_type']),
        df.map(d=>d['amount'].toFixed(2)),
        df.map(d=>d['cumulative_sum'].toFixed(2)),
    ]

var data = [{
  type: 'table',
  header: {
    values: [["<b>date</b>"], ["<b>description</b>"],
			 ["<b>category</b>"], ["<b>transaction_type</b>"], 
             ["<b>amount</b>"],["<b>running_total</b>"]],
    align: "left",
    line: {width: 1, color: 'black'},
    fill: {color: "grey"},
    font: {family: "Arial", size: 20, color: "white"}
  },
  cells: {
    values: values,
    align: "left",
    line: {color: "black", width: 1},
    font: {family: "Arial", size: 20, color: ["black"]},
    height: 40,
    
  }
}]
 style_table={
     hoverlabel: { bgcolor: "salmon" },
     'overflowY': 'scroll',
     margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
    },
 },
Plotly.newPlot('tableDiv', data,style_table);
};

function makeBar(df){
    df3 = df.map(function(d){
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
        l: 60,
        r: 10,
        b: 40,
        t: 10,
    },
        font: {
            size: 20
        },

        // paper_bg_color:"#eee",
        // plot_bgcolor: '#c7c7c7',
        show_legend:true,
        xaxis : {
            visible : false,
        }

    }
    Plotly.newPlot('barChart',df3,layout)
}


function makeSummary(df){
    f = v=>d3.sum(v,d=>d[value])

    summary = prepareData(df,key='category_n',value='amount',f)
    f = v=>v.length
    summary_num = prepareData(df,key='category_n',value='amount',f)


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
             ["<b>avg. ticket</b>"],
             ["<b>pct</b>"],
            ],
    align: "left",
    line: {width: 1, color: 'black'},
    fill: {color: "grey"},
    font: {family: "Arial", size: 22, color: "white"}
  },
  cells: {
    values: values,
    align: "left",
    line: {color: "black", width: 1},
    font: {family: "Arial", size: 20, color: ["black"]},
    height: 40,
    
  }
}]
 style_table={
     'overflowY': 'scroll',
     margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
    }
 },
Plotly.newPlot('summaryDiv', data,style_table);

}

function sankeyChart(df){
    
    dfg = prepareData(df,
                      key='category_n',
                      value='amount',
                      v=>d3.sum(v,d=>d.amount))

    incoming = d3.filter(df,d=>d.amount<0)
    incoming = prepareData(incoming,
                           key='category_n',value='amount',
                           v=>-d3.sum(v,d=>d.amount))
    spending = d3.filter(df,d=>d.amount>0)
    spending = prepareData(spending,
                           key='category_n',value='amount',
                           v=>d3.sum(v,d=>d.amount))
    
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
        values.push(c['amount'])
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
        values.push(c['amount'])
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
          color: "black",
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
        title: "Sankey chart",
        font: {
            size: 20
        },
        margin: {
            l: 50,
            r: 50,
            b: 10,
            t: 50,
        },
    }

    Plotly.react('sankeyChart', data, layout)
}

const buttons = d3.select("#year-month")

const categories = d3.select("#categories")
const credit_debit = d3.select("#year-month")
const sorts = d3.select("#year-month")


function makeYMButtons(yms) {
    buttons
        .selectAll('input#ym')
        .data(yms)
        .enter()
        .append('input')
        .attr('id','select-month')
        .attr('class','button')
        .attr('type','button')
        .attr('value',d=>d)
        .text(d=>d)
        .on('click',changeYM)
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
        .attr('type','button')
        .attr('value',d=>d)
        .text(d=>d)
        .on('click',selectCategory)
}

function makeCreditDebitButtons(){
    credit_debit
        .selectAll('input#credit-debit')
        .data(['credit','debit','all'])
        .enter()
        .append('input')
        .attr('id','credit_debit')
        .attr('class','button')
        .attr('type','button')
        .attr('value',d=>d)
        .text(d=>d)
        .on('click',selectCreditDebit)

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
        .data(['chronological','descending'])
        .enter()
        .append('option')
        .attr('id','sort')
        .attr('class','sort')
        .attr('value',d=>d)
        .text(d=>d)

        d3.select(".sort")
          .on('change',selectSort)

}

makeplot();
