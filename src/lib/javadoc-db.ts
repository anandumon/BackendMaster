export type JavadocEntry = {
  name: string;
  category: "Interface" | "Keyword text" | "Class" | "Annotation" | "Method" | "Concept";
  package?: string;
  signature?: string;
  summary: string;
  feynman: string;
  since?: string;
  methods?: Array<{ name: string; signature: string; desc: string }>;
  codeExample: string;
  bestPractices: string[];
};

export const JAVADOC_REGISTRY: Record<string, JavadocEntry> = {
  Predicate: {
    name: "Predicate<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Predicate<T>",
    summary:
      "Represents a boolean-valued function of one argument. Used heavily in Streams filter operations.",
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
      {
        name: "isEqual",
        signature: "static <T> Predicate<T> isEqual(Object targetRef)",
        desc: "Returns a predicate that tests if two arguments are equal according to Objects.equals.",
      },
    ],
    codeExample: `/**
 * Filter users active in the banking system.
 * @param user The user entity to evaluate.
 * @return true if user account is active and verified.
 */
Predicate<User> isActiveUser = user -> user.isActive() && user.isVerified();
List<User> activeUsers = userList.stream().filter(isActiveUser).toList();`,
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
    feynman:
      "Think of a shredder or a printer. You feed it a document (input argument), it processes it (prints or logs), and returns nothing (void).",
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
        desc: "Returns a composed Consumer that performs, in sequence, this operation followed by the after operation.",
      },
    ],
    codeExample: `/**
 * Audit logger for incoming transactions.
 * @param tx Transaction to log.
 */
Consumer<Transaction> auditLogger = tx -> logger.info("Processing tx: {}", tx.getId());
auditLogger.andThen(tx -> metrics.increment("tx.count")).accept(currentTx);`,
    bestPractices: [
      "Use Consumer for side-effects like logging, UI updates, or metric reporting.",
      "Never throw checked exceptions directly inside a Consumer lambda.",
    ],
  },

  Function: {
    name: "Function<T, R>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Function<T, R>",
    summary:
      "Represents a function that accepts one argument of type T and produces a result of type R.",
    feynman:
      "Think of a currency converter or a factory machine. You feed in USD ($), it transforms it and outputs Euros (€).",
    since: "Java 8",
    methods: [
      {
        name: "apply",
        signature: "R apply(T t)",
        desc: "Applies this function to the given argument.",
      },
      {
        name: "andThen",
        signature: "default <V> Function<T, V> andThen(Function<? super R, ? extends V> after)",
        desc: "Returns a composed function that first applies this function to its input, and then applies after to result.",
      },
      {
        name: "compose",
        signature: "default <V> Function<V, R> compose(Function<? super V, ? extends T> before)",
        desc: "Returns a composed function that first applies before to its input, and then applies this function to result.",
      },
      {
        name: "identity",
        signature: "static <T> Function<T, T> identity()",
        desc: "Returns a function that always returns its input argument.",
      },
    ],
    codeExample: `/**
 * Transform User entity to UserDTO.
 */
Function<User, UserDTO> toDto = user -> new UserDTO(user.getId(), user.getEmail());
UserDTO dto = toDto.apply(currentUser);`,
    bestPractices: [
      "Use Function in Stream.map() transformations.",
      "Avoid stateful mutable variables inside Function implementations.",
    ],
  },

  Supplier: {
    name: "Supplier<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Supplier<T>",
    summary:
      "Represents a supplier of results. Accepts zero parameters and returns a value of type T.",
    feynman:
      "Think of a vending machine or a factory generator. You press a button (no arguments required), and it yields a fresh item (output).",
    since: "Java 8",
    methods: [{ name: "get", signature: "T get()", desc: "Gets a result value of type T." }],
    codeExample: `/**
 * Lazy evaluation supplier for expensive database calls.
 */
Supplier<Order> defaultOrderSupplier = () => db.fetchDefaultFallbackOrder();
Order result = optionalOrder.orElseGet(defaultOrderSupplier);`,
    bestPractices: [
      "Use Supplier for lazy evaluation in Optional.orElseGet() and deferred logging.",
    ],
  },

  BiFunction: {
    name: "BiFunction<T, U, R>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface BiFunction<T, U, R>",
    summary:
      "Represents a function that accepts two arguments (T and U) and produces a result of type R.",
    feynman: "Think of a blender taking strawberries and bananas to produce a single smoothie.",
    since: "Java 8",
    methods: [
      {
        name: "apply",
        signature: "R apply(T t, U u)",
        desc: "Applies this function to the two arguments.",
      },
    ],
    codeExample: `BiFunction<Integer, Integer, Integer> sum = (a, b) -> a + b;
Integer result = sum.apply(10, 20); // 30`,
    bestPractices: ["Use for binary computations and Map.merge() operations."],
  },

  Runnable: {
    name: "Runnable",
    category: "Interface",
    package: "java.lang",
    signature: "@FunctionalInterface public interface Runnable",
    summary:
      "Represents a task executed by a thread or executor service that takes no parameters and returns no result.",
    feynman:
      "Think of an instruction sheet given to a worker. The worker executes the task and finishes without writing a report back.",
    since: "Java 1.0",
    methods: [{ name: "run", signature: "void run()", desc: "Executes the concurrent task." }],
    codeExample: `Runnable backgroundTask = () => System.out.println("Async thread running...");
new Thread(backgroundTask).start();`,
    bestPractices: ["Prefer ExecutorService over creating raw Thread objects."],
  },

  Callable: {
    name: "Callable<V>",
    category: "Interface",
    package: "java.util.concurrent",
    signature: "@FunctionalInterface public interface Callable<V>",
    summary: "A task that returns a result of type V and may throw checked exceptions.",
    feynman:
      "Like hiring a contractor to compute taxes. They return the computed tax total (value V) or report an error if files are missing.",
    since: "Java 1.5",
    methods: [
      {
        name: "call",
        signature: "V call() throws Exception",
        desc: "Computes a result or throws an exception if unable to do so.",
      },
    ],
    codeExample: `Callable<String> fetchTask = () => httpClient.get("https://api.com/data");
Future<String> future = executor.submit(fetchTask);`,
    bestPractices: [
      "Use Callable with Future or CompletableFuture when async tasks need return values or exception handling.",
    ],
  },

  Comparator: {
    name: "Comparator<T>",
    category: "Interface",
    package: "java.util.Scanner",
    signature: "@FunctionalInterface public interface Comparator<T>",
    summary: "A comparison function which imposes a total ordering on a collection of objects.",
    feynman: "Like a judge ranking contestants by height, age, or score.",
    since: "Java 1.2",
    methods: [
      {
        name: "compare",
        signature: "int compare(T o1, T o2)",
        desc: "Compares its two arguments for order. Returns negative, zero, or positive integer.",
      },
      {
        name: "comparing",
        signature:
          "static <T, U extends Comparable<? super U>> Comparator<T> comparing(Function<? super T, ? extends U> keyExtractor)",
        desc: "Accepts a key extraction function and returns a Comparator.",
      },
    ],
    codeExample: `List<User> users = getUsers();
users.sort(Comparator.comparing(User::getAge).reversed());`,
    bestPractices: ["Use Comparator.comparing() factory methods for clean lambda ordering."],
  },

  "@FunctionalInterface": {
    name: "@FunctionalInterface",
    category: "Annotation",
    package: "java.lang",
    signature:
      "@Documented @Retention(RUNTIME) @Target(TYPE) public @interface FunctionalInterface",
    summary:
      "An informative annotation type used to indicate that an interface declaration is intended to be a functional interface with exactly ONE abstract method.",
    feynman:
      "A mandatory stamp of approval ensuring no developer accidentally adds a second abstract method to the interface.",
    since: "Java 8",
    methods: [],
    codeExample: `@FunctionalInterface
public interface Calculator {
    int compute(int a, int b);
}`,
    bestPractices: [
      "Always annotate functional interfaces with @FunctionalInterface so compiler enforces the single-abstract-method rule.",
    ],
  },

  volatile: {
    name: "volatile",
    category: "Keyword text",
    signature: "private volatile boolean flag = true;",
    summary:
      "Ensures thread visibility by forcing variable reads/writes directly from/to main memory instead of CPU registers/caches.",
    feynman:
      "Think of a shared whiteboard in an office. When one worker writes a note, everyone instantly sees it on the wall instead of reading their private notepad.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className ServerWorker implements Runnable {
    private volatile boolean running = true;

    public void stop() { running = false; }
    public void run() { while (running) { doWork(); } }
}`,
    bestPractices: [
      "Use volatile for status flags read by multiple threads.",
      "Do NOT use volatile for compound operations like count++ (use AtomicInteger or synchronized instead).",
    ],
  },

  transient: {
    name: "transient",
    category: "Keyword text",
    signature: "private transient String userPassword;",
    summary:
      "Prevents a field from being serialized into byte stream during Java Object Serialization.",
    feynman:
      "A confidentiality stamp saying: 'Do not save or write this sensitive secret field to disk when archiving this object'.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className UserAccount implements Serializable {
    private String username;
    private transient String passwordHash; // Will be null after deserialization
}`,
    bestPractices: ["Mark passwords, secret keys, or transient cache fields as transient."],
  },

  synchronized: {
    name: "synchronized",
    category: "Keyword text",
    signature: "public synchronized void updateBalance(double amount)",
    summary:
      "Acquires an intrinsic lock (monitor) on a block or method to prevent race conditions and enforce mutual exclusion.",
    feynman:
      "Think of a single-occupancy bathroom lock. Only one thread gets the key (lock) at a time; others queue outside.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public synchronized void deposit(double amount) {
    this.balance += amount;
}`,
    bestPractices: [
      "Keep synchronized blocks as small as possible to prevent thread bottlenecking.",
      "Prefer java.util.concurrent locks (ReentrantLock) for complex concurrency.",
    ],
  },

  final: {
    name: "final",
    category: "Keyword text",
    signature: "public final className ImmutableConfig",
    summary:
      "Declares unmodifiable variables (constants), non-overridable methods, or non-extendable classes.",
    feynman: "A permanent padlock. Once assigned, you can never change or reassign it.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public final className SecurityUtils {
    public static final int MAX_ATTEMPTS = 3;
}`,
    bestPractices: ["Prefer final fields to create thread-safe immutable data classes."],
  },

  static: {
    name: "static",
    category: "Keyword text",
    signature: "public static void main(String[] args)",
    summary:
      "Declares class-level variables or methods that exist independently of any class instances.",
    feynman:
      "A blueprint property shared across all manufactured cars (like the company logo), rather than individual car color.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className MathUtils {
    public static double square(double n) { return n * n; }
}`,
    bestPractices: ["Use static for utility helper functions and immutable shared constants."],
  },

  var: {
    name: "var",
    category: "Keyword text",
    signature: "var list = new ArrayList<String>();",
    summary:
      "Local variable type inference keyword introduced in Java 10 allowing compiler to infer type from initializer.",
    feynman:
      "Telling the compiler: 'You know what type this new object is, so I don't need to type the long class name twice'.",
    since: "Java 10",
    methods: [],
    codeExample: `var userMap = new HashMap<String, List<Order>>();
