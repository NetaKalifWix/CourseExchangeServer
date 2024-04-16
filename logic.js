// Tal: Added cycleLength of 5
var CYCLE_LENGTH = 5;

class GraphAlgorithms {
  // runs dfs from all vertices that wasnt "discoverd" yet, than turns each cycles_last_vertex
  // from the dfs to an array with all the vertices of the circle by thir order.
  static dfs_find_cycles(graph, newEdge, cycleLen = CYCLE_LENGTH) {
    var vert_order = new Array(graph.V.length).keys();
    var dfs = {
        parents: Array(graph.V.length),
        colors: Array(graph.V.length).fill(0),
      },
      cycles_last_vertex = Array(0),
      cycles = Array(0);

    // Runs dfs from a specific vertice, if a cycle is found [u, v] is returned
    // when u is the last vertice in the cycle (and v is the first)

    // TODO: 
    // find out if the parent array is good or you need to add the users to it. 
    // test to see if the new logic is working and finding all of the circles 
    // and only the circles that was created now.
    let dfs_visit = (u, cycleLen, colors) => {
      colors[u] = 1;
      cycleLen = cycleLen - 1;
      if (cycleLen >= 0) {
        graph.E[u].forEach((nighbor) => {
          let v = nighbor.courseB;
          if (colors[v] == 0) {
            dfs.parents[v] = u;
            dfs_visit(v, cycleLen, colors);
          } else if (colors[v] == 1) {
            var cycle = [v];
            while (u != v) {
              cycle.push(u);
              u = dfs.parents[u];
            }
            cycles.push(cycle.reverse());
            console.log("A cycle was found");
          }
        });
      }
      //dfs.colors[u] = 2;
    };

    dfs_visit(newEdge.courseA, cycleLen); // Tal: make sure what is the format of newEdge!!!!!!!!!!!!!
    // for (let [u, s] of cycles_last_vertex) {
    //   var cycle = [s];
    //   while (u != s) {
    //     cycle.push(u);
    //     u = dfs.parents[u];
    //   }
    //   cycles.push(cycle.reverse());
    // }
    return cycles;
  }

  // Runs dfs_find_cycles to get all the arrays of cycle's nodes,
  // turns them to edges and adds the closing edge [n-1, 0]
  // pushes the array of all of the cyrcle's edges to acc_cycle and returns it.
  static dfs_find_all_cycles(graph, newEdge) {
    var clone = JSON.parse(JSON.stringify(graph)),
      cycles = [],
      acc_cycles = [];

    let find_edge = (i, j) => {
      let edge = clone.E[i].filter((e) => e.courseB == j)[0];
      if (edge) return { ...edge, courseA: i };
      throw new Error("no edge");
    };

    cycles = GraphAlgorithms.dfs_find_cycles(clone, newEdge);
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
      } catch (err) {
        console.log("error find edge");
      }
    });
    return acc_cycles; // = all cycles as arrays of thire edges
  }
}

class CourseExchangeGraph {
  constructor() {
    this.graph = new Map();
  }

