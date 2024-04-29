
var CYCLE_LENGTH = 5;

class GraphAlgorithms {
  static dfs_find_cycles(graph, cycleLen = CYCLE_LENGTH, vert_order = null) {
    if (!vert_order) vert_order = new Array(graph.V.length).keys();
    var dfs = {
        p: Array(graph.V.length),
        c: Array(graph.V.length).fill(0),
      },
      cycles_last_vertex = Array(0),
      cycles = Array(0);

    let dfs_visit = (u, cycleLen) => {
      dfs.c[u] = 1;
      cycleLen = cycleLen - 1;
      if (cycleLen >= 0){
        for (let { courseB } of graph.E[u]) {
          let v = courseB;
          if (dfs.c[v] == 0) {
            dfs.p[v] = u;
            dfs_visit(v, cycleLen);
          } else if (dfs.c[v] == 1) cycles_last_vertex.push([u, v]);
        }
      }
      dfs.c[u] = 2;
    };

    for (let u of vert_order) if (dfs.c[u] == 0) dfs_visit(u, cycleLen);
    for (let [u, s] of cycles_last_vertex) {
      var cycle = [s];
      while (u != s) {
        cycle.push(u);
        u = dfs.p[u];
      }
      cycles.push(cycle.reverse());
    }
    return cycles;
  }
// **********************************

  static dfs_find_all_cycles(graph) {
    var clone = JSON.parse(JSON.stringify(graph)),
      cycles = [],
      acc_cycles = [];

    let find_edge = (i, j) => {
      let edge = clone.E[i].filter(e => e.courseB == j)[0];
      if (edge) return {...edge, courseA: i};
      throw new Error('no edge');
    };

    do {
      cycles = GraphAlgorithms.dfs_find_cycles(
        clone, CYCLE_LENGTH
      );
      cycles.forEach((cycle) => {
        try {
          let edges_cycle = [...Array(cycle.length - 1).keys()].map((i) =>
            find_edge(cycle[i], cycle[i + 1])
          );

          edges_cycle.push(find_edge(cycle[cycle.length - 1], cycle[0]));

          edges_cycle.forEach((e) => {
            clone.E[e.courseA] = clone.E[e.courseA].splice(1);
          });

          acc_cycles.push(edges_cycle);
        } catch (err) {}
      });
    } while (cycles.length != 0);
    return acc_cycles;
  }
}




class CourseExchangeGraph {
  constructor() {
    this.graph = new Map();
  }


  static fromExchanges(exchanges) {
    const graph = new CourseExchangeGraph();
    exchanges.forEach(ex => graph.addExchange(ex.currentcourse, ex.desiredcourse, ex.name, ex.phone));
    return graph;
  }

  addExchange(courseA, courseB, name, phone) {
    if (!this.graph.has(courseA)) {
      this.graph.set(courseA, []);
    }
    this.graph.get(courseA).push({ courseB, name, phone });
  }

  deleteExchange(courseA, courseB, name, phone) {
    if (this.graph.has(courseA)) {
      this.graph.set(
        currentCourse,
        this.graph.get(currentCourse).filter((exchange) => {
          return (
            exchange.courseB !== courseB ||
            exchange.name !== name ||
            exchange.phone !== phone
          );
        })
      );
    }
  }

  findCycles() {
    var G = {
      V: [...this.graph.keys()],
      E: null
    }
    G.E = [...this.graph.values()].map(edges => edges.map(edge => (
      {
        ...edge,
        courseB: G.V.indexOf(edge.courseB)
      }
    )));


    return GraphAlgorithms.dfs_find_all_cycles(G).map(cycle => cycle.map(edge => 
      ({...edge, currentCourse: G.V[edge.courseA], desiredCourse: G.V[edge.courseB]})));
  }
}

module.exports = CourseExchangeGraph;