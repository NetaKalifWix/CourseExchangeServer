class GraphAlgorithms {
  static dfs_find_cycles(graph, vert_order = null) {
    if (!vert_order) vert_order = new Array(graph.V.length).keys();
    var
      dfs = {
      p: Array(graph.V.length),
      c: Array(graph.V.length).fill(0),
    },
      cycles_last_vertex = Array(0),
      cycles = Array(0)
    ;
    let dfs_visit = u => {
      dfs.c[u] = 1;

      for (let v of graph.E[u]) {
        if (dfs.c[v] == 0) {
          dfs.p[v] = u;
          dfs_visit(v);
        }
        else if (dfs.c[v] == 1) cycles_last_vertex.push([u, v]);
      }
      dfs.c[u] = 2;
    }
    for (let u of vert_order) 
      if (dfs.c[u] == 0) dfs_visit(u);
    
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
        }
    
    let find_edge = (i, j) => {
          shuffleArray(graph.E[i]);
          graph.E[i].filter( e => e.courseB == graph.V[j])[0];
    }
    do {
      
      cycles = GraphAlgorithms.dfs_find_cycles(clone, shuffleArray(Array(graph.V.length)));
      cycles.forEach( cycle => {
        try {
          let edges_cycle = Array(cycle.length - 1).map( i => 
            find_edge(cycle[i], cycle[i+1]));
          
          edges_cycle.push(find_edge(cycle[cycle.length-1], cycle[0]));
          
          edges_cycle.forEach( e => {
            clone.E[e.courseA] = clone.E[e.courseA].splice(1);
          });

          acc_cycles.push(edges_cycle);
        }
        catch(err) {}
      });
    }
    while (cycles.length != 0);
    return acc_cycles;
  }
}

class CourseExchangeGraph {
  constructor() {
    this.graph = new Map();
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
    const result = [];
    const visited = new Set();
    const currentlyVisiting = new Set();

    for (const course of this.graph.keys()) {
      if (
        !visited.has(course) &&
        this.hasCycle(course, visited, currentlyVisiting, result)
      ) {
        return result; // Found a cycle, return it
      }
    }

    return result; // No cycles found
  }

  hasCycle(course, visited, currentlyVisiting, result) {
    visited.add(course);
    currentlyVisiting.add(course);

    if (this.graph.has(course)) {
      for (const exchange of this.graph.get(course)) {
        if (!visited.has(exchange.courseB)) {
          if (
            this.hasCycle(exchange.courseB, visited, currentlyVisiting, result)
          ) {
            result.push({
              name: exchange.studentName,
              phone: exchange.phone,
              desiredCourse: exchange.courseB,
              currentCourse: course,
            });
            return true;
          }
        } else if (currentlyVisiting.has(exchange.courseB)) {
          result.push({
            name: exchange.studentName,
            phone: exchange.phone,
            desiredCourse: exchange.courseB,
            currentCourse: course,
          });
          return true;
        }
      }
    }

    currentlyVisiting.delete(course);
    return false;
  }

  findAllCycles() {
    var G = {
      V: [...this.graph.keys()],
      E: [...this.graph.entries()]
    };
    return GraphAlgorithms.dfs_find_all_cycles(G);
  }
}
module.exports = CourseExchangeGraph;
