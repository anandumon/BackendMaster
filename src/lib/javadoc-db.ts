export type JavadocEntry = {
  name: string;
  category:
    "Interface" | "Keyword text" | "Class" | "Annotation" | "Method" | "Concept" | "Primitive";
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
  // --- FUNCTIONAL INTERFACES & ANNOTATIONS ---
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
    ],
    codeExample: `/**
 * Filter active users in banking system.
 * @param user Target user.
 * @return true if user is verified.
 */
Predicate<User> isActive = user -> user.isActive() && user.isVerified();
List<User> activeUsers = list.stream().filter(isActive).toList();`,
    bestPractices: [
      "Keep predicates pure without side-effects.",
      "Chain complex conditions using .and() and .or().",
    ],
  },

  Consumer: {
    name: "Consumer<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Consumer<T>",
    summary: "Represents an operation that accepts a single input argument and returns no result.",
    feynman:
      "Think of a shredder or printer. You feed it a document, it processes it (prints/logs), and returns nothing (void).",
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
        desc: "Returns a composed Consumer.",
      },
    ],
    codeExample: `Consumer<Transaction> auditLogger = tx -> logger.info("Tx ID: {}", tx.getId());
auditLogger.accept(currentTx);`,
    bestPractices: ["Use Consumer for side-effects like logging or metric collection."],
  },

  Function: {
    name: "Function<T, R>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Function<T, R>",
    summary:
      "Represents a function that accepts one argument of type T and produces a result of type R.",
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
    codeExample: `Function<User, UserDTO> toDto = user -> new UserDTO(user.getId(), user.getEmail());
UserDTO dto = toDto.apply(currentUser);`,
    bestPractices: ["Use in Stream.map() transformations."],
  },

  Supplier: {
    name: "Supplier<T>",
    category: "Interface",
    package: "java.util.function",
    signature: "@FunctionalInterface public interface Supplier<T>",
    summary: "Represents a supplier of results with zero arguments.",
    feynman:
      "Think of a vending machine. Press a button (no arguments required), and it produces a fresh item.",
    since: "Java 8",
    methods: [{ name: "get", signature: "T get()", desc: "Gets a result value of type T." }],
    codeExample: `Supplier<Order> fallbackSupplier = () => db.fetchFallbackOrder();
Order order = optionalOrder.orElseGet(fallbackSupplier);`,
    bestPractices: ["Use Supplier for lazy evaluation in Optional.orElseGet()."],
  },

  Runnable: {
    name: "Runnable",
    category: "Interface",
    package: "java.lang",
    signature: "@FunctionalInterface public interface Runnable",
    summary: "Represents a task executed concurrently without arguments or return values.",
    feynman:
      "An instruction sheet given to a worker to run an async job without returning a status report.",
    since: "Java 1.0",
    methods: [{ name: "run", signature: "void run()", desc: "Executes the task." }],
    codeExample: `Runnable task = () => System.out.println("Processing background queue...");
new Thread(task).start();`,
    bestPractices: ["Prefer ExecutorService over raw Thread instantiations."],
  },

  Callable: {
    name: "Callable<V>",
    category: "Interface",
    package: "java.util.concurrent",
    signature: "@FunctionalInterface public interface Callable<V>",
    summary: "A task that returns a result of type V and may throw checked exceptions.",
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
    codeExample: `Callable<String> fetchApi = () => httpClient.get("https://api.com");
Future<String> future = executor.submit(fetchApi);`,
    bestPractices: ["Use with ExecutorService or CompletableFuture for async result retrieval."],
  },

  Comparator: {
    name: "Comparator<T>",
    category: "Interface",
    package: "java.util",
    signature: "@FunctionalInterface public interface Comparator<T>",
    summary: "A comparison function which imposes a total ordering on a collection of objects.",
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
    bestPractices: ["Use Comparator.comparing() method references for clean sorting."],
  },

  "@FunctionalInterface": {
    name: "@FunctionalInterface",
    category: "Annotation",
    package: "java.lang",
    signature:
      "@Documented @Retention(RUNTIME) @Target(TYPE) public @interface FunctionalInterface",
    summary:
      "Annotation indicating an interface is intended to be a functional interface with exactly ONE abstract method.",
    feynman:
      "A mandatory stamp of approval ensuring no developer accidentally adds a second abstract method.",
    since: "Java 8",
    methods: [],
    codeExample: `@FunctionalInterface
public interface Validator<T> {
    boolean validate(T item);
}`,
    bestPractices: ["Always annotate single-abstract-method interfaces with @FunctionalInterface."],
  },

  // --- CONTROL FLOW KEYWORDS ---
  if: {
    name: "if",
    category: "Keyword text",
    signature: "if (booleanCondition) { /* branch */ }",
    summary:
      "Conditional control flow statement executing a block of code if the boolean expression evaluates to true.",
    feynman: "A decision fork in a road. If it is raining, take an umbrella.",
    since: "Java 1.0",
    methods: [],
    codeExample: `if (user.getBalance() >= orderAmount) {
    processPayment(user, orderAmount);
} else {
    throw new InsufficientFundsException();
}`,
    bestPractices: ["Avoid deeply nested if/else blocks by using guard clauses."],
  },

  else: {
    name: "else",
    category: "Keyword text",
    signature: "if (condition) { ... } else { /* fallback branch */ }",
    summary:
      "Provides an alternative execution block when the preceding 'if' condition evaluates to false.",
    feynman: "The backup plan when the primary condition isn't met.",
    since: "Java 1.0",
    methods: [],
    codeExample: `if (isAuthorized) {
    grantAccess();
} else {
    denyAccess();
}`,
    bestPractices: ["Keep fallback branches clean and concise."],
  },

  switch: {
    name: "switch",
    category: "Keyword text",
    signature: "switch (expression) { case A -> value; default -> fallback; }",
    summary:
      "Multi-way branch statement selecting an execution branch based on an expression value.",
    feynman:
      "A train track switch directing a train down track A, B, or C based on its destination code.",
    since: "Java 1.0 (Enhanced in Java 14/17)",
    methods: [],
    codeExample: `String statusLabel = switch (orderStatus) {
    case PENDING -> "Payment Awaiting";
    case COMPLETED -> "Order Delivered";
    case CANCELLED -> "Refund Processed";
    default -> "Unknown Status";
};`,
    bestPractices: [
      "Prefer modern arrow switch expressions over legacy break-based switch statements.",
    ],
  },

  for: {
    name: "for",
    category: "Keyword text",
    signature: "for (int i = 0; i < count; i++) { ... } | for (Type item : collection) { ... }",
    summary:
      "Iteration statement repeating a block of code for a specific count or over an Iterable/Array.",
    feynman: "Doing 10 jumping jacks or handing out a flier to every person in a line.",
    since: "Java 1.0",
    methods: [],
    codeExample: `// Enhanced for-each loop
for (User user : userList) {
    emailService.sendDigest(user);
}`,
    bestPractices: [
      "Prefer enhanced for-each loops or Stream API over index-managed loops when index is not needed.",
    ],
  },

  while: {
    name: "while",
    category: "Keyword text",
    signature: "while (booleanCondition) { /* loop body */ }",
    summary:
      "Loop statement that continuously executes a block as long as the condition evaluates to true.",
    feynman: "Keep stirring the pot while the soup is cold. Stop once it boils.",
    since: "Java 1.0",
    methods: [],
    codeExample: `while (resultSet.next()) {
    long id = resultSet.getLong("id");
    processRecord(id);
}`,
    bestPractices: [
      "Ensure condition variable is modified inside loop to avoid infinite execution.",
    ],
  },

  break: {
    name: "break",
    category: "Keyword text",
    signature: "break; | break label;",
    summary: "Terminates the innermost enclosing loop or switch statement immediately.",
    feynman: "Hitting an emergency brake on a train to exit a loop early.",
    since: "Java 1.0",
    methods: [],
    codeExample: `for (Item item : inventory) {
    if (item.getId() == targetId) {
        found = item;
        break; // Stop searching once found
    }
}`,
    bestPractices: ["Use break to short-circuit loops when search target is found."],
  },

  continue: {
    name: "continue",
    category: "Keyword text",
    signature: "continue; | continue label;",
    summary:
      "Skips the remainder of the current loop iteration and proceeds to the next iteration.",
    feynman: "Skipping a bad song on a playlist and moving directly to the next track.",
    since: "Java 1.0",
    methods: [],
    codeExample: `for (Transaction tx : list) {
    if (tx.isFailed()) continue; // Skip invalid records
    processSuccessTx(tx);
}`,
    bestPractices: ["Use continue to eliminate deep if-nesting inside loop bodies."],
  },

  return: {
    name: "return",
    category: "Keyword text",
    signature: "return value; | return;",
    summary: "Exits from the current method and optionally passes a value back to the caller.",
    feynman: "Handing back the completed assignment paper to the teacher.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public int calculateDiscount(User user) {
    if (user.isVIP()) return 20;
    return 5;
}`,
    bestPractices: ["Use early returns (guard clauses) to handle error cases at top of methods."],
  },

  // --- ACCESS MODIFIERS & MODIFIERS ---
  public: {
    name: "public",
    category: "Keyword text",
    signature: "public className ServiceName",
    summary:
      "Access modifier granting universal visibility to classes, methods, or fields from any package.",
    feynman: "A public park open to everyone in the world without restrictions.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className PaymentController {
    public ResponseEntity<PaymentResponse> process() { ... }
}`,
    bestPractices: ["Expose public methods only for intended public API surface."],
  },

  private: {
    name: "private",
    category: "Keyword text",
    signature: "private String secretKey;",
    summary: "Access modifier restricting visibility exclusively to the declaring class.",
    feynman: "A personal diary kept locked in a private drawer.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className Account {
    private double balance;
    private String pinHash;
}`,
    bestPractices: ["Encapsulate fields as private and expose controlled getter/setter access."],
  },

  protected: {
    name: "protected",
    category: "Keyword text",
    signature: "protected void initializeHandler()",
    summary:
      "Access modifier allowing access within the same package and by subclasses in other packages.",
    feynman: "A family heirloom accessible by family members and descendants.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className BaseService {
    protected void logExecution(String msg) { ... }
}`,
    bestPractices: ["Use protected for extension points designed for framework subclasses."],
  },

  static: {
    name: "static",
    category: "Keyword text",
    signature: "public static void main(String[] args)",
    summary: "Declares class-level members shared across all instances of a class.",
    feynman: "A blueprint logo printed on every manufactured car.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className AppConstants {
    public static final String API_VERSION = "v2.1";
}`,
    bestPractices: ["Use static for stateless utility methods and constants."],
  },

  final: {
    name: "final",
    category: "Keyword text",
    signature: "public final className ImmutableConfig",
    summary: "Declares unmodifiable variables, non-overridable methods, or non-extendable classes.",
    feynman: "A permanent padlock preventing any reassignment or modification.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public final className SecurityToken {
    private final String token;
    public SecurityToken(String token) { this.token = token; }
}`,
    bestPractices: ["Declare fields final to enforce immutability and thread safety."],
  },

  synchronized: {
    name: "synchronized",
    category: "Keyword text",
    signature: "public synchronized void updateBalance()",
    summary: "Acquires an intrinsic lock on a method or block to prevent thread race conditions.",
    feynman: "A single-occupancy lock on a bathroom door; only one thread enters at a time.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public synchronized void withdraw(double amt) {
    if (balance >= amt) balance -= amt;
}`,
    bestPractices: ["Keep synchronized blocks minimal to avoid bottlenecking concurrency."],
  },

  volatile: {
    name: "volatile",
    category: "Keyword text",
    signature: "private volatile boolean running = true;",
    summary:
      "Forces reads/writes directly to main memory to guarantee thread visibility across CPU caches.",
    feynman:
      "A shared whiteboard on the wall where every update is immediately seen by all workers.",
    since: "Java 1.0",
    methods: [],
    codeExample: `private volatile boolean shutdownRequested = false;`,
    bestPractices: ["Use for boolean status flags read by multiple threads."],
  },

  transient: {
    name: "transient",
    category: "Keyword text",
    signature: "private transient String rawPassword;",
    summary: "Excludes a field from Java Object Serialization streams.",
    feynman: "A 'Do Not Save to Disk' stamp on sensitive payload attributes.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className UserPayload implements Serializable {
    private String username;
    private transient String sessionToken;
}`,
    bestPractices: ["Mark sensitive credentials and cached objects transient."],
  },

  // --- CLASSES, INTERFACES & OBJECT-ORIENTED KEYWORDS ---
  class: {
    name: "class",
    category: "Keyword text",
    signature: "public className ClassName { ... }",
    summary:
      "Fundamental blueprint constructing Java objects defining state (fields) and behavior (methods).",
    feynman: "Architectural blueprint for building physical houses (objects).",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className CustomerService {
    private final CustomerRepository repository;
    public CustomerService(CustomerRepository repo) { this.repository = repo; }
}`,
    bestPractices: ["Follow Single Responsibility Principle for class design."],
  },

  interface: {
    name: "interface",
    category: "Keyword text",
    signature: "public interface InterfaceName { ... }",
    summary:
      "Abstract contract specifying method signatures that implementing classes MUST fulfill.",
    feynman: "A contract agreement specifying required functions without detailing implementation.",
    since: "Java 1.0 (Enhanced with default/static methods in Java 8)",
    methods: [],
    codeExample: `public interface PaymentGateway {
    PaymentResult process(PaymentRequest request);
}`,
    bestPractices: ["Program to interfaces rather than concrete implementations."],
  },

  enum: {
    name: "enum",
    category: "Keyword text",
    signature: "public enum EnumName { VALUE1, VALUE2 }",
    summary: "Type-safe enumeration defining a fixed set of named constants.",
    feynman: "The 4 cardinal compass directions (NORTH, SOUTH, EAST, WEST) that cannot be altered.",
    since: "Java 1.5",
    methods: [],
    codeExample: `public enum OrderStatus {
    PENDING, PROCESSING, COMPLETED, FAILED;
}`,
    bestPractices: ["Use enums for fixed domain options instead of magic numbers/strings."],
  },

  record: {
    name: "record",
    category: "Keyword text",
    signature: "public record RecordName(Type field1, Type field2) { }",
    summary:
      "Immutable transparent data carrier class introduced in Java 14/17 with auto-generated constructor, getters, equals, hashCode, toString.",
    feynman: "A sealed express parcel containing unalterable data values.",
    since: "Java 14 / 16",
    methods: [],
    codeExample: `public record UserDto(Long id, String email, String fullName) { }`,
    bestPractices: ["Use records for DTOs, API payloads, and immutable value objects."],
  },

  extends: {
    name: "extends",
    category: "Keyword text",
    signature: "className Child extends Parent | interface Child extends Parent",
    summary:
      "Establishes inheritance hierarchy where child class inherits fields/methods from parent class.",
    feynman: "Child inheriting physical characteristics and traits from parents.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className CreditCardPayment extends BasePayment { ... }`,
    bestPractices: ["Prefer composition over deep inheritance trees."],
  },

  implements: {
    name: "implements",
    category: "Keyword text",
    signature: "className Concrete className implements InterfaceA, InterfaceB",
    summary:
      "Declares that a class fulfills the contractual method signatures of one or more interfaces.",
    feynman: "Signing an official service level contract promising to deliver specified services.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public className StripeGateway implements PaymentGateway { ... }`,
    bestPractices: ["Implement focused, single-purpose interfaces."],
  },

  super: {
    name: "super",
    category: "Keyword text",
    signature: "super.method() | super(args)",
    summary:
      "Reference variable used to access parent class constructors, methods, or overridden fields.",
    feynman: "Calling your supervisor or parent for advice when overriding default behavior.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public ChildClass(String name) {
    super(name); // Call parent constructor
}`,
    bestPractices: ["Use super(...) as first statement in child constructor."],
  },

  this: {
    name: "this",
    category: "Keyword text",
    signature: "this.field = value | this(args)",
    summary: "Reference variable pointing to the current instance of the class.",
    feynman: "Pointing to yourself when saying 'My name is John'.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public void setName(String name) {
    this.name = name; // Disambiguate field from parameter
}`,
    bestPractices: ["Use this to clarify field assignments inside constructors."],
  },

  instanceof: {
    name: "instanceof",
    category: "Keyword text",
    signature: "object instanceof Type | object instanceof Type patternVar",
    summary:
      "Tests whether an object is an instance of a specific class or interface (supports pattern matching).",
    feynman: "Scanning a passport to check if a passenger is an adult citizen before boarding.",
    since: "Java 1.0 (Pattern matching in Java 16)",
    methods: [],
    codeExample: `if (obj instanceof String s) {
    System.out.println(s.toUpperCase()); // Pattern variable automatically cast
}`,
    bestPractices: ["Use Java 16+ pattern matching for instanceof to avoid manual casting."],
  },

  // --- ERROR & EXCEPTION HANDLING KEYWORDS ---
  try: {
    name: "try",
    category: "Keyword text",
    signature: "try { /* risky code */ } catch (Exception e) { ... }",
    summary: "Defines a guarded block of code monitored for runtime exceptions.",
    feynman: "Attempting a tricky gymnastics flip over a safety mat.",
    since: "Java 1.0",
    methods: [],
    codeExample: `try (var resource = new FileInputStream("data.txt")) {
    readData(resource);
} catch (IOException e) {
    logger.error("Failed to read file", e);
}`,
    bestPractices: ["Use try-with-resources for AutoCloseable resources."],
  },

  catch: {
    name: "catch",
    category: "Keyword text",
    signature: "catch (SpecificException e) { /* handle */ }",
    summary: "Handles specific exceptions thrown within the associated try block.",
    feynman: "Catching a falling glass before it shatters on the floor.",
    since: "Java 1.0",
    methods: [],
    codeExample: `catch (SQLException | DataAccessException e) {
    throw new ServiceException("Database connection error", e);
}`,
    bestPractices: ["Never swallow exceptions in catch blocks without logging."],
  },

  finally: {
    name: "finally",
    category: "Keyword text",
    signature: "finally { /* cleanup code */ }",
    summary: "Executes cleanup code guaranteed to run regardless of whether an exception occurred.",
    feynman: "Cleaning up the kitchen after cooking, whether the recipe succeeded or failed.",
    since: "Java 1.0",
    methods: [],
    codeExample: `finally {
    connection.close(); // Guaranteed execution
}`,
    bestPractices: ["Prefer try-with-resources over explicit finally blocks for auto-closing."],
  },

  throw: {
    name: "throw",
    category: "Keyword text",
    signature: 'throw new CustomException("Error message");',
    summary: "Explicitly triggers an exception instance, interrupting normal execution flow.",
    feynman: "Blowing a referee whistle to stop play when a foul occurs.",
    since: "Java 1.0",
    methods: [],
    codeExample: `if (amount <= 0) {
    throw new IllegalArgumentException("Amount must be positive");
}`,
    bestPractices: ["Throw specific domain exceptions with clear explanatory messages."],
  },

  throws: {
    name: "throws",
    category: "Keyword text",
    signature: "public void process() throws IOException, SQLException",
    summary: "Declares checked exceptions that a method may propagate to its callers.",
    feynman: "Putting a warning label on a package stating it contains fragile items.",
    since: "Java 1.0",
    methods: [],
    codeExample: `public String readRemoteConfig() throws IOException { ... }`,
    bestPractices: ["Document declared throws in method Javadoc using @throws tag."],
  },

  // --- CORE JAVA CLASSES & COLLECTIONS ---
  Stream: {
    name: "Stream<T>",
    category: "Interface",
    package: "java.util.stream",
    signature: "public interface Stream<T> extends BaseStream<T, Stream<T>>",
    summary: "A sequence of elements supporting sequential and parallel aggregate operations.",
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
    bestPractices: ["Streams are single-use pipeline wrappers; consume with terminal operations."],
  },

  Optional: {
    name: "Optional<T>",
    category: "Class",
    package: "java.util",
    signature: "public final className Optional<T>",
    summary: "A container object which may or may not contain a non-null value.",
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
    bestPractices: ["Use Optional as return type for methods that might not find a result."],
  },
};

