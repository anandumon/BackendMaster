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
  since?: string;
  officialDocUrl?: string;
  hierarchy?: string[];
  overview: string;
  purpose: string;
  syntax: string;
  codeExample: string;
  useCases: string[];
  bestPractices: string[];
  commonMistakes: string[];
  interviewQuestions: Array<{ question: string; answer: string }>;
  relatedTopics: string[];
  methods?: Array<{ name: string; signature: string; desc: string }>;
};

// STEP 6: Explicit Blacklist for Non-Educational Terms (Variables, Examples, Literals)
const STEP6_BLACKLIST = new Set([
  // Example Class Names
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
  // File names & extensions
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
  // Variable Names & Parameters
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
  // Method Calls
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
  // Literals & Booleans
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
    hierarchy: [
      "java.lang.Object",
      "java.util.AbstractCollection<E>",
      "java.util.AbstractQueue<E>",
      "java.util.PriorityQueue<E>",
    ],
    overview:
      "An unbounded priority queue based on a binary min-heap data structure. Elements are ordered according to natural ordering or by a Comparator provided at queue construction.",
    purpose:
      "Provides O(log n) time insertion and extraction of the minimum (or maximum) element, ideal for scheduling tasks by priority or Dijkstra's shortest path algorithm.",
    syntax:
      "PriorityQueue<Type> pq = new PriorityQueue<>(Comparator.comparing(Type::getPriority));",
    codeExample: `// Min-Heap of items ordered by priority score
PriorityQueue<Process> pq = new PriorityQueue<>(Comparator.comparingInt(Process::getPriority));

pq.offer(new Process("Job-Low", 5));
pq.offer(new Process("Job-High", 1)); // Highest priority (lowest integer)

Process highest = pq.poll(); // Returns "Job-High"`,
    useCases: [
      "Task scheduling engines (e.g. OS process scheduling)",
      "Graph algorithms (Dijkstra's shortest path, Prim's MST)",
      "Top-K elements selection in streaming analytics",
    ],
    bestPractices: [
      "Ensure elements inserted into PriorityQueue either implement Comparable or pass an explicit Comparator.",
      "Do NOT rely on iterator() for sorted order; iteration yields elements in internal heap array order.",
    ],
    commonMistakes: [
      "Assuming iterator() returns elements in sorted order (only poll() guarantees priority ordering).",
      "Mutating an element's priority field while it is already inside the PriorityQueue.",
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
    relatedTopics: ["Collections", "Comparator", "Queue", "Heap Data Structure"],
    methods: [
      {
        name: "offer(E e)",
        signature: "boolean offer(E e)",
        desc: "Inserts the specified element into this priority queue. O(log n)",
      },
      {
        name: "poll()",
        signature: "E poll()",
        desc: "Retrieves and removes the head of this queue (min element). O(log n)",
      },
      {
        name: "peek()",
        signature: "E peek()",
        desc: "Retrieves, but does not remove, the head of this queue. O(1)",
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
    hierarchy: ["java.lang.Object", "java.util.AbstractMap<K,V>", "java.util.HashMap<K,V>"],
    overview:
      "Hash table based implementation of the Map interface. Provides constant-time O(1) performance for basic operations (get and put).",
    purpose: "Solves key-value data retrieval problems instantly using bucket hashing algorithms.",
    syntax: "Map<KeyType, ValueType> map = new HashMap<>();",
    codeExample: `Map<String, Record> cache = new HashMap<>();
cache.put("rec_101", new Record("Data"));
Record rec = cache.get("rec_101"); // O(1) lookup`,
    useCases: [
      "In-memory caching of database lookup records",
      "Indexing items by unique identifiers (e.g. UUID)",
      "Counting item frequencies in data processing pipelines",
    ],
    bestPractices: [
      "Always override hashCode() and equals() together for custom key classes.",
      "Specify an initial capacity if the number of entries is known in advance to avoid resize overhead.",
    ],
    commonMistakes: [
      "Using mutable objects as keys and changing their state after put().",
      "Assuming HashMap maintains insertion order (use LinkedHashMap instead).",
    ],
    interviewQuestions: [
      {
        question: "How does HashMap handle hash collisions in Java 8+?",
        answer:
          "It uses linked lists initially; when a bucket exceeds 8 elements (TREEIFY_THRESHOLD), it converts to a red-black tree (O(log n)).",
      },
    ],
    relatedTopics: ["Map", "HashSet", "ConcurrentHashMap", "equals and hashCode"],
    methods: [
      {
        name: "put(K key, V value)",
        signature: "V put(K key, V value)",
        desc: "Associates the specified value with the specified key in this map.",
      },
      {
        name: "get(Object key)",
        signature: "V get(Object key)",
        desc: "Returns the value to which the specified key is mapped.",
      },
      {
        name: "containsKey(Object key)",
        signature: "boolean containsKey(Object key)",
        desc: "Returns true if this map contains a mapping for key.",
      },
    ],
  },

  ArrayList: {
    name: "ArrayList<E>",
    category: "Collections",
    package: "java.util",
    signature:
      "public class ArrayList<E> extends AbstractList<E> implements List<E>, RandomAccess, Cloneable, Serializable",
    since: "Java 1.2",
    officialDocUrl:
      "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java.util/ArrayList.html",
    hierarchy: ["java.lang.Object", "java.util.AbstractList<E>", "java.util.ArrayList<E>"],
    overview:
      "Resizable-array implementation of the List interface. Implements all optional list operations and permits all elements including null.",
    purpose:
      "Provides dynamic fast indexed access O(1) to elements compared to fixed-size primitive arrays.",
    syntax: "List<Type> list = new ArrayList<>();",
    codeExample: `List<String> items = new ArrayList<>();
items.add("Item-A");
items.add("Item-B");
String first = items.get(0); // O(1) fast random access`,
    useCases: [
      "Storing contiguous dynamic lists",
      "Passing collections between API layers",
      "In-memory list processing",
    ],
    bestPractices: [
      "Use ArrayList when read operations far outnumber insertions/deletions in the middle of list.",
    ],
    commonMistakes: [
      "Using ArrayList for frequent insertions at arbitrary indexes (causes O(n) array copy shift).",
    ],
    interviewQuestions: [
      {
        question: "How does ArrayList expand its capacity automatically?",
        answer:
          "When full, it expands capacity by 50% (newCapacity = oldCapacity + (oldCapacity >> 1)) using Arrays.copyOf().",
      },
    ],
    relatedTopics: ["List", "LinkedList", "Vector", "Collections"],
    methods: [
      {
        name: "add(E e)",
        signature: "boolean add(E e)",
        desc: "Appends the specified element to the end of this list.",
      },
      {
        name: "get(int index)",
        signature: "E get(int index)",
        desc: "Returns the element at the specified position in this list.",
      },
    ],
  },

  Comparator: {
    name: "Comparator<T>",
    category: "Interfaces",
    package: "java.util",
    signature: "@FunctionalInterface public interface Comparator<T>",
    since: "Java 1.2",
    officialDocUrl:
      "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java.util/Comparator.html",
    hierarchy: ["java.util.Comparator<T>"],
    overview:
      "A comparison function imposing a total ordering on a collection of objects. Can be passed to sort methods or priority queues.",
    purpose:
      "Decouples ordering logic from domain classes, allowing multiple custom sorting rules.",
    syntax: "Comparator<Type> comp = Comparator.comparing(Type::getField);",
    codeExample: `// Multi-field comparison pipeline
Comparator<Record> comp = Comparator
    .comparing(Record::getGroup)
    .thenComparing(Record::getId);

records.sort(comp);`,
    useCases: [
      "Sorting lists dynamically",
      "Configuring PriorityQueue ordering",
      "TreeSet/TreeMap custom sorting",
    ],
    bestPractices: [
      "Use Comparator.comparing() factory methods and method references for clean readable code.",
    ],
    commonMistakes: [
      "Returning subtraction (a.val - b.val) which can cause integer overflow errors.",
    ],
    interviewQuestions: [
      {
        question: "Difference between Comparable and Comparator?",
        answer:
          "Comparable defines natural order inside the class (compareTo), while Comparator defines external custom ordering rules.",
      },
    ],
    relatedTopics: ["Comparable", "PriorityQueue", "Collections.sort", "Lambda Expressions"],
    methods: [
      {
        name: "compare(T o1, T o2)",
        signature: "int compare(T o1, T o2)",
        desc: "Compares its two arguments for order.",
      },
      {
        name: "comparing(Function keyExtractor)",
        signature: "static <T,U> Comparator<T> comparing(...)",
        desc: "Accepts a key extractor function returning a Comparable key.",
      },
    ],
  },

  Stream: {
    name: "Stream<T>",
    category: "Streams",
    package: "java.util.stream",
    signature: "public interface Stream<T> extends BaseStream<T, Stream<T>>",
    since: "Java 8",
    officialDocUrl:
      "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java.util/stream/Stream.html",
    hierarchy: ["java.util.stream.BaseStream", "java.util.stream.Stream<T>"],
    overview:
      "A sequence of elements supporting sequential and parallel aggregate operations like filter, map, and reduce.",
    purpose:
      "Enables declarative functional programming over collections without mutating underlying data sources.",
    syntax: "list.stream().filter(...).map(...).toList();",
    codeExample: `List<String> activeEmails = entityList.stream()
    .filter(Entity::isActive)
    .map(Entity::getEmail)
    .toList();`,
    useCases: [
      "Data filtering and mapping",
      "Collection aggregations",
      "Parallel processing across multi-core CPUs",
    ],
    bestPractices: ["Keep stream pipelines functional and free of side-effects."],
    commonMistakes: ["Reusing a consumed Stream (throws IllegalStateException)."],
    interviewQuestions: [
      {
        question: "Intermediate vs Terminal operations in Stream API?",
        answer:
          "Intermediate operations (filter, map) are lazy and return a new Stream. Terminal operations (collect, toList, forEach) trigger execution and consume the stream.",
      },
    ],
    relatedTopics: ["Optional", "Collectors", "Predicate", "Function"],
    methods: [
      {
        name: "filter(Predicate p)",
        signature: "Stream<T> filter(Predicate<? super T> predicate)",
        desc: "Returns stream of elements matching predicate.",
      },
      {
        name: "map(Function f)",
        signature: "<R> Stream<R> map(Function<? super T, ? extends R> mapper)",
        desc: "Transforms elements.",
      },
    ],
  },

  synchronized: {
    name: "synchronized",
    category: "Concurrency",
    package: "java.lang",
    syntax:
      "synchronized(lockObject) { /* critical section */ } | public synchronized void method()",
    since: "Java 1.0",
    officialDocUrl: "https://docs.oracle.com/javase/tutorial/essential/concurrency/locksync.html",
    overview:
      "Keyword enforcing mutual exclusion lock on critical sections of code, preventing race conditions across threads.",
    purpose:
      "Guarantees thread-safety and memory visibility by preventing concurrent threads from executing the same block simultaneously.",
    codeExample: `public synchronized void deposit(double amount) {
    this.balance += amount; // Thread-safe state update
}`,
    useCases: ["Protecting mutable shared state in multi-threaded programs"],
    bestPractices: ["Keep synchronized blocks minimal to avoid bottlenecking performance."],
    commonMistakes: ["Synchronizing on a mutable String or Integer object reference."],
    interviewQuestions: [
      {
        question: "What is a reentrant monitor lock?",
        answer:
          "Reentrant means a thread holding a lock can re-enter another synchronized block guarded by the same lock without deadlocking.",
      },
    ],
    relatedTopics: ["volatile", "ReentrantLock", "Thread"],
    methods: [],
  },

  JVM: {
    name: "JVM (Java Virtual Machine)",
    category: "JVM",
    package: "java.lang",
    signature: "Java Virtual Machine Specification",
    since: "JDK 1.0",
    officialDocUrl: "https://docs.oracle.com/javase/specs/jvms/se21/html/index.html",
    overview:
      "An abstract computing machine that enables a computer to run a Java program. It loads bytecode, verifies code, and executes it via JIT compilation.",
    purpose:
      "Provides platform independence ('Write Once, Run Anywhere') and automated memory management.",
    syntax: "java -jar application.jar",
    codeExample: `// Memory layout managed by JVM
// Heap: Object allocations
// Stack: Primitive variables & stack frames
// Metaspace: Class metadata`,
    useCases: [
      "Executing compiled .class bytecode",
      "Automated Garbage Collection",
      "JIT execution",
    ],
    bestPractices: [
      "Tune JVM heap parameters (-Xms, -Xmx) according to production workload demands.",
    ],
    commonMistakes: ["Ignoring Garbage Collection logs when diagnosing latency spikes."],
    interviewQuestions: [
      {
        question: "What are the main memory areas inside the JVM?",
        answer:
          "Heap Memory (Objects), Stack Memory (Frames & Primitives), Metaspace (Class Metadata), Program Counter (PC) Register, Native Method Stack.",
      },
    ],
    relatedTopics: ["Garbage Collector", "Bytecode", "JIT Compiler", "Class Loader"],
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

  // 3. Fallback for valid Java technical constructs (Classes, Interfaces, Annotations, Keywords)
  const isStandardLib = /^[A-Z][a-zA-Z0-9]+$/.test(clean);
  const formattedName = clean.length > 0 ? clean : raw;

  // Filter out arbitrary user class names or method calls (STEP 6)
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
    hierarchy: isStandardLib ? ["java.lang.Object", `java.util.${formattedName}`] : undefined,
    overview: `${formattedName} is an essential ${isStandardLib ? "Java Standard Library component" : "Java language construct"} powering backend engineering.`,
    purpose: `Provides structured, efficient capabilities for ${formattedName} processing in production applications.`,
    syntax: isStandardLib
      ? `${formattedName} obj = new ${formattedName}();`
      : `${formattedName} (condition) { ... }`,
    codeExample: `// Practical application of ${formattedName}
${formattedName} instance = new ${formattedName}();
System.out.println("Processing " + instance);`,
    useCases: [
      `Used in high-throughput backend services requiring ${formattedName}.`,
      `Standard pattern across enterprise Java applications.`,
    ],
    bestPractices: [
      `Follow standard Java naming conventions and concurrency safety models.`,
      `Always reference official JavaDocs for method signatures.`,
    ],
    commonMistakes: [
      `Using ${formattedName} outside its intended scope.`,
      `Over-complicating logic when simpler constructs exist.`,
    ],
    interviewQuestions: [
      {
        question: `What is the core purpose of ${formattedName} in Java?`,
        answer: `${formattedName} provides high-performance execution mechanics adhering to JVM specifications.`,
      },
    ],
    relatedTopics: [topicTitle || "Java Core", "Collections", "OOP Principles"],
  };
}