  static buildGraphFromExchanges(exchanges, newEdge) {
    const graph = new CourseExchangeGraph();
    exchanges.forEach((ex) =>
      graph.addExchange(ex.currentcourse, ex.desiredcourse, ex.name, ex.phone)
    );
    graph.set(newEdge.courseA, [{ courseB: newEdge.courseB }]);// deleting all the edges from newEdge.courseA except from newEdge.courseB
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

  findCycles(newEdge) { // TODO: once toSend is sent properly test that it is in the forrmat you expect
    //newEdge = {name: "p4", currentCourse: "נושאים בצביעות חסרות קונפליקטים", desiredCourse: "נושאים בעיבוד שפה טבעית", phone: "0123456784"}
    console.log("newEdge is: ", newEdge);

    var G = {
      V: [...this.graph.keys()],
      E: null,
    };
    G.E = [...this.graph.values()].map((edges) =>
      edges.map((edge) => ({
        ...edge,
        courseB: G.V.indexOf(edge.courseB),
      }))
    );
    newEdge = {
      ...newEdge,
      courseA: G.V.indexOf(newEdge.currentCourse),
      courseB: G.V.indexOf(newEdge.desiredCourseCourse),
    };
    console.log("newEdge is: ", newEdge);

    return GraphAlgorithms.dfs_find_all_cycles(G, newEdge).map((cycle) =>
      cycle.map((edge) => ({
        ...edge,
        currentCourse: G.V[edge.courseA],
        desiredCourse: G.V[edge.courseB],
      }))
    );
    // Now we have array of all cyrcles (dfs_find_all_cycles(G))
    // each circle is an array of edges, each edge has name, phone, mail and courseA, courseB by thire names
  }
}
module.exports = CourseExchangeGraph;












// Here Again:
// class GraphAlgorithms {
//   static dfs_find_cycles(graph, vert_order = null) {
//     if (!vert_order) vert_order = new Array(graph.V.length).keys();
//     var dfs = {
//         p: Array(graph.V.length),
//         c: Array(graph.V.length).fill(0),
//       },
//       cycles_last_vertex = Array(0),
//       cycles = Array(0);
//     let dfs_visit = (u) => {
//       dfs.c[u] = 1;
//       for (let { courseB } of graph.E[u]) {
//         let v = courseB;
//         if (dfs.c[v] == 0) {
//           dfs.p[v] = u;
//           dfs_visit(v);
//         } else if (dfs.c[v] == 1) cycles_last_vertex.push([u, v]);
//       }
//       dfs.c[u] = 2;
//     };
//     for (let u of vert_order) if (dfs.c[u] == 0) dfs_visit(u);
//     for (let [u, s] of cycles_last_vertex) {
//       var cycle = [s];
//       while (u != s) {
//         cycle.push(u);
//         u = dfs.p[u];
//       }
//       cycles.push(cycle.reverse());
//     }
//     return cycles;
//   }

//   static dfs_find_all_cycles(graph) {
//     var clone = JSON.parse(JSON.stringify(graph)),
//       cycles = [],
//       acc_cycles = [];

//     let shuffleArray = (array) => {
//       for (var i = array.length - 1; i > 0; i--) {
//         var j = Math.floor(Math.random() * (i + 1));
//         var temp = array[i];
//         array[i] = array[j];
//         array[j] = temp;
//       }
//       return array;
//     };

//     let find_edge = (i, j) => {
//       shuffleArray(clone.E[i]);
//       let edge = clone.E[i].filter((e) => e.courseB == j)[0];
//       // console.log("edge", edge);
//       if (edge) return { ...edge, courseA: i };
//       throw new Error("no edge");
//     };
//     do {
//       cycles = GraphAlgorithms.dfs_find_cycles(
//         clone,
//         shuffleArray([...Array(clone.V.length).keys()])
//       );
//       cycles.forEach((cycle) => {
//         try {
//           let edges_cycle = [...Array(cycle.length - 1).keys()].map((i) =>
//             find_edge(cycle[i], cycle[i + 1])
//           );

//           edges_cycle.push(find_edge(cycle[cycle.length - 1], cycle[0]));

//           edges_cycle.forEach((e) => {
//             clone.E[e.courseA] = clone.E[e.courseA].splice(1);
//           });

//           acc_cycles.push(edges_cycle);
//         } catch (err) {}
//       });
//     } while (cycles.length != 0);
//     return acc_cycles;
//   }
// }

// class CourseExchangeGraph {
//   constructor() {
//     this.graph = new Map();
//   }

//   static fromExchanges(exchanges) {
//     const graph = new CourseExchangeGraph();
//     exchanges.forEach((ex) => {
//       graph.addExchange(ex.currentCourse, ex.desiredCourse, ex.name, ex.phone);
//     });
//     return graph;
//   }

//   addExchange(courseA, courseB, name, phone) {
//     if (!this.graph.has(courseA)) {
//       this.graph.set(courseA, []);
//     }
//     this.graph.get(courseA).push({ courseB, name, phone });
//   }

//   deleteExchange(courseA, courseB, name, phone) {
//     if (this.graph.has(courseA)) {
//       this.graph.set(
//         currentCourse,
//         this.graph.get(currentCourse).filter((exchange) => {
//           return (
//             exchange.courseB !== courseB ||
//             exchange.name !== name ||
//             exchange.phone !== phone
//           );
//         })
//       );
//     }
//   }

//   findCycles() {
//     var G = {
//       V: [...this.graph.keys()],
//       E: null,
//     };
//     G.E = [...this.graph.values()].map((edges) =>
//       edges.map((edge) => ({
//         ...edge,
//         courseB: G.V.indexOf(edge.courseB),
//       }))
//     );
//     return GraphAlgorithms.dfs_find_all_cycles(G).map((cycle) =>
//       cycle.map((edge) => ({
//         ...edge,
//         currentCourse: G.V[edge.courseA],
//         desiredCourse: G.V[edge.courseB],
//       }))
//     );
//   }
// }
// module.exports = CourseExchangeGraph;