for (var entry : userMap.entrySet()) {
    System.out.println(entry.getKey());
}`,
    bestPractices: [
      "Use var when variable type is obvious from right-hand initializer.",
      "Do NOT use var when type is ambiguous or reduces code clarity.",
    ],
  },

  Stream: {
    name: "Stream<T>",
    category: "Interface",
    package: "java.util.stream",
    signature: "public interface Stream<T> extends BaseStream<T, Stream<T>>",
    summary: "A sequence of elements supporting sequential and parallel aggregate operations.",
    feynman:
      "A high-speed factory conveyor belt. Items pass through filters, transformers, and sorters until packed into a box.",
    since: "Java 8",
    methods: [
      {
        name: "filter",
        signature: "Stream<T> filter(Predicate<? super T> predicate)",
        desc: "Returns a stream consisting of the elements that match the predicate.",
      },
      {
        name: "map",
        signature: "<R> Stream<R> map(Function<? super T, ? extends R> mapper)",
        desc: "Returns a stream consisting of the results of applying the given function to the elements.",
      },
      {
        name: "collect",
        signature: "<R, A> R collect(Collector<? super T, A, R> collector)",
        desc: "Performs a mutable reduction operation on elements of stream.",
      },
    ],
    codeExample: `List<String> names = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .sorted()
    .toList();`,
    bestPractices: [
      "Streams are single-use; consume with a terminal operation like collect() or toList().",
    ],
  },

  Optional: {
    name: "Optional<T>",
    category: "Class",
    package: "java.util",
    signature: "public final className Optional<T>",
    summary:
      "A container object which may or may not contain a non-null value. Helps avoid NullPointerException.",
    feynman:
      "A gift box that might contain a present or be empty. You inspect the box before opening to avoid surprises.",
    since: "Java 8",
    methods: [
      {
        name: "ofNullable",
        signature: "static <T> Optional<T> ofNullable(T value)",
        desc: "Returns an Optional describing the given value if non-null, else empty.",
      },
      {
        name: "orElseGet",
        signature: "static T orElseGet(Supplier<? extends T> supplier)",
        desc: "Returns value if present, else invokes supplier.",
      },
      {
        name: "map",
        signature: "<U> Optional<U> map(Function<? super T, ? extends U> mapper)",
        desc: "If value is present, returns an Optional describing the result of applying mapper.",
      },
    ],
    codeExample: `Optional<User> user = userRepository.findById(userId);
