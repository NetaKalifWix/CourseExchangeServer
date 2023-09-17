class GraphAlgorithms {
  static dfs_find_cycles(graph, vert_order = null) {
    if (!vert_order) vert_order = new Array(graph.V.length).keys();
    var dfs = {
        p: Array(graph.V.length),
        c: Array(graph.V.length).fill(0),
      },
      cycles_last_vertex = Array(0),
      cycles = Array(0);
    let dfs_visit = (u) => {
      dfs.c[u] = 1;
      for (let { courseB } of graph.E[u]) {
        let v = courseB;
        if (dfs.c[v] == 0) {
          dfs.p[v] = u;
          dfs_visit(v);
        } else if (dfs.c[v] == 1) cycles_last_vertex.push([u, v]);
      }
      dfs.c[u] = 2;
    };
    for (let u of vert_order) if (dfs.c[u] == 0) dfs_visit(u);

    console.log("DFS", dfs);
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

  static dfs_find_all_cycles(graph) {
    var clone = JSON.parse(JSON.stringify(graph)),
      cycles = [],
      acc_cycles = [];

    let shuffleArray = (array) => {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    };

    let find_edge = (i, j) => {
      shuffleArray(clone.E[i]);
      let edge = clone.E[i].filter(e => e.courseB == j)[0];
      console.log("edge", edge);
      if (edge) return {...edge, courseA: i};
        throw new Error('no edge');
    };
    do {
      cycles = GraphAlgorithms.dfs_find_cycles(
        clone,
        shuffleArray([...Array(clone.V.length).keys()])
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

  addExchange(courseA, courseB, studentName, phone) {
    if (!this.graph.has(courseA)) {
      this.graph.set(courseA, []);
    }
    this.graph.get(courseA).push({ courseB, studentName, phone });
  }

  deleteExchange(courseA, courseB, studentName, phone) {
    if (this.graph.has(courseA)) {
      this.graph.set(
        courseA,
        this.graph.get(courseA).filter((exchange) => {
          return (
            exchange.courseB !== courseB ||
            exchange.studentName !== studentName ||
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
      ({...edge, courseA: G.V[edge.courseA], courseB: G.V[edge.courseB]})));
  }
}
module.exports = CourseExchangeGraph;
