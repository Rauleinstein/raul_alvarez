// Creates a sort method in the Array prototype
// prop: property name when is a json array
// desc: descending sort
// parser: function to parse the items to expected type
Object.defineProperty(Array.prototype, "sortBy", {
  configurable: false,
  enumerable: false,
  value: function (o) {
    if (Object.prototype.toString.call(o) != "[object Object]")
        o = {};
    if (Object.prototype.toString.call(o.parser) != "[object Function]")
        o.parser = function (x) { return x; };
    o.prop = o.prop || null;
    o.desc = o.desc || false;
    //gets the item to be compared
    var getItem = function (x) { return o.parser(x[o.prop] || x); };
    //if desc is true: return -1, else 1
    o.desc = [1,-1][+!!o.desc];
    //console.log("this", this);
    return this.sort(function (a, b) {
        a = getItem(a); b = getItem(b);
        return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * o.desc;
        //return a = getItem(a), b = getItem(b), o.desc * ((a > b) - (b > a));
    });
  }
});

//----------------------
// See documentation at:
// http://www.jasondavies.com/wordcloud/about/
//----------------------
// See basic example at:
// https://github.com/jasondavies/d3-cloud/blob/master/examples/simple.html
//----------------------

// Get the content of data.csv
d3.csv("data/data.csv", function(data) {
  
  data.forEach(function(d) {
    d.size = +d.size;
  });

  //sorts the array by the most repeated word
  data.sortBy({ prop: "size", desc: true });
  var w = 847, h = 400,
    maxFont = 72,
    maxSize = data[0].size || 1,
    sizeOffset = maxFont / maxSize;

  var fill = d3.scale.category20b(),
    layout = d3.layout.cloud()
    .size([w, h])
    .words(data)
    .spiral("rectangular")
    .rotate(function () { return (~~(Math.random() * 2) * -30) || 60; })
    //.text(function (d) { return d.text; })
    .font("Impact")
    .fontSize(function (d) {
        return Math.max(16, Math.min(d.size * sizeOffset, maxFont));
    })
    .on("end", onDraw);
  layout.start();

  //callback fired when all words have been placed
  function onDraw() {
      var svg = d3.select("#tag-cloud-wrapper").append("svg").attr({ width: w, height: h, "class": "side-a" }),
          vis = svg.append("g").attr("transform", "translate(" + [w >> 1, (h >> 1) - 10] + ")scale(2)");
      var text = vis.selectAll("text").data(data);
      text.enter().append("text")
          .style("font-family", function (d) { return d.font; })
          .style("font-size", function (d) { return d.size + "px"; })
          .style("fill", function (d, i) { return fill(i); })
          .style({ cursor: "pointer", opacity: 1e-6 })
          .attr("text-anchor", "middle")
          .attr("transform", function (d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function (d) { return d.text; })
          .on("click", function (d) {
              //[this] is the <text> element of svg
              alert("tag: " + d.text);
          })
          .transition()
              .duration(1000)
              .style("opacity", 1);
      vis.transition()
          .delay(450)
          .duration(750)
          .attr("transform", "translate(" + [w >> 1, (h >> 1) + 10] + ")scale(1)");
  }//end onDraw
});