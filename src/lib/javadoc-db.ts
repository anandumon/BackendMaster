export type JavadocEntry = {
  name: string;
  category:
    "Interface" | "Keyword text" | "Class" | "Annotation" | "Method" | "Concept" | "Primitive";
  package?: string;
  signature?: string;
  summary: string;
  detailedExplanation: string;
  feynman: string;
  since?: string;
  methods?: Array<{ name: string; signature: string; desc: string }>;
  codeExample: string;
  whenToUse?: { use: string[]; avoid: string[] };
  bestPractices: string[];
};

export const JAVADOC_REGISTRY: Record<string, JavadocEntry> = {
  // --- FUNCTIONAL INTERFACES & ANNOTATIONS ---
  Predicate: {
    name: "Predicate<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Predicate<T>",
    summary:
      "Represents a boolean-valued function of one argument. Used heavily in Streams filter operations.",
    detailedExplanation:
      "A Predicate is a single-abstract-method (SAM) functional interface that accepts a generic input parameter of type T and evaluates a boolean condition. Under the hood, Java represents lambda expressions implementing Predicate via invokedynamic bytecode instructions targeting MethodHandle call sites. This eliminates classloader overhead compared to traditional anonymous inner classes.",
    feynman:
      "Think of a bouncer at a club entrance checking if your ID shows age >= 21. It takes one object and returns true or false.",
    since: "Java 8",
    methods: [
      {
        name: "test",
        signature: "boolean test(T t)",
        desc: "Evaluates this predicate on the given argument.",
      },
      {
        name: "and",
        signature: "default Predicate<T> and(Predicate<? super T> other)",
        desc: "Returns a composed predicate that represents a logical AND.",
      },
      {
        name: "or",
        signature: "default Predicate<T> or(Predicate<? super T> other)",
        desc: "Returns a composed predicate that represents a logical OR.",
      },
      {
        name: "negate",
        signature: "default Predicate<T> negate()",
        desc: "Returns a predicate that represents the logical negation of this predicate.",
      },
    ],
    codeExample: `/**
 * Enterprise User Access Evaluation.
 * @param user Target user payload.
 * @return true if user possesses active session and verified credentials.
 */
Predicate<User> isVerified = user -> user.isVerified() && user.isEmailConfirmed();
Predicate<User> isNotSuspended = user -> !user.isSuspended();

// Compose predicates logically
Predicate<User> canAccessDashboard = isVerified.and(isNotSuspended);

List<User> eligibleUsers = userList.stream()
    .filter(canAccessDashboard)
    .toList();`,
    whenToUse: {
      use: [
        "Inside Stream.filter() pipelines to filter domain entities.",
        "To pass reusable validation logic into business rules engines.",
        "Combining multiple boolean checks dynamically with .and(), .or(), and .negate().",
      ],
      avoid: [
        "Do not use Predicate if you need to mutate the target object (use Consumer instead).",
        "Avoid throwing checked exceptions inside Predicate body.",
      ],
    },
    bestPractices: [
      "Keep predicates pure without side-effects.",
      "Chain complex conditions using .and() and .or() for readability.",
      "Prefer Predicate method references like User::isActive where possible.",
    ],
  },

  Consumer: {
    name: "Consumer<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Consumer<T>",
    summary: "Represents an operation that accepts a single input argument and returns no result.",
    detailedExplanation:
      "Consumer<T> is designed for side-effecting operations (such as logging, updating database state, sending network metrics, or updating UI components). It defines the single method 'void accept(T t)'. Java 8 Stream API utilizes Consumer inside '.forEach()' terminal operations.",
    feynman:
      "Think of a shredder or printer. You feed it a document (input argument), it processes it (prints or logs), and returns nothing (void).",
    since: "Java 8",
    methods: [
      {
        name: "accept",
        signature: "void accept(T t)",
        desc: "Performs this operation on the given argument.",
      },
      {
        name: "andThen",
        signature: "default Consumer<T> andThen(Consumer<? super T> after)",
        desc: "Returns a composed Consumer performing sequential operations.",
      },
    ],
    codeExample: `Consumer<Transaction> logAudit = tx -> logger.info("Tx ID: {}", tx.getId());
Consumer<Transaction> updateMetrics = tx -> metrics.increment("tx.success");

// Sequential composition
Consumer<Transaction> pipeline = logAudit.andThen(updateMetrics);
transactions.forEach(pipeline);`,
    whenToUse: {
      use: ["Logging payloads", "Emitting telemetry metrics", "In Stream.forEach() pipelines"],
      avoid: ["Transforming objects into new types (use Function<T,R> instead)"],
    },
    bestPractices: ["Use Consumer for side-effects like logging or metric collection."],
  },

  Function: {
    name: "Function<T, R>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Function<T, R>",
    summary:
      "Represents a function that accepts one argument of type T and produces a result of type R.",
    detailedExplanation:
      "Function<T, R> models mapping operations. In functional programming, it maps domain element T into range R. In Java Streams, '.map(Function)' applies this transformation element-by-element without mutating source data.",
    feynman: "Think of a currency converter. Input USD ($), transform and output Euros (€).",
    since: "Java 8",
    methods: [
      {
        name: "apply",
        signature: "R apply(T t)",
        desc: "Applies this function to the given argument.",
      },
      {
        name: "andThen",
        signature: "default <V> Function<T, V> andThen(...)",
        desc: "Composes downstream transformation.",
      },
    ],
    codeExample: `Function<UserEntity, UserDTO> toDto = entity -> new UserDTO(
    entity.getId(),
    entity.getEmail(),
    entity.getRole()
);

UserDTO dto = toDto.apply(currentUserEntity);`,
    whenToUse: {
      use: ["Mapping Entities to DTOs", "In Stream.map() pipelines", "Data conversions"],
      avoid: ["Filtering collections (use Predicate instead)"],
    },
    bestPractices: ["Use Function in Stream.map() transformations."],
  },

  Supplier: {
    name: "Supplier<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Supplier<T>",
    summary: "Represents a supplier of results with zero input arguments.",
    detailedExplanation:
      "Supplier<T> enables lazy evaluation. Rather than creating expensive resources upfront, a Supplier defers execution until the `.get()` method is called.",
    feynman: "Think of a vending machine button. Press it on-demand to fetch a fresh item.",
    since: "Java 8",
    methods: [{ name: "get", signature: "T get()", desc: "Gets a result value of type T." }],
    codeExample: `Supplier<Order> fallbackSupplier = () => database.fetchDefaultOrder();
Order order = optionalOrder.orElseGet(fallbackSupplier);`,
    whenToUse: {
      use: ["Lazy evaluation in Optional.orElseGet()", "Deferred factory creation"],
      avoid: ["Eager computation where values are pre-calculated"],
    },
    bestPractices: ["Use Supplier for deferred resource creation."],
  },

  Runnable: {
    name: "Runnable",
    category: "Interface",
    package: "java.lang",
    signature: "@FunctionalInterface public interface Runnable",
    summary: "Represents a task executed concurrently without arguments or return values.",
    detailedExplanation:
      "Runnable defines a unit of work that can be executed by a Thread or ExecutorService. It contains a single `void run()` method and cannot throw checked exceptions.",
    feynman:
      "An instruction sheet given to a worker to run an async job without returning a status report.",
    since: "Java 1.0",
    methods: [{ name: "run", signature: "void run()", desc: "Executes the task." }],
    codeExample: `Runnable task = () => System.out.println("Processing background job...");
executorService.submit(task);`,
    whenToUse: {
      use: ["Asynchronous fire-and-forget tasks", "ExecutorService execution"],
      avoid: ["When a return value or checked exception handling is required (use Callable)"],
    },
    bestPractices: ["Prefer ExecutorService over raw Thread instantiations."],
  },

  Callable: {
    name: "Callable<V>",
    category: "Interface",
    package: "java.util.concurrent",
    signature: "@FunctionalInterface public interface Callable<V>",
    summary: "A task that returns a result of type V and may throw checked exceptions.",
    detailedExplanation:
      "Callable is the asynchronous counterpart to Runnable that supports returning computed values and propagating checked exceptions back to the submitting thread via Future.get().",
    feynman:
      "Hiring a contractor to calculate taxes. They return the total computed tax or report an error if files are missing.",
    since: "Java 1.5",
    methods: [
      {
        name: "call",
        signature: "V call() throws Exception",
        desc: "Computes a result or throws exception.",
      },
    ],
    codeExample: `Callable<String> fetchTask = () => httpClient.get("https://api.example.com");
Future<String> future = executor.submit(fetchTask);
String response = future.get();`,
    whenToUse: {
      use: ["Async tasks returning values", "Tasks that throw checked exceptions"],
      avoid: ["Simple void side-effect tasks (use Runnable)"],
    },
    bestPractices: ["Use with ExecutorService or CompletableFuture for async result retrieval."],
  },

  Comparator: {
    name: "Comparator<T>",
    category: "Interface",
    package: "java.util",
    signature: "@FunctionalInterface public interface Comparator<T>",
    summary: "A comparison function which imposes a total ordering on a collection of objects.",
    detailedExplanation:
      "Comparator provides ordering for objects that may not have natural ordering (or to override natural ordering). Enables clean lambda comparisons and method chaining.",
    feynman: "Like a judge ranking contestants by height, score, or age.",
    since: "Java 1.2",
    methods: [
      {
        name: "compare",
        signature: "int compare(T o1, T o2)",
        desc: "Compares two arguments for order.",
      },
      {
        name: "comparing",
        signature: "static <T, U> Comparator<T> comparing(...)",
        desc: "Creates comparator from key extractor.",
      },
    ],
    codeExample: `users.sort(Comparator.comparing(User::getAge).reversed());`,
    whenToUse: {
      use: ["Custom collection sorting", "Stream.sorted() pipelines"],
      avoid: ["Modifying collection objects during comparison"],
    },
    bestPractices: ["Use Comparator.comparing() method references for clean sorting."],
  },

  Stream: {
    name: "Stream<T>",
    category: "Interface",
    package: "java.util.stream",
    signature: "public interface Stream<T> extends BaseStream<T, Stream<T>>",
    summary: "A sequence of elements supporting sequential and parallel aggregate operations.",
    detailedExplanation:
      "Stream API introduced functional-style operations on streams of elements. Stream pipelines consist of a source, zero or more intermediate operations (like filter, map), and a terminal operation (like collect, toList, count). Intermediate operations are lazy and evaluated only when terminal operation executes.",
    feynman: "A high-speed factory conveyor belt filtering, transforming, and assembling items.",
    since: "Java 8",
    methods: [
      {
        name: "filter",
        signature: "Stream<T> filter(Predicate<? super T> p)",
        desc: "Filters elements matching predicate.",
      },
      {
        name: "map",
        signature: "<R> Stream<R> map(Function<? super T, ? extends R> f)",
        desc: "Transforms elements.",
      },
      {
        name: "toList",
        signature: "List<T> toList()",
        desc: "Collects elements into an unmodifiable List.",
      },
    ],
    codeExample: `List<String> activeNames = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .toList();`,
    whenToUse: {
      use: ["Declarative data processing", "Filtering, transforming, and grouping collections"],
      avoid: ["Modifying external variables inside stream pipelines (side-effects)"],
    },
    bestPractices: ["Streams are single-use pipeline wrappers; consume with terminal operations."],
  },

  Optional: {
    name: "Optional<T>",
    category: "Class",
    package: "java.util",
    signature: "public final className Optional<T>",
    summary: "A container object which may or may not contain a non-null value.",
    detailedExplanation:
      "Optional is a type-level solution to explicitly represent absent values without returning null. Prevents NullPointerExceptions by forcing explicit presence checking via .map(), .flatMap(), and .orElseGet().",
    feynman:
      "A gift box that might contain a present or be empty. Inspect before opening to avoid NullPointerException.",
    since: "Java 8",
    methods: [
      {
        name: "ofNullable",
        signature: "static <T> Optional<T> ofNullable(T value)",
        desc: "Creates Optional from value.",
      },
      {
        name: "orElseGet",
        signature: "T orElseGet(Supplier<? extends T> s)",
        desc: "Returns value or invokes fallback supplier.",
      },
    ],
    codeExample: `String email = userRepository.findById(id)
    .map(User::getEmail)
    .orElse("unknown@domain.com");`,
    whenToUse: {
      use: ["Method return types for queries that may return no result"],
      avoid: ["Using Optional as field types or method parameter types"],
    },
    bestPractices: ["Use Optional as return type for methods that might not find a result."],
  },

  "@FunctionalInterface": {
    name: "@FunctionalInterface",
    category: "Annotation",
    package: "java.lang",
    signature:
      "@Documented @Retention(RUNTIME) @Target(TYPE) public @interface FunctionalInterface",
    summary:
      "Annotation indicating an interface is intended to be a functional interface with exactly ONE abstract method.",
    detailedExplanation:
      "Annotation enforced by compiler to ensure an interface contains exactly one abstract method (Single Abstract Method - SAM). It allows lambdas and method references to be bound to it.",
    feynman:
      "A mandatory stamp of approval ensuring no developer accidentally adds a second abstract method.",
    since: "Java 8",
    methods: [],
    codeExample: `@FunctionalInterface
public interface Validator<T> {
    boolean validate(T item);
}`,
    whenToUse: {
      use: ["Annotating single-abstract-method custom interfaces designed for lambdas"],
      avoid: ["Interfaces with multiple abstract methods"],
    },
    bestPractices: ["Always annotate single-abstract-method interfaces with @FunctionalInterface."],
  },

  // --- KEYWORDS ---
  for: {
    name: "for",
    category: "Keyword text",
    signature: "for (init; condition; update) { ... } | for (Type item : collection) { ... }",
    summary:
      "Iteration control flow statement repeating a block of code based on loop condition or collection traversal.",
    detailedExplanation:
      "Java supports two primary 'for' loop constructs: 1) Traditional index-managed loop (`for(int i=0; i<N; i++)`), compiled directly into JVM bytecode jump instructions (`goto`, `if_icmpge`). 2) Enhanced for-each loop (`for(Element e : iterable)`), which compiler translates into Iterator-based traversal (`iterator.hasNext()`, `iterator.next()`) or indexed array access.",
    feynman: "Doing 10 jumping jacks or handing out a flier to every person standing in line.",
    since: "Java 1.0 (Enhanced for-each in Java 5)",
    methods: [],
    codeExample: `// 1. Enhanced for-each iteration over Iterable
for (User user : activeUsers) {
    notificationService.send(user);
}

// 2. Traditional counted loop with index
for (int i = 0; i < buffer.length; i++) {
    buffer[i] = (byte) (i * 2);
}`,
    whenToUse: {
      use: [
        "Iterating over collections or arrays when sequence order matters.",
        "When index position `i` is required during iteration.",
        "When performance requires low allocation without Iterator object creation on hot paths.",
      ],
      avoid: [
        "Avoid traditional for-loops when Stream API operations (.filter, .map) provide cleaner declarative code.",
      ],
    },
    bestPractices: [
      "Prefer enhanced for-each loops over indexed loops unless array index is explicitly needed.",
      "Never modify a Collection structure (add/remove) inside a for-each loop; use Iterator.remove() or Collection.removeIf().",
    ],
  },

  if: {
    name: "if",
    category: "Keyword text",
    signature: "if (booleanCondition) { /* branch */ } else { /* fallback */ }",
    summary:
      "Conditional control flow statement executing a block of code if the boolean expression evaluates to true.",
    detailedExplanation:
      "The 'if' statement evaluates a boolean expression. At bytecode level, the compiler generates conditional branch instructions such as `ifeq`, `ifne`, `iflt`, `if_cmpne`.",
    feynman:
      "A decision fork in a road. If it is raining, take an umbrella. Otherwise, wear sunglasses.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public void processOrder(Order order) {
    if (order == null || order.isCancelled()) {
        logger.warn("Skipping invalid order");
        return;
    }
    processPayment(order);
}`,
    whenToUse: {
      use: ["Evaluating boolean business rules", "Guard clauses at start of methods"],
      avoid: ["Deep nesting (>3 levels). Refactor into early returns or strategy pattern."],
    },
    bestPractices: [
      "Use early returns (guard clauses) to eliminate deep nested if/else statements.",
    ],
  },

  switch: {
    name: "switch",
    category: "Keyword text",
    signature: "switch (expression) { case A -> value; default -> fallback; }",
    summary: "Multi-way branch statement selecting an execution path based on an expression value.",
    detailedExplanation:
      "Java 'switch' statements compile into either `tableswitch` (O(1) direct lookup table for dense integer ranges) or `lookupswitch` (O(log N) binary search). Modern Java 14+ enhanced switch expressions yield values directly.",
    feynman:
      "A train track switch directing a train down track A, B, or C based on its destination code.",
    since: "Java 1.0 (Enhanced Arrow Expressions in Java 14)",
    methods: [],
    codeExample: `String label = switch (orderStatus) {
    case PENDING -> "Order Awaiting Payment";
    case PROCESSING -> "Fulfilling Items";
    case COMPLETED -> "Order Delivered";
    default -> "Unknown Status";
};`,
    whenToUse: {
      use: ["Branching on Enums, Strings, or primitives"],
      avoid: ["Legacy break-based switch statements that permit accidental fall-through bugs"],
    },
    bestPractices: [
      "Prefer modern arrow `case ->` switch expressions to eliminate `break` statements.",
    ],
  },

  synchronized: {
    name: "synchronized",
    category: "Keyword text",
    signature: "public synchronized void updateBalance(double amount)",
    summary:
      "Acquires an intrinsic lock (monitor) on a block or method to prevent thread race conditions.",
    detailedExplanation:
      "The `synchronized` keyword enforces mutual exclusion. When entering a synchronized method or block, the executing thread acquires the target object's monitor lock (`monitorenter` instruction). Other threads attempting access are blocked until the lock holder exits (`monitorexit`).",
    feynman: "A single-occupancy lock on a bathroom door; only one thread holds the key at a time.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public synchronized void deposit(double amount) {
    this.balance += amount;
}`,
    whenToUse: {
      use: ["Protecting critical sections accessing mutable shared state"],
      avoid: ["Long-running I/O calls inside synchronized blocks"],
    },
    bestPractices: ["Keep synchronized blocks as small as possible to minimize thread contention."],
  },

  volatile: {
    name: "volatile",
    category: "Keyword text",
    signature: "private volatile boolean active = true;",
    summary:
      "Forces variable reads and writes directly from/to main memory, guaranteeing visibility across threads.",
    detailedExplanation:
      "The `volatile` modifier ensures that every read of a variable gets the most recent write by any thread. Compiler and CPU cache optimizations are suppressed for volatile fields.",
    feynman:
      "A shared whiteboard on the office wall. When one worker writes a note, everyone instantly sees it.",
    since: "Java 1.0",
    methods: [],
    codeExample: `private volatile boolean shutdownRequested = false;`,
    whenToUse: {
      use: ["Single boolean flags or status state read by multiple threads"],
      avoid: ["Compound operations like count++ (use AtomicInteger instead)"],
    },
    bestPractices: ["Use volatile for status flags. Use AtomicInteger when atomicity is needed."],
  },

  record: {
    name: "record",
    category: "Keyword text",
    signature: "public record UserDto(Long id, String email) {}",
    summary:
      "Immutable data carrier class introduced in Java 14/16 with auto-generated constructor, getters, equals, hashCode, and toString.",
    detailedExplanation:
      "Records are transparent carriers for immutable data. The compiler automatically generates private final fields, a canonical constructor, component accessor methods, equals(), hashCode(), and toString(). Records cannot extend other classes.",
    feynman: "A sealed express parcel containing unalterable data values.",
    since: "Java 14 / 16",
    methods: [],
    codeExample: `public record CustomerResponse(Long id, String name, String email) {}`,
    whenToUse: {
      use: ["DTOs, API response payloads, value objects"],
      avoid: ["Mutable entities requiring setters or JPA entities"],
    },
    bestPractices: ["Use records for immutable data transfer objects."],
  },
};

