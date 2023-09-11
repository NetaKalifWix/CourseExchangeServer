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
}
module.exports = CourseExchangeGraph;
