
// Tal: Added cycleLength of 5
var CYCLE_LENGTH = 5;

class GraphAlgorithms {
// runs dfs from all vertices that wasnt "discoverd" yet, than turns each cycles_last_vertex
// from the dfs to an array with all the vertices of the circle by thir order.
  static dfs_find_cycles(graph, cycleLen = CYCLE_LENGTH, vert_order = null) {
    if (!vert_order) vert_order = new Array(graph.V.length).keys();
    var dfs = {
        parents: Array(graph.V.length),
        colors: Array(graph.V.length).fill(0),
      },
      cycles_last_vertex = Array(0),
      cycles = Array(0);

    // Runs dfs from a specific vertice, if a cycle is found [u, v] is returned 
    // when u is the last vertice in the cycle (and v is the first)
    let dfs_visit = (u, cycleLen) => {
      dfs.colors[u] = 1;
      //console.log("the current vertice is ",u," and he has ",graph.E[u].length," nighbors")
      cycleLen = cycleLen - 1;
      if (cycleLen >= 0){
        //var count = 1; //added for test
        graph.E[u].forEach((nighbor) => {
          //console.log("for loop iteration: ", count)
          //count++;//added for test
          let v = nighbor.courseB;
          //console.log("u is: ", u," for person ",nighbor.name, ", v is: ", v, " and color of v is: ", dfs.userColor[v]);
          if (dfs.colors[v] == 0) {
            dfs.parents[v] = u; // maybe sent user as a parent
            dfs_visit(v, cycleLen);
          } else if (dfs.colors[v] == 1) {
            cycles_last_vertex.push([u, v]);
            //console.log("cycles_last_vertex length after push: ", cycles_last_vertex.length);
           } // do we send the same cycle twise from the vertices prespective?
        });
      }
      dfs.colors[u] = 2;
    };

    for (let u of vert_order) if (dfs.colors[u] == 0) dfs_visit(u, cycleLen);
    //console.log("cycles this iteration: ", cycles_last_vertex.length);
    for (let [u, s] of cycles_last_vertex) {
      var cycle = [s];
      while (u != s) {
        cycle.push(u);
        u = dfs.parents[u];
      }
      cycles.push(cycle.reverse());
    }
    //console.log("dfs_find_cycles says: The number of cycles is: ",cycles.length);

    return cycles;
  }

  // Runs dfs_find_cycles to get all the arrays of cycle's nodes, 
  // turns them to edges and adds the closing edge [n-1, 0]
  // pushes the array of all of the cyrcle's edges to acc_cycle and returns it.
  static dfs_find_all_cycles(graph) {
    console.log("\n************** new command *******************\n");
    var clone = JSON.parse(JSON.stringify(graph)),
      cycles = [],
      acc_cycles = [];

    // let shuffleArray = (array) => { // Tal: why do we need to shuffle?
    //   for (var i = array.length - 1; i > 0; i--) {
    //     var j = Math.floor(Math.random() * (i + 1));
    //     var temp = array[i];
    //     array[i] = array[j];
    //     array[j] = temp;
    //   }
    //   return array;
    // };

    let find_edge = (i, j) => { // Tal: maybe this returns only one edge that closes a circle even if there are more?
      //shuffleArray(clone.E[i]);
      let edge = clone.E[i].filter(e => e.courseB == j)[0];
      // console.log("edge", edge);
      if (edge) return {...edge, courseA: i};
      throw new Error('no edge');
    };

    do {
      cycles = GraphAlgorithms.dfs_find_cycles(
        clone, CYCLE_LENGTH
        //, shuffleArray([...Array(clone.V.length).keys()])
      );
      cycles.forEach((cycle) => {
        try {
          //console.log("find edge")
          let edges_cycle = [...Array(cycle.length - 1).keys()].map((i) =>
            find_edge(cycle[i], cycle[i + 1])
          );

          edges_cycle.push(find_edge(cycle[cycle.length - 1], cycle[0]));

          edges_cycle.forEach((e) => {
            clone.E[e.courseA] = clone.E[e.courseA].splice(1);
          });

          acc_cycles.push(edges_cycle);
          //console.log("So far, dfs_find_all_cycles says: The number of cycles is: ",acc_cycles.length);
        } catch (err) {console.log("error find edge")}
      });
    } while (cycles.length != 0);
    //console.log("Finnaly, dfs_find_all_cycles says: The number of cycles is: ",acc_cycles.length);
    return acc_cycles; // = all cycles as arrays of thire edges
  }
}

class CourseExchangeGraph {
  constructor() {
    this.graph = new Map();
  }


  static buildGraphFromExchanges(exchanges) {
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
        currentCourse,//currentCourse???? Should be courseA.
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
      V: [...this.graph.keys()],// Tal: this is wrong, should have vertis for each exchange not for each courseA
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