/**
 * Checks whether a word exists in the Javadoc DB registry.
 */
export function isKnownJavadocKey(word: string): boolean {
  if (!word) return false;
  const clean = word
    .trim()
    .replace(/^[@()]+/g, "")
    .replace(/[<>()[\];,:]+/g, "");

  if (JAVADOC_REGISTRY[clean] || JAVADOC_REGISTRY[word.trim()]) return true;

  return Object.keys(JAVADOC_REGISTRY).some(
    (k) => k.toLowerCase() === clean.toLowerCase() || k.toLowerCase() === word.trim().toLowerCase(),
  );
}

/**
 * Looks up a Javadoc entry. Returns null if the word is NOT registered in JAVADOC_REGISTRY.
 */
export function lookupJavadoc(word: string): JavadocEntry | null {
  if (!word) return null;
  const clean = word
    .trim()
    .replace(/^[@()]+/g, "")
    .replace(/[<>()[\];,:]+/g, "");

  if (JAVADOC_REGISTRY[clean]) return JAVADOC_REGISTRY[clean];
  if (JAVADOC_REGISTRY[word.trim()]) return JAVADOC_REGISTRY[word.trim()];

  const matchKey = Object.keys(JAVADOC_REGISTRY).find(
    (k) => k.toLowerCase() === clean.toLowerCase() || k.toLowerCase() === word.trim().toLowerCase(),
  );

  if (matchKey && JAVADOC_REGISTRY[matchKey]) {
    return JAVADOC_REGISTRY[matchKey];
  }

  // Return null if keyword is NOT found in JAVADOC_REGISTRY
  return null;
}
