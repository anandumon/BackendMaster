// Comprehensive backend developer curriculum derived from roadmap.sh
// Every leaf becomes a lesson with a dedicated route.

export type Topic = {
  slug: string;
  title: string;
  summary: string;
};

export type Section = {
  slug: string;
  title: string;
  topics: Topic[];
};

export type Domain = {
  slug: string;
  title: string;
  icon: string;
  tagline: string;
  color: string;
  sections: Section[];
};

const t = (slug: string, title: string, summary: string): Topic => ({ slug, title, summary });

export const DOMAINS: Domain[] = [
  {
    slug: "java",
    title: "Java",
    icon: "☕",
    color: "oklch(0.7 0.18 40)",
    tagline: "Language, JVM, memory model, concurrency, and modern Java.",
    sections: [
      {
        slug: "fundamentals",
        title: "Fundamentals",
        topics: [
          t("java-history", "History of Java", "Origins, versions, and evolution of Java."),
          t("jvm-jre-jdk", "JVM vs JRE vs JDK", "Runtime, environment, and dev kit differences."),
          t("java-compilation", "Compilation & Bytecode", "javac, .class files, and portability."),
          t("classloader", "ClassLoader Subsystem", "Bootstrap, extension, application loaders."),
          t("primitive-types", "Primitive Data Types", "byte, short, int, long, float, double, char, boolean."),
          t("wrapper-classes", "Wrapper Classes & Autoboxing", "Boxing, unboxing, caching."),
          t("operators", "Operators & Precedence", "Arithmetic, bitwise, logical, ternary."),
          t("control-flow", "Control Flow", "if/else, switch, loops, break, continue."),
          t("arrays", "Arrays", "1D, 2D, jagged arrays; memory layout."),
          t("strings", "Strings & String Pool", "Immutability, intern pool, StringBuilder vs StringBuffer."),
          t("varargs", "Varargs", "Variable arguments and method resolution."),
          t("enums", "Enums", "Type-safe constants, methods on enums."),
          t("java-io", "Java I/O", "Streams, readers/writers, NIO basics."),
          t("scanner-bufferedreader", "Scanner vs BufferedReader", "Console input performance."),
        ],
      },
      {
        slug: "oop",
        title: "Object-Oriented Programming",
        topics: [
          t("classes-objects", "Classes & Objects", "Blueprints, instances, references."),
          t("constructors", "Constructors", "Default, parameterized, chaining, copy."),
          t("this-super", "this & super", "Instance & parent references."),
          t("inheritance", "Inheritance", "extends, IS-A, method overriding."),
          t("polymorphism", "Polymorphism", "Compile-time vs runtime polymorphism."),
          t("encapsulation", "Encapsulation", "Access modifiers, getters, setters."),
          t("abstraction", "Abstraction", "Abstract classes vs interfaces."),
          t("interfaces", "Interfaces & Default Methods", "Contracts, multiple inheritance of type."),
          t("static-final", "static & final", "Class members, immutability, constants."),
          t("inner-classes", "Inner Classes", "Static nested, inner, local, anonymous."),
          t("object-class", "The Object Class", "equals, hashCode, toString, clone."),
          t("record-classes", "Records", "Immutable data carriers (Java 14+)."),
          t("sealed-classes", "Sealed Classes", "Restricted class hierarchies (Java 17)."),
        ],
      },
      {
        slug: "collections",
        title: "Collections & Generics",
        topics: [
          t("collections-hierarchy", "Collections Framework", "Overview of List, Set, Map, Queue."),
          t("arraylist-vs-linkedlist", "ArrayList vs LinkedList", "Backing arrays vs nodes, complexity."),
          t("hashmap-internals", "HashMap Internals", "Buckets, hashing, treeify, resize."),
          t("hashset-linkedhashset-treeset", "HashSet, LinkedHashSet, TreeSet", "Uniqueness & ordering."),
          t("concurrent-collections", "Concurrent Collections", "ConcurrentHashMap, CopyOnWriteArrayList."),
          t("iterators", "Iterators & fail-fast", "ConcurrentModificationException."),
          t("comparable-comparator", "Comparable vs Comparator", "Sorting rules & lambdas."),
          t("generics-basics", "Generics", "Parametric polymorphism in Java."),
          t("bounded-wildcards", "Bounded Wildcards", "? extends T, ? super T, PECS."),
          t("type-erasure", "Type Erasure", "Reification limits at runtime."),
        ],
      },
      {
        slug: "jvm",
        title: "JVM Internals",
        topics: [
          t("jvm-architecture", "JVM Architecture", "ClassLoader, runtime data areas, execution engine."),
          t("memory-areas", "Memory Areas", "Heap, stack, metaspace, PC register, native stack."),
          t("garbage-collection", "Garbage Collection", "Generational GC & phases."),
          t("gc-algorithms", "GC Algorithms", "Serial, Parallel, CMS, G1, ZGC, Shenandoah."),
          t("jit-compiler", "JIT Compiler", "C1, C2, tiered compilation, inlining."),
          t("escape-analysis", "Escape Analysis", "Stack allocation & scalar replacement."),
          t("classloading", "Class Loading", "Loading, linking, initialization."),
          t("jvm-tuning", "JVM Tuning", "Heap size, GC flags, ergonomics."),
          t("jvm-profiling", "Profiling & Monitoring", "jstat, jmap, jstack, VisualVM, JFR."),
        ],
      },
      {
        slug: "concurrency",
        title: "Concurrency & Multithreading",
        topics: [
          t("threads-basics", "Threads & Runnable", "Creating & running threads."),
          t("thread-lifecycle", "Thread Lifecycle", "NEW, RUNNABLE, BLOCKED, WAITING, TERMINATED."),
          t("synchronization", "Synchronization", "synchronized, intrinsic locks, monitors."),
          t("volatile-atomic", "volatile & Atomic Variables", "Memory visibility, CAS."),
          t("java-memory-model", "Java Memory Model", "Happens-before, reordering, safe publication."),
          t("locks-api", "Lock API", "ReentrantLock, ReadWriteLock, StampedLock."),
          t("executor-service", "Executor Framework", "ThreadPools, Callable, Future."),
          t("completable-future", "CompletableFuture", "Async pipelines and composition."),
          t("fork-join", "Fork/Join Framework", "Work-stealing pool."),
          t("virtual-threads", "Virtual Threads", "Project Loom & structured concurrency."),
          t("thread-safety-patterns", "Thread-Safety Patterns", "Immutability, confinement, delegation."),
        ],
      },
      {
        slug: "modern-java",
        title: "Modern Java (8–21)",
        topics: [
          t("lambdas", "Lambda Expressions", "Functional interfaces & syntax."),
          t("streams-api", "Streams API", "map, filter, reduce, collectors."),
          t("optional", "Optional", "Null-safe values and pitfalls."),
          t("method-references", "Method References", "Types & when to use."),
          t("date-time-api", "Date/Time API", "java.time, Instant, ZonedDateTime."),
          t("java-modules", "Java Modules", "Jigsaw, module descriptors."),
          t("switch-expressions", "Switch Expressions & Patterns", "Modern switch, pattern matching."),
          t("text-blocks", "Text Blocks", "Multiline strings."),
          t("var-keyword", "var Keyword", "Local variable type inference."),
        ],
      },
      {
        slug: "exceptions-testing",
        title: "Exceptions, Testing & Build",
        topics: [
          t("exception-hierarchy", "Exception Hierarchy", "Checked vs unchecked, Error vs Exception."),
          t("try-with-resources", "try-with-resources", "AutoCloseable & resource cleanup."),
          t("custom-exceptions", "Custom Exceptions", "When and how to design them."),
          t("junit5", "JUnit 5", "Assertions, lifecycle, parameterized tests."),
          t("mockito", "Mockito", "Mocks, spies, verification."),
          t("maven-gradle", "Maven & Gradle", "Build tools, dependency management."),
          t("logging-slf4j", "SLF4J & Logback", "Logging facades."),
        ],
      },
    ],
  },
  {
    slug: "spring-boot",
    title: "Spring Boot",
    icon: "🍃",
    color: "oklch(0.7 0.18 145)",
    tagline: "IoC, MVC, Data, Security, and production-ready services.",
    sections: [
      {
        slug: "core",
        title: "Spring Core",
        topics: [
          t("spring-overview", "Spring Framework Overview", "Modules and value proposition."),
          t("ioc-di", "IoC & Dependency Injection", "Inversion of control principle."),
          t("beans", "Beans & Lifecycle", "Definition, instantiation, destruction."),
          t("bean-scopes", "Bean Scopes", "singleton, prototype, request, session."),
          t("autowiring", "Autowiring", "byType, byName, constructor injection."),
          t("configuration-classes", "@Configuration & @Bean", "Java-based configuration."),
          t("component-scan", "Component Scanning", "@Component, @Service, @Repository, @Controller."),
          t("qualifier-primary", "@Qualifier & @Primary", "Resolving multiple candidates."),
          t("profiles", "Spring Profiles", "Environment-specific configuration."),
          t("spel", "Spring Expression Language", "#{...} in configuration."),
          t("events", "Application Events", "Publisher/listener pattern."),
        ],
      },
      {
        slug: "boot",
        title: "Spring Boot Basics",
        topics: [
          t("boot-intro", "Introduction to Spring Boot", "Opinionated defaults & starters."),
          t("auto-configuration", "Auto-Configuration", "@EnableAutoConfiguration internals."),
          t("starters", "Starter Dependencies", "spring-boot-starter-*."),
          t("application-properties", "application.properties/yml", "External configuration."),
          t("configuration-properties", "@ConfigurationProperties", "Type-safe config binding."),
          t("actuator", "Spring Boot Actuator", "Health, metrics, info endpoints."),
          t("devtools", "Spring Boot DevTools", "Hot reload during dev."),
          t("packaging", "Fat JAR & Executable JAR", "Boot's repackaging."),
        ],
      },
      {
        slug: "web",
        title: "Spring MVC & REST",
        topics: [
          t("dispatcher-servlet", "DispatcherServlet", "Front controller & handler mapping."),
          t("controllers", "@Controller & @RestController", "MVC vs REST controllers."),
          t("request-mapping", "@RequestMapping & HTTP verbs", "@GetMapping, @PostMapping, etc."),
          t("path-variables-request-params", "@PathVariable & @RequestParam", "Binding request data."),
          t("request-body-response-body", "@RequestBody & @ResponseBody", "JSON binding."),
          t("validation", "Bean Validation", "@Valid, Hibernate Validator, JSR-380."),
          t("exception-handling", "Exception Handling", "@ControllerAdvice, @ExceptionHandler."),
          t("content-negotiation", "Content Negotiation", "Accept headers & media types."),
          t("cors", "CORS Configuration", "Cross-origin requests in Spring."),
          t("interceptors", "HandlerInterceptors", "Pre/post request hooks."),
          t("filters", "Servlet Filters", "Cross-cutting request logic."),
          t("rest-template-webclient", "RestTemplate vs WebClient", "Sync vs reactive HTTP client."),
          t("openapi", "OpenAPI / Swagger", "Documenting REST APIs."),
        ],
      },
      {
        slug: "data",
        title: "Spring Data",
        topics: [
          t("jdbc-template", "JdbcTemplate", "Low-level SQL access."),
          t("jpa-basics", "JPA Basics", "Entities, EntityManager, persistence context."),
          t("spring-data-jpa", "Spring Data JPA", "Repositories and derived queries."),
          t("crud-repository", "CrudRepository / JpaRepository", "Interface hierarchy."),
          t("query-methods", "Derived Query Methods", "findByX naming rules."),
          t("jpql-native", "JPQL & Native Queries", "@Query annotation."),
          t("entity-relationships", "Entity Relationships", "@OneToMany, @ManyToOne, @ManyToMany."),
          t("fetch-strategies", "Fetch Types & N+1", "Lazy vs eager fetching."),
          t("transactions", "@Transactional", "Propagation, isolation, rollback."),
          t("pagination-sorting", "Pagination & Sorting", "Pageable, Sort."),
          t("auditing", "JPA Auditing", "@CreatedDate, @LastModifiedDate."),
          t("spring-data-mongo", "Spring Data MongoDB", "Document persistence in Spring."),
          t("spring-data-redis", "Spring Data Redis", "Cache & template abstractions."),
          t("flyway-liquibase", "Flyway & Liquibase", "Database migrations."),
        ],
      },
      {
        slug: "security",
        title: "Spring Security",
        topics: [
          t("security-arch", "Security Architecture", "Filter chain overview."),
          t("authentication", "Authentication", "UserDetailsService, providers."),
          t("authorization", "Authorization", "Roles, authorities, method security."),
          t("password-encoders", "Password Encoders", "BCrypt, Argon2."),
          t("jwt-auth", "JWT Authentication", "Stateless auth with tokens."),
          t("oauth2-client", "OAuth2 & OIDC", "Client & resource server."),
          t("csrf", "CSRF Protection", "When to enable/disable."),
          t("cors-security", "CORS in Spring Security", "Configuring cross-origin."),
        ],
      },
      {
        slug: "advanced-boot",
        title: "Advanced",
        topics: [
          t("aop", "Aspect-Oriented Programming", "Aspects, advice, pointcuts."),
          t("caching", "Spring Cache Abstraction", "@Cacheable, @CacheEvict."),
          t("scheduling", "@Scheduled Tasks", "Cron & fixed-rate jobs."),
          t("async", "@Async & Task Executors", "Asynchronous methods."),
          t("webflux", "Spring WebFlux", "Reactive programming with Reactor."),
          t("kafka-integration", "Spring for Kafka", "Producers, consumers, listeners."),
          t("rabbitmq-integration", "Spring AMQP / RabbitMQ", "Messaging integration."),
          t("testing-boot", "Testing Spring Boot Apps", "@SpringBootTest, MockMvc, Testcontainers."),
          t("micrometer", "Micrometer Metrics", "Observability & Prometheus."),
          t("boot-native", "Spring Boot Native", "GraalVM native images."),
        ],
      },
    ],
  },
  {
    slug: "backend",
    title: "Backend Foundations",
    icon: "🧩",
    color: "oklch(0.7 0.18 260)",
    tagline: "HTTP, APIs, auth, caching, scaling, and observability.",
    sections: [
      {
        slug: "internet",
        title: "Internet & Networking",
        topics: [
          t("how-internet-works", "How the Internet Works", "Packets, routers, DNS, ISPs."),
          t("dns", "DNS", "Zones, records, resolvers."),
          t("http", "HTTP/1.1, HTTP/2, HTTP/3", "Protocol evolution."),
          t("https-tls", "HTTPS & TLS", "Handshake, certificates, PKI."),
          t("tcp-udp", "TCP vs UDP", "Reliability vs speed."),
          t("websockets", "WebSockets", "Full-duplex real-time channels."),
          t("http-cookies", "Cookies", "Session, Secure, HttpOnly, SameSite."),
          t("cdn", "CDNs", "Edge caching & delivery networks."),
        ],
      },
      {
        slug: "apis",
        title: "APIs & Communication",
        topics: [
          t("rest", "REST APIs", "Resources, verbs, statelessness."),
          t("api-versioning", "API Versioning", "URI, header, media-type strategies."),
          t("hateoas", "HATEOAS", "Hypermedia-driven APIs."),
          t("graphql", "GraphQL", "Schemas, queries, resolvers."),
          t("grpc", "gRPC & Protocol Buffers", "High-performance RPC."),
          t("soap", "SOAP", "XML-based enterprise protocol."),
          t("webhooks", "Webhooks", "Event-driven callbacks."),
          t("openapi-spec", "OpenAPI Specification", "Machine-readable API docs."),
          t("api-security", "API Security", "OWASP API top 10."),
          t("rate-limiting", "Rate Limiting", "Token bucket, leaky bucket algorithms."),
          t("idempotency", "Idempotency", "Safe retries, idempotency keys."),
        ],
      },
      {
        slug: "auth",
        title: "Authentication & Authorization",
        topics: [
          t("sessions", "Cookie-Based Sessions", "Server-side session storage."),
          t("jwt", "JWT", "Structure, signing, verification."),
          t("oauth2", "OAuth 2.0", "Flows: code, client credentials, PKCE."),
          t("oidc", "OpenID Connect", "Identity layer over OAuth 2."),
          t("saml", "SAML", "Enterprise SSO."),
          t("mfa", "Multi-Factor Authentication", "TOTP, WebAuthn."),
          t("rbac-abac", "RBAC vs ABAC", "Access control models."),
          t("password-hashing", "Password Hashing", "bcrypt, Argon2, salts."),
        ],
      },
      {
        slug: "caching",
        title: "Caching & Performance",
        topics: [
          t("caching-strategies", "Caching Strategies", "Cache-aside, write-through, write-back."),
          t("http-caching", "HTTP Caching", "Cache-Control, ETag, Last-Modified."),
          t("application-caching", "Application Caching", "In-memory caches, LRU."),
          t("distributed-caching", "Distributed Caching", "Redis, Memcached."),
          t("cache-invalidation", "Cache Invalidation", "TTL, event-based, stampede."),
          t("performance-tuning", "Performance Tuning", "Profiling, hotspots, N+1."),
        ],
      },
      {
        slug: "messaging",
        title: "Messaging & Async",
        topics: [
          t("message-brokers", "Message Brokers", "Point-to-point vs pub/sub."),
          t("kafka", "Apache Kafka", "Topics, partitions, consumer groups."),
          t("rabbitmq", "RabbitMQ", "Exchanges, queues, bindings."),
          t("event-driven", "Event-Driven Architecture", "Events as first-class citizens."),
          t("saga-pattern", "Saga Pattern", "Distributed transactions."),
          t("outbox-pattern", "Outbox Pattern", "Reliable event publishing."),
          t("cqrs", "CQRS", "Command Query Responsibility Segregation."),
          t("event-sourcing", "Event Sourcing", "State as a log of events."),
        ],
      },
      {
        slug: "scalability",
        title: "Scalability & Reliability",
        topics: [
          t("horizontal-vertical", "Horizontal vs Vertical Scaling", "Scale out vs scale up."),
          t("load-balancing", "Load Balancing", "L4/L7, algorithms, sticky sessions."),
          t("cap-theorem", "CAP Theorem", "Consistency, availability, partition tolerance."),
          t("consistency-models", "Consistency Models", "Strong, eventual, causal."),
          t("database-scaling", "Database Scaling", "Replication, sharding, partitioning."),
          t("circuit-breaker", "Circuit Breaker", "Failure isolation pattern."),
          t("bulkhead", "Bulkhead Pattern", "Isolating resource pools."),
          t("retries-backoff", "Retries & Backoff", "Exponential backoff, jitter."),
          t("chaos-engineering", "Chaos Engineering", "Proactive resiliency testing."),
        ],
      },
      {
        slug: "observability",
        title: "Observability",
        topics: [
          t("logging", "Structured Logging", "JSON logs, correlation IDs."),
          t("metrics", "Metrics", "RED, USE, golden signals."),
          t("distributed-tracing", "Distributed Tracing", "OpenTelemetry, spans, context propagation."),
          t("prometheus-grafana", "Prometheus & Grafana", "Metrics scraping and dashboards."),
          t("elk-stack", "ELK / OpenSearch", "Log aggregation and search."),
          t("apm", "APM Tools", "New Relic, Datadog, Dynatrace."),
          t("slis-slos-slas", "SLIs, SLOs & SLAs", "Service level engineering."),
        ],
      },
    ],
  },
  {
    slug: "design-architecture",
    title: "Software Design & Architecture",
    icon: "🏛️",
    color: "oklch(0.7 0.18 300)",
    tagline: "Clean code, SOLID, patterns, and architectural styles.",
    sections: [
      {
        slug: "clean-code",
        title: "Clean Code & Principles",
        topics: [
          t("clean-code", "Clean Code", "Names, functions, comments."),
          t("solid", "SOLID Principles", "Overview and rationale."),
          t("srp", "Single Responsibility", "One reason to change."),
          t("ocp", "Open/Closed", "Open for extension, closed for modification."),
          t("lsp", "Liskov Substitution", "Substitutability of subtypes."),
          t("isp", "Interface Segregation", "Client-specific interfaces."),
          t("dip", "Dependency Inversion", "Depend on abstractions."),
          t("dry-kiss-yagni", "DRY, KISS, YAGNI", "Fundamental heuristics."),
          t("law-demeter", "Law of Demeter", "Talk only to friends."),
          t("coupling-cohesion", "Coupling & Cohesion", "Design quality metrics."),
        ],
      },
      {
        slug: "design-patterns",
        title: "Design Patterns",
        topics: [
          t("gof-overview", "Gang of Four Overview", "Creational, structural, behavioral."),
          t("singleton", "Singleton", "One-instance guarantee."),
          t("factory", "Factory Method", "Creation encapsulation."),
          t("abstract-factory", "Abstract Factory", "Families of related objects."),
          t("builder", "Builder", "Complex object construction."),
          t("prototype", "Prototype", "Cloning objects."),
          t("adapter", "Adapter", "Interface conversion."),
          t("decorator", "Decorator", "Dynamic behavior extension."),
          t("facade", "Facade", "Simplified subsystem interface."),
          t("composite", "Composite", "Tree structures."),
          t("proxy", "Proxy", "Surrogate access."),
          t("bridge", "Bridge", "Decoupling abstraction from implementation."),
          t("flyweight", "Flyweight", "Sharing fine-grained objects."),
          t("observer", "Observer", "Pub-sub inside a process."),
          t("strategy", "Strategy", "Interchangeable algorithms."),
          t("command", "Command", "Requests as objects."),
          t("state-pattern", "State", "Behavior varies with state."),
          t("template-method", "Template Method", "Skeleton in base class."),
          t("chain-of-responsibility", "Chain of Responsibility", "Handler chains."),
          t("iterator-pattern", "Iterator", "Sequential access abstraction."),
          t("mediator", "Mediator", "Reduce many-to-many coupling."),
          t("memento", "Memento", "Capture/restore state."),
          t("visitor", "Visitor", "Operations across type hierarchies."),
          t("interpreter", "Interpreter", "Grammar as classes."),
        ],
      },
      {
        slug: "architecture-styles",
        title: "Architecture Styles",
        topics: [
          t("monolith", "Monolithic Architecture", "Single deployable unit."),
          t("modular-monolith", "Modular Monolith", "Bounded modules in one process."),
          t("microservices", "Microservices", "Independently deployable services."),
          t("service-oriented", "Service-Oriented Architecture", "Enterprise SOA."),
          t("serverless", "Serverless", "Function-as-a-service compute."),
          t("layered-architecture", "Layered Architecture", "Presentation/business/data."),
          t("hexagonal", "Hexagonal (Ports & Adapters)", "Domain in the center."),
          t("clean-architecture", "Clean Architecture", "Dependency rule, use cases."),
          t("onion-architecture", "Onion Architecture", "Concentric layers."),
          t("event-driven-arch", "Event-Driven Architecture", "Events between services."),
          t("cqrs-arch", "CQRS Architecture", "Split reads and writes."),
          t("microkernel", "Microkernel", "Plugin-based systems."),
          t("space-based", "Space-Based Architecture", "Grid computing for scale."),
        ],
      },
      {
        slug: "ddd",
        title: "Domain-Driven Design",
        topics: [
          t("ddd-overview", "DDD Overview", "Model the domain, not the database."),
          t("ubiquitous-language", "Ubiquitous Language", "Shared vocabulary."),
          t("bounded-context", "Bounded Contexts", "Explicit boundaries."),
          t("entities-value-objects", "Entities & Value Objects", "Identity vs equality."),
          t("aggregates", "Aggregates & Roots", "Consistency boundaries."),
          t("repositories-ddd", "Repositories", "Persistence abstraction."),
          t("domain-services", "Domain Services", "Behavior that doesn't belong on entities."),
          t("domain-events", "Domain Events", "First-class business events."),
          t("context-mapping", "Context Mapping", "Relationships between contexts."),
        ],
      },
      {
        slug: "system-design",
        title: "System Design",
        topics: [
          t("system-design-process", "System Design Process", "Requirements to architecture."),
          t("estimation", "Back-of-Envelope Estimation", "QPS, storage, bandwidth."),
          t("designing-url-shortener", "Design a URL Shortener", "Classic system design."),
          t("designing-newsfeed", "Design a News Feed", "Fanout & timelines."),
          t("designing-chat", "Design a Chat App", "WhatsApp-like at scale."),
          t("designing-rate-limiter", "Design a Rate Limiter", "Distributed limiting."),
          t("designing-search", "Design Search", "Inverted indexes & ranking."),
          t("designing-payment", "Design a Payment System", "Idempotency & consistency."),
        ],
      },
    ],
  },
  {
    slug: "docker",
    title: "Docker",
    icon: "🐳",
    color: "oklch(0.7 0.18 220)",
    tagline: "Containers, images, networking, and Compose.",
    sections: [
      {
        slug: "basics",
        title: "Docker Basics",
        topics: [
          t("what-is-docker", "What is Docker?", "Problems it solves & value."),
          t("containers-vs-vms", "Containers vs VMs", "Isolation & performance differences."),
          t("docker-architecture", "Docker Architecture", "Daemon, client, registry."),
          t("images-vs-containers", "Images vs Containers", "Templates vs instances."),
          t("docker-cli", "Docker CLI Essentials", "run, ps, exec, logs, stop, rm."),
          t("registries", "Container Registries", "Docker Hub, GHCR, ECR."),
        ],
      },
      {
        slug: "images",
        title: "Images & Dockerfile",
        topics: [
          t("dockerfile", "Dockerfile Basics", "Instructions & build context."),
          t("dockerfile-instructions", "FROM, RUN, COPY, ADD, CMD, ENTRYPOINT", "Detailed instruction reference."),
          t("layer-caching", "Layer Caching", "Making builds fast."),
          t("multi-stage-builds", "Multi-Stage Builds", "Small final images."),
          t("image-optimization", "Image Optimization", "Distroless, Alpine, size reduction."),
          t("buildkit", "BuildKit", "Modern build engine."),
          t("image-tagging", "Tagging & Versioning", "Semantic versioning of images."),
        ],
      },
      {
        slug: "runtime",
        title: "Runtime & Networking",
        topics: [
          t("volumes", "Volumes & Bind Mounts", "Persistent storage."),
          t("networking", "Docker Networking", "Bridge, host, overlay, macvlan."),
          t("port-mapping", "Port Mapping", "Publishing container ports."),
          t("env-vars", "Environment Variables & Secrets", "Passing configuration."),
          t("resource-limits", "Resource Limits", "CPU, memory constraints."),
          t("healthchecks", "Healthchecks", "HEALTHCHECK instruction & orchestration hooks."),
          t("logging-drivers", "Logging Drivers", "json-file, syslog, fluentd."),
        ],
      },
      {
        slug: "compose-prod",
        title: "Compose & Production",
        topics: [
          t("docker-compose", "Docker Compose", "Multi-container apps in YAML."),
          t("compose-networks-volumes", "Compose Networks & Volumes", "Wiring services."),
          t("docker-in-ci", "Docker in CI/CD", "Build and push in pipelines."),
          t("security-best-practices", "Container Security", "Rootless, minimal images, scanning."),
          t("swarm-mode", "Docker Swarm", "Native clustering (context)."),
        ],
      },
    ],
  },
  {
    slug: "kubernetes",
    title: "Kubernetes",
    icon: "☸️",
    color: "oklch(0.7 0.18 250)",
    tagline: "Orchestration, workloads, networking, and operators.",
    sections: [
      {
        slug: "basics",
        title: "Basics",
        topics: [
          t("what-is-k8s", "What is Kubernetes?", "Orchestration overview."),
          t("k8s-architecture", "Architecture", "Control plane & worker nodes."),
          t("api-server", "kube-apiserver", "Central control API."),
          t("etcd", "etcd", "Cluster key-value store."),
          t("scheduler", "kube-scheduler", "Placement decisions."),
          t("controller-manager", "kube-controller-manager", "Reconciliation loops."),
          t("kubelet-kube-proxy", "kubelet & kube-proxy", "Node-level agents."),
          t("kubectl", "kubectl Basics", "get, describe, apply, exec, logs."),
        ],
      },
      {
        slug: "workloads",
        title: "Workloads",
        topics: [
          t("pods", "Pods", "Smallest deployable unit."),
          t("replicaset", "ReplicaSets", "Desired pod counts."),
          t("deployment", "Deployments", "Rolling updates & rollbacks."),
          t("statefulset", "StatefulSets", "Stable identity & storage."),
          t("daemonset", "DaemonSets", "One pod per node."),
          t("jobs-cronjobs", "Jobs & CronJobs", "Batch and scheduled workloads."),
          t("init-containers", "Init Containers", "Setup before app starts."),
          t("sidecars", "Sidecar Containers", "Companion process pattern."),
        ],
      },
      {
        slug: "networking-storage",
        title: "Networking & Storage",
        topics: [
          t("services", "Services", "ClusterIP, NodePort, LoadBalancer."),
          t("ingress", "Ingress & Ingress Controllers", "HTTP routing into the cluster."),
          t("network-policies", "Network Policies", "Pod-level firewalls."),
          t("dns-k8s", "Cluster DNS", "CoreDNS & service discovery."),
          t("configmaps", "ConfigMaps", "Non-secret configuration."),
          t("secrets", "Secrets", "Sensitive configuration."),
          t("volumes-k8s", "Volumes & PV/PVC", "Persistent storage."),
          t("storage-classes", "StorageClasses", "Dynamic provisioning."),
        ],
      },
      {
        slug: "ops",
        title: "Operations",
        topics: [
          t("rbac", "RBAC", "Role-based access control."),
          t("service-accounts", "ServiceAccounts", "Workload identity."),
          t("namespaces", "Namespaces & Quotas", "Multi-tenant isolation."),
          t("hpa", "Horizontal Pod Autoscaler", "Scale by metrics."),
          t("vpa", "Vertical Pod Autoscaler", "Rightsizing pods."),
          t("cluster-autoscaler", "Cluster Autoscaler", "Scaling node pools."),
          t("helm", "Helm", "Package manager for Kubernetes."),
          t("kustomize", "Kustomize", "Overlay-based configuration."),
          t("operators-crds", "Operators & CRDs", "Extending the API."),
          t("service-mesh", "Service Mesh", "Istio, Linkerd overview."),
          t("observability-k8s", "Observability in K8s", "Prometheus stack, Grafana, Loki."),
          t("gitops", "GitOps (Argo CD, Flux)", "Declarative deployments."),
        ],
      },
    ],
  },
  {
    slug: "aws",
    title: "AWS",
    icon: "☁️",
    color: "oklch(0.75 0.18 60)",
    tagline: "Compute, storage, networking, and managed services.",
    sections: [
      {
        slug: "fundamentals",
        title: "AWS Fundamentals",
        topics: [
          t("aws-global-infrastructure", "Global Infrastructure", "Regions, AZs, edge locations."),
          t("aws-billing", "Billing & Cost Model", "On-demand, reserved, spot, savings plans."),
          t("iam", "IAM", "Users, groups, roles, policies."),
          t("iam-best-practices", "IAM Best Practices", "Least privilege, MFA, roles over keys."),
          t("aws-cli", "AWS CLI & SDKs", "Programmatic access."),
          t("cloudformation", "CloudFormation", "Infrastructure as code."),
          t("cdk", "AWS CDK", "IaC with real programming languages."),
          t("well-architected", "Well-Architected Framework", "Five pillars overview."),
        ],
      },
      {
        slug: "compute",
        title: "Compute",
        topics: [
          t("ec2", "EC2", "Virtual servers in the cloud."),
          t("ec2-instance-types", "EC2 Instance Types", "Families & sizing."),
          t("ebs", "EBS", "Block storage for EC2."),
          t("auto-scaling", "Auto Scaling Groups", "Launch templates & scaling policies."),
          t("elb", "Elastic Load Balancing", "ALB, NLB, GWLB, CLB."),
          t("lambda", "AWS Lambda", "Serverless functions."),
          t("ecs", "ECS", "Container orchestration."),
          t("eks", "EKS", "Managed Kubernetes."),
          t("fargate", "Fargate", "Serverless containers."),
          t("beanstalk", "Elastic Beanstalk", "PaaS on AWS."),
        ],
      },
      {
        slug: "storage-db",
        title: "Storage & Databases",
        topics: [
          t("s3", "Amazon S3", "Object storage."),
          t("s3-storage-classes", "S3 Storage Classes", "Standard, IA, Glacier."),
          t("s3-security", "S3 Security", "Bucket policies, ACLs, encryption."),
          t("efs-fsx", "EFS & FSx", "Managed file systems."),
          t("rds", "Amazon RDS", "Managed relational databases."),
          t("aurora", "Aurora", "Cloud-native relational DB."),
          t("dynamodb", "DynamoDB", "Serverless NoSQL."),
          t("elasticache", "ElastiCache", "Managed Redis/Memcached."),
          t("redshift", "Redshift", "Data warehousing."),
          t("opensearch", "OpenSearch Service", "Managed search & analytics."),
        ],
      },
      {
        slug: "networking-security",
        title: "Networking & Security",
        topics: [
          t("vpc", "VPC", "Virtual private clouds."),
          t("subnets-route-tables", "Subnets & Route Tables", "Public/private subnets."),
          t("security-groups-nacls", "Security Groups & NACLs", "Stateful vs stateless firewalls."),
          t("route53", "Route 53", "Managed DNS."),
          t("cloudfront", "CloudFront", "AWS's CDN."),
          t("api-gateway", "API Gateway", "Managed APIs."),
          t("kms", "KMS", "Key management."),
          t("secrets-manager", "Secrets Manager", "Secret storage & rotation."),
          t("waf-shield", "WAF & Shield", "Web application firewall & DDoS."),
        ],
      },
      {
        slug: "messaging-monitoring",
        title: "Messaging & Monitoring",
        topics: [
          t("sqs", "SQS", "Managed queues."),
          t("sns", "SNS", "Managed pub/sub."),
          t("eventbridge", "EventBridge", "Event bus for AWS & SaaS."),
          t("kinesis", "Kinesis", "Streaming data."),
          t("cloudwatch", "CloudWatch", "Metrics, logs, alarms."),
          t("xray", "X-Ray", "Distributed tracing."),
          t("cloudtrail", "CloudTrail", "Audit logging."),
        ],
      },
    ],
  },
  {
    slug: "mongodb",
    title: "MongoDB",
    icon: "🍃",
    color: "oklch(0.7 0.18 150)",
    tagline: "Document model, indexing, aggregation, and replication.",
    sections: [
      {
        slug: "basics",
        title: "Basics",
        topics: [
          t("what-is-mongo", "What is MongoDB?", "Document database overview."),
          t("bson-json", "BSON vs JSON", "Binary encoded documents."),
          t("documents-collections", "Documents & Collections", "Data model."),
          t("mongo-shell", "mongosh", "Interactive shell."),
          t("crud", "CRUD Operations", "insert, find, update, delete."),
          t("query-operators", "Query Operators", "$eq, $in, $gt, $regex."),
          t("projection-sort", "Projection, Sort, Limit, Skip", "Shaping results."),
          t("update-operators", "Update Operators", "$set, $inc, $push, $pull."),
        ],
      },
      {
        slug: "modeling",
        title: "Data Modeling",
        topics: [
          t("embedded-vs-referenced", "Embedded vs Referenced", "Denormalization tradeoffs."),
          t("schema-design-patterns", "Schema Design Patterns", "Bucket, extended reference, subset."),
          t("polymorphic-schema", "Polymorphic Schema", "Multiple shapes in one collection."),
          t("time-series-collections", "Time Series Collections", "Native TS support."),
          t("schema-validation", "JSON Schema Validation", "Server-side rules."),
        ],
      },
      {
        slug: "indexing-perf",
        title: "Indexing & Performance",
        topics: [
          t("indexes-mongo", "Indexes", "Single, compound, multikey."),
          t("text-indexes", "Text & Wildcard Indexes", "Full-text search basics."),
          t("geo-indexes", "Geospatial Indexes", "2dsphere & 2d."),
          t("explain", "explain() & Query Plans", "Reading execution stats."),
          t("index-strategies", "Index Strategies", "ESR rule, covered queries."),
          t("performance-tuning-mongo", "Performance Tuning", "Working sets, RAM, IO."),
        ],
      },
      {
        slug: "aggregation",
        title: "Aggregation Framework",
        topics: [
          t("aggregation-pipeline", "Aggregation Pipeline", "Stages overview."),
          t("match-project-group", "$match, $project, $group", "Common stages."),
          t("lookup-unwind", "$lookup & $unwind", "Joins & array flattening."),
          t("bucket-facet", "$bucket & $facet", "Multi-faceted results."),
          t("aggregation-perf", "Aggregation Performance", "Index-aware pipelines."),
        ],
      },
      {
        slug: "ops-mongo",
        title: "Operations",
        topics: [
          t("replica-sets", "Replica Sets", "High availability."),
          t("elections", "Elections & Failover", "How primaries change."),
          t("read-preferences", "Read Preferences & Concerns", "Consistency knobs."),
          t("write-concerns", "Write Concerns", "Durability guarantees."),
          t("transactions-mongo", "Multi-Document Transactions", "ACID in MongoDB."),
          t("sharding", "Sharding", "Horizontal scaling."),
          t("shard-keys", "Choosing a Shard Key", "Cardinality & distribution."),
          t("backup-restore", "Backups & Restore", "mongodump, snapshots, PITR."),
          t("security-mongo", "Security", "Auth, TLS, encryption at rest."),
          t("atlas", "MongoDB Atlas", "Managed cloud service."),
        ],
      },
    ],
  },
  {
    slug: "redis",
    title: "Redis",
    icon: "🟥",
    color: "oklch(0.65 0.22 25)",
    tagline: "In-memory data store: caching, pub/sub, streams.",
    sections: [
      {
        slug: "basics",
        title: "Basics",
        topics: [
          t("what-is-redis", "What is Redis?", "In-memory data structure store."),
          t("redis-cli", "redis-cli", "Interacting with Redis."),
          t("keys-expiry", "Keys, TTL & Expiry", "Key namespace and expiration."),
          t("persistence-rdb-aof", "Persistence: RDB & AOF", "Durability options."),
          t("eviction", "Eviction Policies", "LRU, LFU, allkeys-*."),
          t("memory-model", "Memory Model", "How Redis uses memory."),
        ],
      },
      {
        slug: "data-structures",
        title: "Data Structures",
        topics: [
          t("strings-redis", "Strings", "SET, GET, INCR, APPEND."),
          t("lists-redis", "Lists", "LPUSH, RPUSH, LRANGE."),
          t("hashes-redis", "Hashes", "HSET, HGET, HGETALL."),
          t("sets-redis", "Sets", "SADD, SINTER, SUNION."),
          t("sorted-sets", "Sorted Sets (ZSet)", "Scores & ranking use cases."),
          t("bitmaps", "Bitmaps", "Bit-level operations."),
          t("hyperloglog", "HyperLogLog", "Approximate cardinality."),
          t("geospatial-redis", "Geospatial", "GEOADD, GEOSEARCH."),
          t("streams-redis", "Streams", "Redis Streams as a log."),
        ],
      },
      {
        slug: "features",
        title: "Features",
        topics: [
          t("pubsub-redis", "Pub/Sub", "Fire-and-forget messaging."),
          t("transactions-redis", "Transactions & MULTI/EXEC", "Atomic command batches."),
          t("scripting", "Lua Scripting", "Server-side atomic scripts."),
          t("redis-modules", "Redis Modules", "RedisJSON, RediSearch, RedisBloom."),
          t("caching-patterns", "Caching Patterns", "Read-through, cache-aside, write-through."),
          t("rate-limiter-redis", "Rate Limiting with Redis", "Token bucket implementations."),
          t("distributed-locks", "Distributed Locks (Redlock)", "Coordinating processes."),
        ],
      },
      {
        slug: "ops-redis",
        title: "Operations",
        topics: [
          t("replication-redis", "Replication", "Primary/replica setup."),
          t("sentinel", "Sentinel", "HA and failover."),
          t("cluster", "Redis Cluster", "Horizontal scaling with slots."),
          t("security-redis", "Security", "ACLs, TLS, AUTH."),
          t("monitoring-redis", "Monitoring", "INFO, SLOWLOG, latency tools."),
        ],
      },
    ],
  },
  {
    slug: "git",
    title: "Git & GitHub",
    icon: "🌿",
    color: "oklch(0.65 0.2 15)",
    tagline: "Version control, workflows, and collaboration.",
    sections: [
      {
        slug: "basics",
        title: "Git Basics",
        topics: [
          t("what-is-git", "What is Git?", "Distributed version control system."),
          t("git-installation", "Installation & Config", "git config user.name, email."),
          t("git-init-clone", "init, clone", "Starting a repo."),
          t("git-add-commit", "add, commit", "Staging & recording changes."),
          t("git-status-log", "status, log, diff", "Inspecting the repo."),
          t("gitignore", ".gitignore", "Excluding files from tracking."),
          t("git-internals", "Git Internals", "Objects, refs, HEAD, index."),
        ],
      },
      {
        slug: "branching",
        title: "Branching & Merging",
        topics: [
          t("branches", "Branches", "Lightweight movable pointers."),
          t("merge", "Merging", "Fast-forward & three-way merges."),
          t("rebase", "Rebase", "Rewriting history onto a new base."),
          t("interactive-rebase", "Interactive Rebase", "Squash, reword, drop commits."),
          t("cherry-pick", "cherry-pick", "Applying single commits."),
          t("stash", "Stash", "Shelving changes temporarily."),
          t("reset-revert", "reset vs revert vs checkout", "Undoing changes safely."),
          t("reflog", "Reflog", "Recovering lost commits."),
          t("tags", "Tags", "Marking releases."),
        ],
      },
      {
        slug: "remote",
        title: "Remotes & Collaboration",
        topics: [
          t("remotes", "Remotes", "origin, upstream, push, pull, fetch."),
          t("pull-requests", "Pull Requests / Merge Requests", "Code review workflow."),
          t("forks", "Forks", "Personal copies of repos."),
          t("workflows", "Git Workflows", "Gitflow, trunk-based, GitHub flow."),
          t("conflicts", "Merge Conflicts", "Detecting & resolving conflicts."),
          t("hooks", "Git Hooks", "pre-commit, pre-push automation."),
        ],
      },
      {
        slug: "github",
        title: "GitHub Platform",
        topics: [
          t("github-issues", "Issues & Labels", "Tracking work."),
          t("github-projects", "Projects & Milestones", "Roadmapping."),
          t("github-actions", "GitHub Actions", "CI/CD workflows."),
          t("secrets-github", "GitHub Secrets", "Storing credentials for CI."),
          t("packages", "GitHub Packages", "Publishing artifacts."),
          t("codespaces", "Codespaces", "Cloud dev environments."),
          t("code-review", "Code Review Etiquette", "Best practices for reviewers."),
        ],
      },
    ],
  },
  {
    slug: "dsa",
    title: "Data Structures & Algorithms",
    icon: "🧮",
    color: "oklch(0.7 0.18 190)",
    tagline: "Data structures, algorithms, and complexity analysis.",
    sections: [
      {
        slug: "complexity",
        title: "Complexity Analysis",
        topics: [
          t("big-o", "Big-O Notation", "Upper bound of growth."),
          t("big-theta-omega", "Big-Theta & Big-Omega", "Tight and lower bounds."),
          t("time-vs-space", "Time vs Space Complexity", "Tradeoffs."),
          t("amortized-analysis", "Amortized Analysis", "Averaging costs over operations."),
          t("recurrence-relations", "Recurrence Relations & Master Theorem", "Analyzing recursion."),
        ],
      },
      {
        slug: "linear",
        title: "Linear Data Structures",
        topics: [
          t("arrays-dsa", "Arrays", "Contiguous storage & access."),
          t("dynamic-arrays", "Dynamic Arrays", "Amortized push_back."),
          t("strings-dsa", "Strings", "Immutable text sequences."),
          t("linked-list", "Linked Lists", "Singly, doubly, circular."),
          t("stack", "Stacks", "LIFO structure."),
          t("queue", "Queues", "FIFO structure."),
          t("deque", "Deque", "Double-ended queue."),
          t("priority-queue", "Priority Queue / Heap", "Min & max heaps."),
          t("hash-tables", "Hash Tables", "Hashing, collisions, resizing."),
        ],
      },
      {
        slug: "trees",
        title: "Trees & Graphs",
        topics: [
          t("binary-tree", "Binary Trees", "Structure & traversals."),
          t("bst", "Binary Search Trees", "Ordered binary trees."),
          t("avl-tree", "AVL Trees", "Self-balancing BSTs."),
          t("red-black-tree", "Red-Black Trees", "Balanced BSTs used in libraries."),
          t("b-trees", "B-Trees & B+ Trees", "Disk-friendly balanced trees."),
          t("trie", "Trie", "Prefix trees for strings."),
          t("segment-tree", "Segment Tree", "Range queries & updates."),
          t("fenwick", "Fenwick / BIT", "Binary indexed tree."),
          t("graphs", "Graphs", "Directed, undirected, weighted."),
          t("graph-representations", "Graph Representations", "Adjacency list vs matrix."),
          t("union-find", "Union-Find / DSU", "Disjoint set data structure."),
        ],
      },
      {
        slug: "algorithms",
        title: "Algorithms",
        topics: [
          t("sorting-overview", "Sorting Overview", "Comparison & non-comparison sorts."),
          t("bubble-selection-insertion", "Bubble, Selection, Insertion Sort", "Simple O(n²) sorts."),
          t("merge-sort", "Merge Sort", "Divide & conquer O(n log n)."),
          t("quick-sort", "Quick Sort", "Partitioning based sort."),
          t("heap-sort", "Heap Sort", "In-place O(n log n)."),
          t("counting-radix", "Counting & Radix Sort", "Linear-time sorting."),
          t("binary-search", "Binary Search", "Sorted-array search."),
          t("two-pointers", "Two Pointers", "Pattern for arrays & strings."),
          t("sliding-window", "Sliding Window", "Subarray/substring pattern."),
          t("prefix-sum", "Prefix Sums", "Range sum queries."),
          t("recursion", "Recursion", "Base cases & recursive structure."),
          t("backtracking", "Backtracking", "Systematic exploration."),
          t("divide-conquer", "Divide & Conquer", "General technique."),
          t("greedy", "Greedy Algorithms", "Locally optimal choices."),
          t("dp-basics", "Dynamic Programming", "Memoization & tabulation."),
          t("dp-patterns", "DP Patterns", "Knapsack, LIS, LCS, matrix chain."),
        ],
      },
      {
        slug: "graph-algos",
        title: "Graph Algorithms",
        topics: [
          t("bfs", "BFS", "Breadth-first search."),
          t("dfs", "DFS", "Depth-first search."),
          t("topological-sort", "Topological Sort", "Ordering DAG vertices."),
          t("dijkstra", "Dijkstra's Algorithm", "Single-source shortest path."),
          t("bellman-ford", "Bellman-Ford", "Negative edge weights."),
          t("floyd-warshall", "Floyd-Warshall", "All-pairs shortest paths."),
          t("mst", "Minimum Spanning Tree", "Kruskal & Prim."),
          t("scc", "Strongly Connected Components", "Tarjan & Kosaraju."),
          t("astar", "A* Search", "Heuristic pathfinding."),
        ],
      },
      {
        slug: "advanced",
        title: "Advanced Topics",
        topics: [
          t("bit-manipulation", "Bit Manipulation", "Bitwise tricks."),
          t("string-algorithms", "String Algorithms", "KMP, Rabin-Karp, Z-algorithm."),
          t("np", "P, NP & NP-Complete", "Complexity classes."),
          t("interview-strategy", "Interview Strategy", "How to approach DSA problems."),
        ],
      },
    ],
  },
];

export type LessonRef = {
  domain: Domain;
  section: Section;
  topic: Topic;
  index: number;
  totalInDomain: number;
};

export function findLesson(slug: string): LessonRef | null {
  let count = 0;
  for (const domain of DOMAINS) {
    let idx = 0;
    const total = domain.sections.reduce((s, sec) => s + sec.topics.length, 0);
    for (const section of domain.sections) {
      for (const topic of section.topics) {
        idx++;
        count++;
        if (topic.slug === slug) {
          return { domain, section, topic, index: idx, totalInDomain: total };
        }
      }
    }
  }
  void count;
  return null;
}

export function allTopics(): Array<{ domain: Domain; section: Section; topic: Topic }> {
  const out: Array<{ domain: Domain; section: Section; topic: Topic }> = [];
  for (const domain of DOMAINS) {
    for (const section of domain.sections) {
      for (const topic of section.topics) {
        out.push({ domain, section, topic });
      }
    }
  }
  return out;
}

export function totalTopicCount() {
  return allTopics().length;
}

export function findAdjacent(slug: string) {
  const all = allTopics();
  const i = all.findIndex((x) => x.topic.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}