export default class Painter {
  static drawLines(svg, lines) {
    svg.selectAll('line').data(lines)
      .enter().append('line')
      .style('stroke', function (d) { return d.stroke; })
      .attr('stroke-width', function (d) { return d.strokeWidth; })
      .attr('x1', function (d) { return d.x1; })
      .attr('y1', function (d) { return d.y1; })
      .attr('x2', function (d) { return d.x2; })
      .attr('y2', function (d) { return d.y2; })
      .attr('class', function (d) { return d.cssClass; });
  }
  static transitionLine(svg, line, transitionDuration) {
    svg.select('line')
      .transition()
      .duration(transitionDuration)
      .attr('x1', line.x1)
      .attr('y1', line.y1)
      .attr('x2', line.x2)
      .attr('y2', line.y2);
  }
  static drawCircles(svg, circles) {
    svg.selectAll('circle')
      .data(circles)
      .enter().append('circle')
      .style('stroke', function (d) { return d.stroke; })
      .style('fill', function (d) { return d.fill; })
      .attr('r', function (d) { return d.radius; })
      .attr('cx', function (d) { return d.cx; })
      .attr('cy', function (d) { return d.cy; })
      .attr('class', function (d) { return d.cssClass; });
  }
}
