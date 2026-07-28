export type KeywordCategory =
  | "Language Keyword"
  | "Primitive Types"
  | "Collections"
  | "Interfaces"
  | "Streams"
  | "Concurrency"
  | "Exceptions"
  | "Annotations"
  | "Spring"
  | "JVM";

export type JavadocEntry = {
  name: string;
  category: KeywordCategory;
  package?: string;
  signature?: string;
  since?: string; // 24. Java version introduced
  officialDocUrl?: string; // 25. Official JavaDocs URL
  officialDocSummary?: string; // 25. Official JavaDocs summary
  hierarchy?: string[];

  // 1-8: Core Educational Overview
  whatIsIt: string; // 1. What is it?
  whyIntroduced?: string; // 2. Why was it introduced?
  problemSolved: string; // 3. What problem does it solve?
  whatItProvides?: string[]; // 4. What does it provide?
  whyUseIt: string; // 5. Why should developers use it?
  whereUsed?: string[]; // 6. Where is it used?
  whenToUse: string[]; // 7. When should it be used?
  whenNotToUse: string[]; // 8. When should it NOT be used?

  // 9-12: Deep Technical Working
  internalWorking?: string; // 9. Internal working
  lifecycle?: string; // 10. Lifecycle
  architecture?: string; // 11. Architecture
  memoryRepresentation?: string; // 12. Memory representation

  // 13-17: Code, Complexity & Execution
  syntax: string; // 13. Syntax
  codeExample: string; // 14. Code example
  stepByStepExecution?: string[]; // 15. Step-by-step execution
  timeComplexity?: string; // 16. Time complexity
  spaceComplexity?: string; // 17. Space complexity

  // 18-23: Tradeoffs, Safety & Performance
  advantages: string[]; // 18. Advantages
  disadvantages?: string[]; // 19. Disadvantages
  bestPractices: string[]; // 20. Best practices
  commonMistakes: string[]; // 21. Common mistakes
  performanceConsiderations?: string; // 22. Performance considerations
  threadSafety?: string; // 23. Thread safety

  // 26-30: References, Industry & Summary
  relatedTopics: string[]; // 26. Related Java concepts
  interviewQuestions: Array<{ question: string; answer: string }>; // 27. Common interview questions
  useCases: string[]; // 28. Real-world use cases
  industryExamples?: string[]; // 29. Industry examples (Spring, Hibernate, Kafka)
  summaryTakeaways: string[]; // 30. Summary (2–3 key takeaways)

  methods?: Array<{ name: string; signature: string; desc: string }>;
};

// STEP 6: Explicit Blacklist for Non-Educational Terms (Variables, Examples, Literals)
const STEP6_BLACKLIST = new Set([
  "helloworld",
  "student",
  "employee",
  "customer",
  "account",
  "order",
  "product",
  "vehicle",
  "animal",
  "person",
  "demo",
  "main",
  "application",
  "app",
  "test",
  "example",
  "foo",
  "bar",
  "task",
  "helloworld.java",
  "student.java",
  "employee.java",
  "account.java",
  "main.java",
  "app.java",
  "example.java",
  "helloworld.class",
  "student.class",
  "employee.class",
  "x",
  "y",
  "z",
  "i",
  "j",
  "k",
  "temp",
  "count",
  "counter",
  "number",
  "amount",
  "salary",
  "name",
  "value",
  "result",
  "user",
  "users",
  "student",
  "students",
  "customer",
  "account",
  "map",
  "list",
  "queue",
  "stack",
  "obj",
  "data",
  "item",
  "items",
  "index",
  "current",
  "next",
  "prev",
  "id",
  "age",
  "price",
  "quantity",
  "text",
  "message",
  "filename",
  "path",
  "val",
  "arr",
  "str",
  "n",
  "m",
  "save",
  "load",
  "print",
  "execute",
  "calculate",
  "process",
  "run",
  "display",
  "add",
  "put",
  "get",
  "true",
  "false",
  "null",
  "100",
  "0",
  "1",
  "10",
  "3.14",
  "999",
  "hello",
  "world",
  "java",
  "abc",
]);