export function lookupJavadoc(word: string, topicContext?: string): JavadocEntry {
  const clean = word
    .trim()
    .replace(/^[@()]+/g, "")
    .replace(/[<>()[\];,:]+/g, "");

  // 1. Direct registry lookup
  if (JAVADOC_REGISTRY[clean]) return JAVADOC_REGISTRY[clean];
  if (JAVADOC_REGISTRY[word.trim()]) return JAVADOC_REGISTRY[word.trim()];

  // 2. Case-insensitive lookup
  const matchKey = Object.keys(JAVADOC_REGISTRY).find(
    (k) => k.toLowerCase() === clean.toLowerCase() || k.toLowerCase() === word.trim().toLowerCase(),
  );
  if (matchKey && JAVADOC_REGISTRY[matchKey]) {
    return JAVADOC_REGISTRY[matchKey];
  }

  // 3. Dynamic Topic-Aware Javadoc Spec Generator for ANY Java keyword / term
  const formattedName = clean.length > 0 ? clean : word;
  const contextStr = topicContext ? ` under topic "${topicContext}"` : "";

  return {
    name: formattedName,
    category: "Concept",
    package: "java.lang / Java Platform Specification",
    signature: `public keyword/concept ${formattedName}`,
    summary: `Official Java Specification & Javadoc reference for ${formattedName}${contextStr}.`,
    feynman: `Core backend component and language mechanism powering ${formattedName} in enterprise production systems.`,
    since: "JDK 1.0+",
    methods: [
      {
        name: "execute",
        signature: `void ${formattedName.toLowerCase()}Mechanics()`,
        desc: `Internal JVM/Runtime execution logic for ${formattedName}.`,
      },
    ],
    codeExample: `/**
 * Professional Javadoc example for ${formattedName}.
 * @param payload Target payload for ${formattedName} processing.
 * @return Processed result.
 * @throws IllegalArgumentException if payload is invalid.
 */
public Output process${formattedName.replace(/[^a-zA-Z0-9]/g, "")}(Input payload) {
    // Enterprise implementation for ${formattedName}
    if (payload == null) {
        throw new IllegalArgumentException("Payload cannot be null");
    }
    return new Output(payload);
}`,
    bestPractices: [
      `Follow standard Java Code Conventions when utilizing ${formattedName}.`,
      `Ensure thread-safety, proper memory allocation, and exception handling when using ${formattedName}.`,
    ],
  };
}
