var dft,yms;

function makeplot() {
  Plotly.d3.csv("myspending.csv", 
      function(d){
        return {
            date: d.date,
            amount: +d.amount,
            card: d.card,
            description: d.Description,
            YM : d.YM,
            category: d.category,
            category_n: d.category_n,
            cumulative_sum: +d.cumulative_sum,
            transaction_type: d['transaction type'],
        }
      },  
      function(data){ 
          dft = data;
          yms = [... new Set(dft.map(d=>d.YM))]
          yms = d3.sort(yms,(a,b)=>d3.ascending(a,b))
          makeButtons(yms)
          processData(yms[yms.length-2]) } );

};
  
function processData(YM) {
    // dft = data
        df_month_wsal = d3.filter(dft,d=>d.YM == YM)  
    df_month = d3.filter(df_month_wsal,d=>d["transaction_type"] != 'salary')  
    df2 = df_month;
    df = d3.rollup(df_month,v=>d3.sum(v,d=>d.amount),d=>d.date)
    df = [...df].map(function(d){return {date:d[0],amount:d[1]}})
    layout = {margin: {
        l: 100,
        r: 10,
        b: 1,
        t: 10,
        },
        show_legend:true
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
    df_pie = prepareData(df2,key='category_n',value='amount',f)
    var pie_data = [{
        values : df_pie.map(d=>d['amount']),
        labels : df_pie.map(d=>d['category_n']),
        marker :{
            colors: df_pie.map(d=>d.color),
        },

        type   : 'pie'
    }]
    Plotly.newPlot('pieChart',pie_data,layout)

    // bar chart
    f = v=>d3.sum(v,d=>d[value])
    df_bar = prepareData(df2,key='transaction_type',value='amount',f)
    df_bar = d3.sort(df_bar,(aa,bb)=>d3.descending(aa['amount'],bb['amount']))
        
    makeBar(df_bar);
    makeTable(df_month);
    makeSummary(df_month);
    sankeyChart(df_month_wsal)
}

function plotLine(x, y, id,layout,YM){
    var plotDiv = document.getElementById("plot");
    var traces = [{
        x: x, 
        y: y,
        type: 'scatter'
    }];

    Plotly.newPlot(id, traces, 
        {title: 'spending over the month ' + YM},layout);

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
function makeTable(df){
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
    align: "center",
    line: {width: 1, color: 'black'},
    fill: {color: "grey"},
    font: {family: "Arial", size: 12, color: "white"}
  },
  cells: {
    values: values,
    align: "left",
    line: {color: "black", width: 1},
    font: {family: "Arial", size: 11, color: ["black"]}
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
        l: 50,
        r: 10,
        b: 1,
        t: 10,
        },
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
    sum = d3.sum(summary.map(d=>d.amount))
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
    font: {family: "Arial", size: 12, color: "white"}
  },
  cells: {
    values: values,
    align: "left",
    line: {color: "black", width: 1},
    font: {family: "Arial", size: 11, color: ["black"]}
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

    cat_color = d3.scaleOrdinal(d3.schemeSet3)
    cat_color.domain(dfg.map(d=>d[key]))

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
        colors.push(cat_color(c['category_n']))
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
        colors.push(cat_color(c['category_n']))
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
      title: "Sankey chart",
      font: {
        size: 10
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



const buttons = d3.select("#buttons")
        .attr("id","buttons")

makeplot();

function makeButtons(yms) {
    buttons
        .selectAll('input')
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
function changeYM(){
    YM = this.value
    processData(YM)
}