export const JAVADOC_REGISTRY: Record<string, JavadocEntry> = {
  // --- COLLECTIONS & INTERFACES ---
  PriorityQueue: {
    name: "PriorityQueue<E>",
    category: "Collections",
    package: "java.util",
    signature: "public class PriorityQueue<E> extends AbstractQueue<E> implements Serializable",
    since: "Java 1.5",
    officialDocUrl:
      "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java.util/PriorityQueue.html",
    officialDocSummary:
      "An unbounded priority queue based on a priority heap. Elements are ordered according to their natural ordering or by a Comparator provided at construction time.",
    hierarchy: [
      "java.lang.Object",
      "java.util.AbstractCollection<E>",
      "java.util.AbstractQueue<E>",
      "java.util.PriorityQueue<E>",
    ],

    whatIsIt:
      "PriorityQueue is an unbounded queue implementation based on a binary min-heap data structure where elements are dequeued based on priority rather than FIFO order.",
    whyIntroduced:
      "Introduced in Java 1.5 to provide an out-of-the-box logarithmic priority queue without requiring manual heap data structure implementations.",
    problemSolved:
      "Eliminates O(n) linear scanning to find the minimum/maximum element in unordered collections by offering O(log n) heap operations.",
    whatItProvides: [
      "O(1) peek access to highest priority element",
      "O(log n) insertion via offer() and removal via poll()",
      "Custom ordering via Comparator parameter",
    ],
    whyUseIt:
      "Guarantees that the element with the highest priority (lowest comparator score) is always served first in constant/logarithmic time.",
    whereUsed: [
      "Task schedulers and job dispatchers",
      "Graph algorithms (Dijkstra's Shortest Path, Prim's Minimum Spanning Tree)",
      "Streaming Top-K analytics engines",
    ],
    whenToUse: [
      "When processing tasks where order is governed by urgency or priority score rather than insertion sequence.",
      "When finding Top-K elements in high-volume streaming data.",
    ],
    whenNotToUse: [
      "When simple FIFO queue ordering is required (use ArrayDeque or LinkedList).",
      "When multi-threaded concurrent access is required without external synchronization (use PriorityBlockingQueue).",
    ],

    internalWorking:
      "Maintains an internal dynamic Object array (Object[] queue) structured as a balanced binary min-heap. When offer() is called, siftUp() percolates the element up the tree. When poll() is called, the root element at index 0 is extracted and siftDown() restores heap invariant.",
    lifecycle:
      "Instantiated -> Elements added via offer() -> Min-heap tree rebalanced -> Root extracted via poll() -> Memory freed by Garbage Collector.",
    architecture:
      "Binary Min-Heap Array Representation. Left child of index i is 2i + 1, right child is 2i + 2, parent is (i-1)/2.",
    memoryRepresentation:
      "Contiguous object array storing element object references in min-heap breadth-first order.",

    syntax: "PriorityQueue<E> pq = new PriorityQueue<>(Comparator.comparing(E::getPriority));",
    codeExample: `// Min-Heap of jobs ordered by priority score
PriorityQueue<Job> pq = new PriorityQueue<>(Comparator.comparingInt(Job::getPriority));

pq.offer(new Job("Batch Audit", 5));
pq.offer(new Job("Critical Security Alert", 1)); // Priority 1 (highest)

Job highestPriorityJob = pq.poll(); // Returns "Critical Security Alert"`,
    stepByStepExecution: [
      "1. PriorityQueue is initialized with a custom integer Comparator.",
      "2. offer('Batch Audit', 5) places element at array index 0.",
      "3. offer('Critical Security Alert', 1) is added at index 1 and sifted UP to root index 0 because 1 < 5.",
      "4. poll() removes index 0 ('Critical Security Alert') and sifts down remaining elements in O(log n) time.",
    ],
    timeComplexity: "O(1) peek(), O(log n) offer() & poll(), O(n) remove(Object)",
    spaceComplexity: "O(n) linear space for storing element array references",

    advantages: [
      "Automatic O(log n) priority sorting on insertion",
      "Dynamic auto-resizing capacity",
      "Extremely fast O(1) minimum element inspection",
    ],
    disadvantages: [
      "Iterating via iterator() yields un-sorted internal array order",
      "Not thread-safe out of the box",
      "Mutating element fields inside the queue breaks heap invariant",
    ],
    bestPractices: [
      "Always pass an explicit Comparator or implement Comparable on elements.",
      "Do NOT iterate over PriorityQueue expecting sorted order; use poll() in a loop instead.",
    ],
    commonMistakes: [
      "Mutating a priority field of an object while it is already inside the queue.",
      "Assuming iterator() returns elements in sorted order.",
    ],
    performanceConsiderations:
      "Avoid calling remove(Object) frequently as it performs an O(n) linear scan across the internal array.",
    threadSafety:
      "Not Thread-Safe. Use PriorityBlockingQueue for multi-threaded thread-safe priority queuing.",

    relatedTopics: [
      "Collections",
      "Comparator",
      "Queue",
      "Heap Data Structure",
      "PriorityBlockingQueue",
    ],
    interviewQuestions: [
      {
        question: "What is the time complexity of offer() and poll() in PriorityQueue?",
        answer:
          "Both offer() and poll() take O(log n) time due to binary heap tree re-balancing (siftUp and siftDown).",
      },
      {
        question: "Is PriorityQueue thread-safe?",
        answer:
          "No. PriorityQueue is not thread-safe. Use PriorityBlockingQueue for multi-threaded environments.",
      },
    ],
    useCases: [
      "Task scheduling engines",
      "Dijkstra's shortest path algorithm",
      "Top-K elements selection",
    ],
    industryExamples: [
      "Quartz Scheduler (Task prioritization)",
      "Kafka / Event Streaming priority buffering",
      "Netty event loop task queues",
    ],
    summaryTakeaways: [
      "PriorityQueue is a binary min-heap where the element with the highest priority is always served first.",
      "offer() and poll() take O(log n) time; peek() takes O(1) time.",
      "Use poll() to process elements in priority order; never rely on iterator().",
    ],
    methods: [
      {
        name: "offer(E e)",
        signature: "boolean offer(E e)",
        desc: "Inserts element into queue. O(log n)",
      },
      {
        name: "poll()",
        signature: "E poll()",
        desc: "Retrieves and removes head element (highest priority). O(log n)",
      },
      {
        name: "peek()",
        signature: "E peek()",
        desc: "Retrieves head element without removing. O(1)",
      },
    ],
  },

  HashMap: {
    name: "HashMap<K,V>",
    category: "Collections",
    package: "java.util",
    signature:
      "public class HashMap<K,V> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable",
    since: "Java 1.2",
    officialDocUrl:
      "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java.util/HashMap.html",
    officialDocSummary:
      "Hash table based implementation of the Map interface. Provides all optional map operations and permits null values and the null key.",
    hierarchy: ["java.lang.Object", "java.util.AbstractMap<K,V>", "java.util.HashMap<K,V>"],

    whatIsIt:
      "HashMap is a hash table based key-value pair implementation of the Map interface providing O(1) average constant-time lookup and insertion.",
    whyIntroduced:
      "Introduced in Java 1.2 to replace legacy Hashtable by offering non-synchronized fast map operations.",
    problemSolved:
      "Eliminates linear searching O(n) for key-value records by converting keys to array index bucket offsets via hash code calculation.",
    whatItProvides: [
      "Fast O(1) key lookups and insertions",
      "Support for one null key and multiple null values",
      "Dynamic bucket resizing with default 0.75 load factor",
    ],
    whyUseIt:
      "Provides maximum performance for in-memory key-value lookups in single-threaded backend services.",
    whereUsed: [
      "In-memory caching mechanisms",
      "Database row mapping by primary key",
      "Frequency counts and group-by aggregations",
    ],
    whenToUse: ["When fast O(1) key-value lookup is required and ordering is not important."],
    whenNotToUse: [
      "When insertion order must be preserved (use LinkedHashMap).",
      "When sorted key order is required (use TreeMap).",
      "When thread-safe access across threads is required (use ConcurrentHashMap).",
    ],

    internalWorking:
      "Uses an internal Node<K,V>[] table. Key's hashCode() is transformed using bitwise hash spread (h ^ (h >>> 16)) to calculate index (n - 1) & hash. Collisions form linked lists; when a bucket exceeds 8 nodes (TREEIFY_THRESHOLD), it converts to a Red-Black Tree for O(log n) worst-case performance.",
    architecture: "Array of Buckets + Linked List / Red-Black Tree hybrid structure.",
    memoryRepresentation:
      "Node array referencing Entry nodes containing hash, key, value, and next pointer.",

    syntax: "Map<K, V> map = new HashMap<>();",
    codeExample: `Map<String, UserProfile> userCache = new HashMap<>();
userCache.put("usr_99", new UserProfile("Alice"));
UserProfile profile = userCache.get("usr_99"); // O(1) instant lookup`,
    stepByStepExecution: [
      "1. put('usr_99', profile) calculates hash of 'usr_99'.",
      "2. Bucket index is computed via (n-1) & hash.",
      "3. Node is stored in the bucket. If collision occurs, attached to linked list or tree.",
      "4. get('usr_99') computes same hash and extracts value in O(1) time.",
    ],
    timeComplexity: "O(1) average put/get, O(log n) worst-case collision tree lookup",
    spaceComplexity: "O(n) space for entries plus bucket array space",

    advantages: [
      "Constant time O(1) lookups",
      "Allows null key and null values",
      "High performance",
    ],
    disadvantages: [
      "Does not preserve insertion or sorted order",
      "Not thread-safe",
      "High initial capacity overhead if oversized",
    ],
    bestPractices: [
      "Always override equals() and hashCode() together on custom key classes.",
      "Set initial capacity if size is known to prevent resize re-hashing overhead.",
    ],
    commonMistakes: [
      "Using mutable keys and modifying key fields after put().",
      "Assuming HashMap preserves insertion order.",
    ],
    performanceConsiderations:
      "Default load factor is 0.75. When size exceeds capacity * 0.75, table doubles in capacity causing re-hashing.",
    threadSafety: "Not Thread-Safe. Use ConcurrentHashMap for multi-threaded safety.",

    relatedTopics: ["Map", "HashSet", "ConcurrentHashMap", "equals and hashCode"],
    interviewQuestions: [
      {
        question: "How does HashMap handle hash collisions in Java 8+?",
        answer:
          "It converts linked list buckets to red-black trees when bucket size exceeds 8 (TREEIFY_THRESHOLD) and capacity >= 64.",
      },
    ],
    useCases: [
      "Caching database queries",
      "Indexing domain objects by ID",
      "Counting item frequencies",
    ],
    industryExamples: [
      "Spring Cache in-memory cache",
      "Hibernate 1st level session cache",
      "Jackson JSON object mapping",
    ],
    summaryTakeaways: [
      "HashMap provides O(1) average key-value lookups using hashing.",
      "Java 8+ uses Red-Black Trees for heavily collided buckets.",
      "Always use immutable keys with proper equals() and hashCode().",
    ],
    methods: [
      {
        name: "put(K key, V value)",
        signature: "V put(K key, V value)",
        desc: "Stores key-value pair.",
      },
      { name: "get(Object key)", signature: "V get(Object key)", desc: "Returns value for key." },
      {
        name: "containsKey(Object key)",
        signature: "boolean containsKey(Object key)",
        desc: "Checks key existence.",
      },
    ],
  },
};