String name = user.map(User::getName).orElse("Guest");`,
    bestPractices: [
      "Never use Optional.get() without isPresent() check. Prefer .map() or .orElseGet().",
      "Do NOT use Optional as method parameters or class fields.",
    ],
  },
};

export function lookupJavadoc(word: string): JavadocEntry {
  const clean = word
    .trim()
    .replace(/^[@()]+/g, "")
    .replace(/[<>()[\];,]+/g, "");

  // Check exact lookup
  if (JAVADOC_REGISTRY[clean]) return JAVADOC_REGISTRY[clean];
  if (JAVADOC_REGISTRY[word.trim()]) return JAVADOC_REGISTRY[word.trim()];

  // Check case-insensitive lookup
  const matchKey = Object.keys(JAVADOC_REGISTRY).find(
    (k) => k.toLowerCase() === clean.toLowerCase() || k.toLowerCase() === word.trim().toLowerCase(),
  );
  if (matchKey && JAVADOC_REGISTRY[matchKey]) {
    return JAVADOC_REGISTRY[matchKey];
  }

  // Dynamic fallback for any technical keyword/word
  const formattedName = clean.length > 0 ? clean : word;
  return {
    name: formattedName,
    category: "Concept",
    package: "java.lang / Java Specification",
    signature: `public concept ${formattedName}`,
    summary: `Technical specification and standard runtime mechanics for ${formattedName}.`,
    feynman: `Core backend component and language mechanism powering ${formattedName} in production architecture.`,
    since: "JDK 1.0+",
    methods: [
      {
        name: "execute",
        signature: `void ${formattedName.toLowerCase()}Process()`,
        desc: `Internal execution handling for ${formattedName}.`,
      },
    ],
    codeExample: `/**
 * Javadoc documentation for ${formattedName}.
 * @param input Target payload for ${formattedName}.
 * @return Processed output.
 */
public Output process${formattedName.replace(/[^a-zA-Z0-9]/g, "")}(Input input) {
    // Enterprise pipeline implementation
    return new Output(input);
}`,
    bestPractices: [
      `Adhere to Java Code Conventions when utilizing ${formattedName}.`,
      `Ensure thread-safety and proper exception handling when interacting with ${formattedName}.`,
    ],
  };
}