export function lookupJavadoc(word: string, topicTitle?: string): JavadocEntry | null {
  const raw = word.trim();
  const clean = raw.replace(/^[@()]+/g, "").replace(/[<>()[\];,:]+/g, "");

  const cleanLower = clean.toLowerCase();

  // STEP 6: Hard Rules to Suppress Non-Educational Tokens
  if (
    STEP6_BLACKLIST.has(cleanLower) ||
    STEP6_BLACKLIST.has(raw.toLowerCase()) ||
    cleanLower.endsWith(".java") ||
    cleanLower.endsWith(".class") ||
    /^["']/.test(clean) ||
    /^\d+(\.\d+)?$/.test(clean) ||
    cleanLower.startsWith("java.") ||
    cleanLower.startsWith("javax.") ||
    cleanLower.startsWith("import ") ||
    cleanLower.startsWith("package ")
  ) {
    return null; // DO NOT create popup
  }

  // 1. Direct registry lookup
  if (JAVADOC_REGISTRY[clean]) return JAVADOC_REGISTRY[clean];
  if (JAVADOC_REGISTRY[raw]) return JAVADOC_REGISTRY[raw];

  // 2. Case-insensitive match
  const matchKey = Object.keys(JAVADOC_REGISTRY).find((k) => k.toLowerCase() === cleanLower);
  if (matchKey && JAVADOC_REGISTRY[matchKey]) {
    return JAVADOC_REGISTRY[matchKey];
  }

  // 3. Educational fallback for Java technical constructs (Classes, Interfaces, Annotations, Keywords)
  const isStandardLib = /^[A-Z][a-zA-Z0-9]+$/.test(clean);
  const formattedName = clean.length > 0 ? clean : raw;

  if (
    !isStandardLib &&
    !/^(if|else|switch|case|for|while|do|break|continue|return|class|interface|enum|record|sealed|permits|extends|implements|try|catch|finally|throw|throws|synchronized|volatile|transient|this|super|instanceof|static|final|public|private|protected|int|long|double|boolean|char|float|byte|short)$/.test(
      cleanLower,
    )
  ) {
    return null; // Suppress non-educational arbitrary identifier
  }

  return {
    name: formattedName,
    category: isStandardLib ? "Collections" : "Language Keyword",
    package: isStandardLib ? "java.util / java.lang" : undefined,
    signature: isStandardLib ? `public class ${formattedName}` : `keyword ${formattedName}`,
    since: "JDK 1.0+",
    officialDocUrl: isStandardLib
      ? `https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/${formattedName}.html`
      : undefined,
    officialDocSummary: `${formattedName} is a foundational component of the Java platform architecture.`,
    hierarchy: isStandardLib ? ["java.lang.Object", `java.util.${formattedName}`] : undefined,

    whatIsIt: `${formattedName} is a core ${isStandardLib ? "Java Standard Library API class" : "Java language construct"} essential for backend engineering.`,
    whyIntroduced: `Introduced into the Java language platform to provide robust, high-performance ${formattedName} execution capabilities.`,
    problemSolved: `Eliminates complex boilerplate code by providing standard JVM-optimized behavior for ${formattedName}.`,
    whatItProvides: [
      `Standardized ${formattedName} execution semantics`,
      `Optimal memory and CPU instruction efficiency`,
      `Seamless integration with the Java type system`,
    ],
    whyUseIt: `Guarantees reliable, maintainable code execution adhering to Java Language Specifications.`,
    whereUsed: [
      `Backend REST microservices`,
      `High-throughput enterprise applications`,
      `Core Java framework infrastructure`,
    ],
    whenToUse: [`When implementing standard ${formattedName} functionality in application logic.`],
    whenNotToUse: [
      `When alternative language constructs offer cleaner or higher-performance guarantees.`,
    ],

    internalWorking: `Executes directly via JVM bytecode instructions optimized by the Just-In-Time (JIT) compiler.`,
    syntax: isStandardLib
      ? `${formattedName} instance = new ${formattedName}();`
      : `${formattedName} (condition) { /* logic */ }`,
    codeExample: `// Production code example using ${formattedName}
${formattedName} obj = new ${formattedName}();
System.out.println("Executing " + obj);`,
    stepByStepExecution: [
      `1. ${formattedName} construct is compiled to bytecode.`,
      `2. ClassLoader loads bytecode into JVM Metaspace memory.`,
      `3. JIT compiler optimizes loop/execution hot-paths for native CPU speed.`,
    ],

    advantages: [
      `JVM-level performance optimization`,
      `Standardized API consistency across frameworks`,
      `Strong static type safety`,
    ],
    disadvantages: [`Requires understanding JVM semantics for memory-sensitive applications`],
    bestPractices: [
      `Follow standard Java code style guidelines.`,
      `Refer to official JavaDocs for signature specifications.`,
    ],
    commonMistakes: [
      `Using ${formattedName} outside its intended design scope.`,
      `Ignoring thread-safety implications in multi-threaded contexts.`,
    ],
    performanceConsiderations:
      "Optimized by JVM C2 JIT compiler for high-frequency runtime execution paths.",
    threadSafety: isStandardLib
      ? "Check specific class implementation details for concurrency locks."
      : "Thread-safe within stack frame scope.",

    relatedTopics: [topicTitle || "Java Core", "Collections", "OOP Principles"],
    interviewQuestions: [
      {
        question: `What is the core purpose of ${formattedName} in Java?`,
        answer: `${formattedName} provides standard execution semantics adhering to JVM specifications.`,
      },
    ],
    useCases: [`Enterprise Java backend applications`, `Spring Boot microservices`],
    industryExamples: ["Spring Framework Core", "Hibernate ORM", "Apache Kafka Client"],
    summaryTakeaways: [
      `${formattedName} is a fundamental Java component powering enterprise software.`,
      `Provides strong type safety and high-performance JVM execution.`,
      `Always follow production best practices when applying ${formattedName}.`,
    ],
  };
}
